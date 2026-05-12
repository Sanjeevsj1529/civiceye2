import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useNavigate } from 'react-router-dom'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { useNotificationStore } from '../../store/notificationStore'
import { CATEGORY_META } from '../../utils/mockData'
import { Button, Card, Badge, ProgressBar } from '../../components/ui'
import { 
  ChevronLeft, ChevronRight, MapPin, Camera, Mic, Info, 
  CheckCircle2, Shield, AlertTriangle, Image as ImageIcon,
  Clock, Award, Trash2, Edit3, Send
} from 'lucide-react'
import { CameraModal } from '../../components/common/CameraModal'
import { FloatingOrbs } from '../../components/cinematic'
import { clsx } from 'clsx'

// Fix for default marker icons
if (typeof L !== 'undefined' && L.Marker) {
  const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
  L.Marker.prototype.options.icon = DefaultIcon
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

function LocationPicker({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

const STEPS = [
  { id: 'category', title: 'Category', icon: '📋' },
  { id: 'location', title: 'Location', icon: '📍' },
  { id: 'media', title: 'Evidence', icon: '📸' },
  { id: 'details', title: 'Details', icon: '✏️' },
  { id: 'review', title: 'Review', icon: '👁️' },
  { id: 'success', title: 'Done', icon: '🎉' },
]



export default function NewComplaint() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingMedia, setPendingMedia] = useState<File[]>([])
  const [showPreview, setShowPreview] = useState<File | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [data, setData] = useState<any>({
    category: '',
    subCategory: '',
    location: { address: '', ward: 'Select Ward', lat: 28.6139, lng: 77.2090 },
    media: [],
    title: '',
    description: '',
    severity: 5,
    isAnonymous: false,
    isCommunityReport: false,
    societyName: '',
  })
  const navigate = useNavigate()
  const { addComplaint } = useComplaintStore()
  const { addNotification } = useNotificationStore()
  const { user } = useAuthStore()

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep(s => Math.max(s - 1, 0))

  const fetchAddress = async (lat: number, lng: number) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await response.json();
      if (data && data.address) {
        // Try multiple fields to find a meaningful ward/zone name
        const ward = data.address.suburb || 
                     data.address.neighbourhood || 
                     data.address.city_district || 
                     data.address.district || 
                     data.address.residential ||
                     data.address.county || '';
        
        return {
          address: data.display_name,
          ward: ward
        };
      }
    } catch (error) {
      console.error("Reverse geocoding failed", error);
    }
    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    if (data.media.length + pendingMedia.length + files.length > 3) {
      alert("Maximum 3 images allowed.");
      return;
    }

    const newFiles = Array.from(files);
    setPendingMedia([...pendingMedia, ...newFiles]);
  };

  const handleCapture = (file: File) => {
    if (data.media.length + pendingMedia.length >= 3) {
      alert("Maximum 3 images allowed.");
      return;
    }
    setPendingMedia([...pendingMedia, file]);
  };

  const confirmUpload = async (file: File) => {
    setSaving(true);
    const timeoutId = setTimeout(() => {
      setSaving(false);
    }, 15000);

    try {
      const storageRef = ref(storage, `complaints/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setData((prev: any) => ({ ...prev, media: [...prev.media, url] }));
      setPendingMedia(prev => prev.filter(f => f !== file));
      setShowPreview(null);
    } catch (error) {
      console.error("Upload failed", error);
      alert("Failed to upload evidence. Please try again.");
    } finally {
      clearTimeout(timeoutId);
      setSaving(false);
    }
  };

  const handleLocationChange = async (lat: number, lng: number) => {
    setLoading(true);
    const geoData = await fetchAddress(lat, lng);
    setData((prev: any) => ({
      ...prev,
      location: {
        ...prev.location,
        lat,
        lng,
        address: geoData?.address || prev.location.address,
        ward: geoData?.ward || prev.location.ward
      }
    }));
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true)
    try {
      const refId = `CMP-2024-${Math.floor(Math.random() * 9000) + 1000}`
      const wardMapping: Record<string, string> = {
        'North Ward': 'w1',
        'South Ward': 'w2',
        'East Ward': 'w3',
        'West Ward': 'w4',
        'Central Ward': 'w5'
      }
      const selectedWard = data.location.ward || 'North Ward'
      const selectedWardId = wardMapping[selectedWard] || 'w1'
      
      await addComplaint({
        referenceId: refId,
        title: data.title,
        description: data.description,
        category: data.category as any,
        status: 'submitted',
        severity: data.severity as any,
        location: { 
          ...data.location, 
          ward: selectedWard,
          wardId: selectedWardId, 
          pincode: '110001' 
        },
        media: data.media.map((m: any, i: number) => ({ 
          id: `m${i}`, 
          url: m, 
          type: 'image', 
          name: `file_${i}.jpg`, 
          size: 1024, 
          createdAt: new Date().toISOString() 
        })),
        witnesses: [],
        timeline: [{ 
          id: `t_${Date.now()}`, 
          status: 'submitted', 
          timestamp: new Date().toISOString(), 
          actor: user?.name || 'Citizen', 
          actorRole: 'citizen', 
          note: 'Complaint submitted' 
        }],
        comments: [],
        ward: selectedWard,
        wardId: selectedWardId,
        citizenId: user?.id,
        citizenName: user?.name,
        citizenPhone: user?.phone || '',
        upvotes: 0,
        tags: [data.category],
        estimatedResolutionDays: 3,
        slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rewardPoints: 25,
        isAnonymous: data.isAnonymous,
        isRecurring: false,
        isCommunityReport: data.isCommunityReport || false,
        societyName: data.societyName || '',
      })

      // Send notifications to admins
      await addNotification({
        userId: 'admin_global',
        title: 'New Complaint Reported',
        message: `A new ${data.category} issue has been reported: ${data.title}`,
        type: 'status_change',
        referenceId: refId
      });

      await addNotification({
        userId: `ward_${selectedWardId}`,
        title: 'New Ward Report',
        message: `New complaint in your ward: ${data.title}`,
        type: 'status_change',
        referenceId: refId
      });
      
      setStep(5)
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-20 pt-24 px-6">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-indigo/[0.07] via-transparent to-transparent dark:from-brand-indigo/12" />
      <FloatingOrbs className="opacity-80" />
      <div className="relative z-[1] max-w-[1600px] mx-auto">
        {/* Progress Tracker */}
        {step < 5 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between mb-4">
              {STEPS.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300',
                    step === i ? 'bg-primary-500 text-slate-900 dark:text-white ring-4 ring-primary-500/20' : step > i ? 'bg-primary-500/20 text-primary-400' : 'bg-slate-50 dark:bg-white/5 text-slate-600 border border-slate-200 dark:border-white/5'
                  )}>
                    {step > i ? <CheckCircle2 size={24} /> : s.icon}
                  </div>
                  <span className={clsx('text-[10px] font-bold uppercase tracking-widest', step >= i ? 'text-slate-900 dark:text-white' : 'text-slate-600')}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
            <ProgressBar value={(step / 4) * 100} />
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="glass-premium p-8 border-white/12 bg-slate-50/90 dark:bg-white/[0.06] min-h-[500px] flex flex-col shadow-glow-lg">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">How are you reporting?</h2>
                    <p className="text-slate-500 mb-8 text-sm">Individual reports are for personal issues. Society reports gather area-wide attention faster.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                      <button
                        onClick={() => setData({...data, isCommunityReport: false})}
                        className={clsx(
                          'flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left group',
                          !data.isCommunityReport 
                            ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-white/10'
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">👤</div>
                        <div>
                          <p className={clsx('text-lg font-black', !data.isCommunityReport ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>Individual Report</p>
                          <p className="text-xs text-slate-500 mt-1">Standard report for single concerns.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setData({...data, isCommunityReport: true})}
                        className={clsx(
                          'flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left group',
                          data.isCommunityReport 
                            ? 'bg-brand-rose/10 border-brand-rose shadow-glow-rose' 
                            : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-white/10'
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏘️</div>
                        <div>
                          <p className={clsx('text-lg font-black', data.isCommunityReport ? 'text-brand-rose' : 'text-slate-400')}>Society / Area Report</p>
                          <p className="text-xs text-slate-500 mt-1">Collective voice for high-priority fixes.</p>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence>
                      {data.isCommunityReport && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mb-10"
                        >
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Society / Area Name</label>
                          <input 
                            placeholder="e.g. Green Valley Apartments, Sector 15 Residents"
                            className="w-full bg-slate-100 dark:bg-dark-950/50 border border-brand-rose/20 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-brand-rose/50 outline-none transition-all"
                            value={data.societyName}
                            onChange={e => setData({...data, societyName: e.target.value})}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Select Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <button
                          key={key}
                          onClick={() => setData({...data, category: key})}
                          className={clsx(
                            'flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 group',
                            data.category === key 
                              ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-white/10'
                          )}
                        >
                          <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{meta.icon}</span>
                          <span className={clsx('text-[10px] font-bold uppercase tracking-widest', data.category === key ? 'text-primary-400' : 'text-slate-400')}>
                            {meta.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Pin Location</h2>
                    <p className="text-slate-500 mb-8 text-sm">Where exactly is this happening? You can use your current location.</p>
                    
                    <div className="space-y-6">
                      <div className="h-80 rounded-3xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/10 relative overflow-hidden shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] ring-1 ring-white/5">
                        <MapContainer 
                          center={[data.location.lat, data.location.lng]} 
                          zoom={13} 
                          className="h-full w-full"
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          <Marker position={[data.location.lat, data.location.lng]} />
                          <LocationPicker onLocationSelect={handleLocationChange} />
                          <MapController center={[data.location.lat, data.location.lng]} />
                        </MapContainer>
                        <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            className="bg-white/90 dark:bg-dark-900/90 text-primary-600 dark:text-primary-400 font-bold"
                            onClick={() => window.open(`https://www.google.com/maps?q=${data.location.lat},${data.location.lng}`, '_blank')}
                          >
                            🗺️ Google Maps
                          </Button>
                          <Button 
                            size="sm" 
                            isLoading={loading}
                            className="bg-slate-100 dark:bg-dark-950/95 text-slate-900 dark:text-white"
                            onClick={() => {
                              navigator.geolocation.getCurrentPosition(async (pos) => {
                                await handleLocationChange(pos.coords.latitude, pos.coords.longitude);
                              });
                            }}
                          >
                            📍 Auto-Detect GPS
                          </Button>
                        </div>
                        <div className="absolute top-4 left-4 z-[1000] bg-slate-100 dark:bg-dark-950/80 px-3 py-1.5 rounded-xl border border-white/10 text-[10px] text-slate-900 dark:text-white font-bold uppercase tracking-widest">
                          Click map to pin exact spot
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Address</label>
                          <textarea 
                            placeholder="Street name, landmark, building number..."
                            className="w-full bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-primary-500/50 outline-none transition-all resize-none"
                            rows={3}
                            value={data.location.address}
                            onChange={e => setData({...data, location: {...data.location, address: e.target.value}})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward / Zone</label>
                              <select 
                                className="w-full bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
                                value={data.location.ward}
                                onChange={e => setData({...data, location: {...data.location, ward: e.target.value}})}
                              >
                                <option value="Select Ward" disabled>Select Ward</option>
                                {data.location.ward && data.location.ward !== 'Select Ward' && (
                                  <option value={data.location.ward}>{data.location.ward} (Detected)</option>
                                )}
                                <option value="North Ward">North Ward</option>
                                <option value="South Ward">South Ward</option>
                                <option value="East Ward">East Ward</option>
                                <option value="West Ward">West Ward</option>
                                <option value="Central Ward">Central Ward</option>
                              </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Upload Evidence</h2>
                    <p className="text-slate-500 mb-8 text-sm">Visuals help officers understand and resolve issues faster.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 relative">
                      {saving && (
                        <div className="absolute inset-0 z-20 bg-dark-950/80 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-8 overflow-hidden">
                          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-4 max-w-[200px]">
                            <motion.div 
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                              className="w-full h-full bg-primary-500"
                            />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Uploading Evidence...</span>
                        </div>
                      )}
                      
                      <button 
                        onClick={() => setShowCamera(true)}
                        disabled={saving || (data.media.length + pendingMedia.length) >= 3}
                        className="group flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-300/80 dark:border-neon-cyan/25 bg-slate-50/90 dark:bg-white/[0.04] hover:border-brand-indigo/40 hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-glow-blue transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Camera size={32} className="text-primary-500 mb-3" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Capture Photo</span>
                      </button>

                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        id="upload-gallery" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label 
                        onClick={() => document.getElementById('upload-gallery')?.click()}
                        className={clsx(
                          "group flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-slate-300/80 dark:border-brand-violet/30 bg-slate-50/90 dark:bg-white/[0.04] hover:border-brand-violet/50 hover:bg-white/80 dark:hover:bg-white/[0.08] hover:shadow-glow-violet transition-all duration-300 cursor-pointer",
                          (saving || (data.media.length + pendingMedia.length) >= 3) && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        <ImageIcon size={32} className="text-violet-500 mb-3" />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">Upload Gallery</span>
                      </label>
                    </div>

                    {/* Pending Previews */}
                    {(pendingMedia.length > 0 || data.media.length > 0) && (
                      <div className="flex flex-wrap gap-4 mb-8">
                        {data.media.map((url: string, idx: number) => (
                          <div key={idx} className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-emerald-500">
                            <img src={url} className="w-full h-full object-cover" alt="Evidence" />
                            <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                              <CheckCircle2 size={24} className="text-white" />
                            </div>
                          </div>
                        ))}
                        {pendingMedia.map((file: File, idx: number) => (
                          <button 
                            key={`pending-${idx}`}
                            onClick={() => setShowPreview(file)}
                            className="relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ring-primary-500 animate-pulse group"
                          >
                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover opacity-60" alt="Pending" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] font-black text-white uppercase bg-primary-500 px-2 py-0.5 rounded-full">Review</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-6">Max 3 high-quality images · {data.media.length + pendingMedia.length}/3 Slots Used</p>

                    <div className="p-4 rounded-2xl bg-brand-rose/5 border border-brand-rose/10 flex gap-3">
                      <AlertTriangle size={18} className="text-brand-rose shrink-0" />
                      <p className="text-[10px] text-brand-rose leading-relaxed font-medium uppercase tracking-tight">
                        IMPORTANT: Please ensure photos are clear and show the issue in context of its surroundings. Max 10MB per file.
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs text-slate-400 hover:text-slate-900 dark:text-white transition-all">
                        <Mic size={14} /> Add Voice Note
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Provide Details</h2>
                    <p className="text-slate-500 mb-8 text-sm">Add a title and detailed description to your report.</p>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Issue Title</label>
                        <input 
                          placeholder="Short summary (e.g., Pothole near Central Market)"
                          className="w-full bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary-500/50 outline-none transition-all"
                          value={data.title}
                          onChange={e => setData({...data, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Detailed Description</label>
                        <textarea 
                          placeholder="Describe the issue, when did it start, how is it affecting traffic/residents..."
                          className="w-full bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-primary-500/50 outline-none transition-all resize-none"
                          rows={6}
                          value={data.description}
                          onChange={e => setData({...data, description: e.target.value})}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-primary-500">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">Anonymous Report</p>
                            <p className="text-[10px] text-slate-500">Hide your identity from public</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => setData({...data, isAnonymous: !data.isAnonymous})}
                          className={clsx(
                            'w-12 h-6 rounded-full p-1 transition-all duration-300',
                            data.isAnonymous ? 'bg-primary-500' : 'bg-dark-700'
                          )}
                        >
                          <div className={clsx('w-4 h-4 bg-white rounded-full transition-all', data.isAnonymous ? 'translate-x-6' : 'translate-x-0')} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Review Report</h2>
                    <p className="text-slate-500 mb-8 text-sm">Please confirm all details are correct before submitting.</p>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Category', value: data.category ? CATEGORY_META[data.category as keyof typeof CATEGORY_META].label : 'Not selected', icon: '📋' },
                        { label: 'Location', value: data.location.address || 'GPS Location', icon: '📍' },
                        { label: 'Severity', value: `Level ${data.severity}/10`, icon: '⚠️' },
                        { label: 'Identity', value: data.isAnonymous ? 'Anonymous' : user?.name, icon: '🛡️' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-primary-500/10 border border-primary-500/20 text-center">
                      <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-1">Estimated Resolution</p>
                      <h4 className="text-2xl font-black text-slate-900 dark:text-white font-display">48-72 Hours</h4>
                      <p className="text-[10px] text-slate-500 mt-2">You will earn <span className="text-primary-400 font-bold">+25 reward points</span> upon resolution.</p>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/20 flex items-center justify-center text-5xl mb-6 shadow-glow-emerald animate-bounce">
                      ✅
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight">Complaint Filed <br />Successfully!</h2>
                    <p className="text-slate-500 mb-10 max-w-sm">
                      Your report has been received and assigned to the North Ward department. You can track it live now.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                      <Button className="flex-1" size="lg" glow onClick={() => navigate('/dashboard/citizen')}>
                        Go to Dashboard
                      </Button>
                      <Button variant="secondary" className="flex-1" size="lg" onClick={() => setStep(0)}>
                        File Another
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {step < 5 && (
                <div className="mt-auto pt-10 flex gap-4">
                  {step > 0 && (
                    <Button variant="outline" className="flex-1" size="lg" onClick={handleBack}>
                      <ChevronLeft size={18} className="mr-2" /> Back
                    </Button>
                  )}
                  <Button 
                    className={clsx('flex-[2]', step === 0 ? 'w-full' : '')} 
                    size="lg" 
                    glow={step === 4}
                    isLoading={loading}
                    disabled={step === 0 && !data.category}
                    onClick={step === 4 ? handleSubmit : handleNext}
                  >
                    {step === 4 ? 'Submit Report' : 'Continue'} <ChevronRight size={18} className="ml-2" />
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar Tips */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                <Info size={16} className="text-primary-400" /> Pro Tips
              </h3>
              <ul className="space-y-4">
                {[
                  { icon: <Clock size={14} />, text: 'Reporting early helps prevent issue escalation.' },
                  { icon: <ImageIcon size={14} />, text: 'Multiple angles in photos help officers locate the exact spot.' },
                  { icon: <Award size={14} />, text: 'Top contributors earn "Civic Ambassador" badges.' },
                ].map((tip, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-slate-500 shrink-0 mt-0.5">{tip.icon}</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-medium">{tip.text}</p>
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="p-6 border-primary-500/10 bg-primary-500/5">
              <div className="flex items-center gap-3 mb-4">
                <Shield size={20} className="text-primary-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Safe Community</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                CivicEye is a platform for genuine public concern. All submissions are monitored. 
                Spam or false reporting may result in account suspension.
              </p>
            </Card>
          </div>
        </div>
        {/* Preview Modal */}
        <AnimatePresence>
          {showPreview && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                onClick={() => setShowPreview(null)}
                className="absolute inset-0 bg-dark-950/90 backdrop-blur-lg"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-dark-900 border border-white/10 p-4 rounded-[40px] max-w-lg w-full relative z-10"
              >
                <div className="aspect-square rounded-[32px] overflow-hidden mb-6">
                  <img src={URL.createObjectURL(showPreview)} className="w-full h-full object-cover" alt="Preview" />
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    setPendingMedia(prev => prev.filter(f => f !== showPreview));
                    setShowPreview(null);
                  }}>Remove</Button>
                  <Button className="flex-[2]" onClick={() => confirmUpload(showPreview)}>Confirm to Upload</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
      {showCamera && <CameraModal onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
    </div>
  )
}
