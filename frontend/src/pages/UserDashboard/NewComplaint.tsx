import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_META } from '../../utils/mockData'
import { Button, Card, Badge, ProgressBar } from '../../components/ui'
import { 
  ChevronLeft, ChevronRight, MapPin, Camera, Mic, Info, 
  CheckCircle2, Shield, AlertTriangle, Image as ImageIcon,
  Clock, Award, Trash2, Edit3, Send
} from 'lucide-react'
import { clsx } from 'clsx'

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
  const [data, setData] = useState<any>({
    category: '',
    subCategory: '',
    location: { address: '', ward: '', lat: 28.6139, lng: 77.2090 },
    media: [],
    title: '',
    description: '',
    severity: 5,
    isAnonymous: false,
  })
  const navigate = useNavigate()
  const { addComplaint } = useComplaintStore()
  const { user } = useAuthStore()

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handleBack = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 2000))
    const refId = `CMP-2024-${Math.floor(Math.random() * 9000) + 1000}`
    
    addComplaint({
      id: `c_${Date.now()}`,
      referenceId: refId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      status: 'submitted',
      severity: data.severity as any,
      location: { ...data.location, wardId: 'w1', pincode: '110001' },
      media: data.media.map((m: any, i: number) => ({ id: `m${i}`, url: m, type: 'image', name: `file_${i}.jpg`, size: 1024, createdAt: new Date().toISOString() })),
      witnesses: [],
      timeline: [{ id: 't1', status: 'submitted', timestamp: new Date().toISOString(), actor: user?.name || 'Citizen', actorRole: 'citizen', note: 'Complaint submitted' }],
      comments: [],
      ward: data.location.ward || 'North Ward',
      wardId: 'w1',
      citizenId: user?.id || 'u1',
      citizenName: user?.name || 'Citizen',
      citizenPhone: user?.phone || '9876543210',
      upvotes: 0,
      tags: [data.category],
      estimatedResolutionDays: 3,
      slaDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      rewardPoints: 25,
      isAnonymous: data.isAnonymous,
      isRecurring: false,
      isCommunityReport: data.isCommunityReport,
      societyName: data.societyName,
    })
    
    setStep(5)
    setLoading(false)
  }

  return (
    <div className="min-h-screen pb-20 pt-24 px-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Progress Tracker */}
        {step < 5 && (
          <div className="mb-10 px-4">
            <div className="flex items-center justify-between mb-4">
              {STEPS.slice(0, 5).map((s, i) => (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <div className={clsx(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold transition-all duration-300',
                    step === i ? 'bg-primary-500 text-white ring-4 ring-primary-500/20' : step > i ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-slate-600 border border-white/5'
                  )}>
                    {step > i ? <CheckCircle2 size={24} /> : s.icon}
                  </div>
                  <span className={clsx('text-[10px] font-bold uppercase tracking-widest', step >= i ? 'text-white' : 'text-slate-600')}>
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
            <Card className="p-8 border-white/10 bg-white/5 min-h-[500px] flex flex-col">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-white mb-2">How are you reporting?</h2>
                    <p className="text-slate-500 mb-8 text-sm">Individual reports are for personal issues. Society reports gather area-wide attention faster.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                      <button
                        onClick={() => setData({...data, isCommunityReport: false})}
                        className={clsx(
                          'flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left group',
                          !data.isCommunityReport 
                            ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">👤</div>
                        <div>
                          <p className={clsx('text-lg font-black', !data.isCommunityReport ? 'text-white' : 'text-slate-400')}>Individual Report</p>
                          <p className="text-xs text-slate-500 mt-1">Standard report for single concerns.</p>
                        </div>
                      </button>

                      <button
                        onClick={() => setData({...data, isCommunityReport: true})}
                        className={clsx(
                          'flex items-center gap-6 p-6 rounded-[2rem] border transition-all duration-300 text-left group',
                          data.isCommunityReport 
                            ? 'bg-brand-rose/10 border-brand-rose shadow-glow-rose' 
                            : 'bg-white/5 border-white/5 hover:border-white/10'
                        )}
                      >
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">🏘️</div>
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
                            className="w-full bg-dark-950/50 border border-brand-rose/20 rounded-xl px-4 py-3 text-sm text-white focus:border-brand-rose/50 outline-none transition-all"
                            value={data.societyName}
                            onChange={e => setData({...data, societyName: e.target.value})}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <h2 className="text-xl font-black text-white mb-6">Select Category</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(CATEGORY_META).map(([key, meta]) => (
                        <button
                          key={key}
                          onClick={() => setData({...data, category: key})}
                          className={clsx(
                            'flex flex-col items-center justify-center p-6 rounded-3xl border transition-all duration-300 group',
                            data.category === key 
                              ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                              : 'bg-white/5 border-white/5 hover:border-white/10'
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
                    <h2 className="text-2xl font-black text-white mb-2">Pin Location</h2>
                    <p className="text-slate-500 mb-8 text-sm">Where exactly is this happening? You can use your current location.</p>
                    
                    <div className="space-y-6">
                      <div className="h-64 rounded-3xl bg-dark-900 border border-white/5 relative overflow-hidden flex items-center justify-center">
                        <MapPin size={40} className="text-primary-500 animate-bounce" />
                        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
                        <Button size="sm" className="absolute bottom-4 right-4 bg-dark-950/95">
                          📍 Use My GPS
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Address</label>
                          <textarea 
                            placeholder="Street name, landmark, building number..."
                            className="w-full bg-dark-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-primary-500/50 outline-none transition-all resize-none"
                            rows={3}
                            value={data.location.address}
                            onChange={e => setData({...data, location: {...data.location, address: e.target.value}})}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward / Zone</label>
                            <select 
                              className="w-full bg-dark-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white outline-none"
                              value={data.location.ward}
                              onChange={e => setData({...data, location: {...data.location, ward: e.target.value}})}
                            >
                              <option value="">Detecting...</option>
                              <option value="North Ward">North Ward</option>
                              <option value="South Ward">South Ward</option>
                              <option value="East Ward">East Ward</option>
                              <option value="West Ward">West Ward</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-white mb-2">Upload Evidence</h2>
                    <p className="text-slate-500 mb-8 text-sm">Visuals help officers understand and resolve issues faster.</p>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button className="flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <Camera size={32} className="text-primary-500 mb-3" />
                        <span className="text-xs font-bold text-white">Capture Photo</span>
                      </button>
                      <button className="flex flex-col items-center justify-center p-8 rounded-3xl border border-dashed border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                        <ImageIcon size={32} className="text-violet-500 mb-3" />
                        <span className="text-xs font-bold text-white">Upload Gallery</span>
                      </button>
                    </div>

                    <div className="p-4 rounded-2xl bg-brand-rose/5 border border-brand-rose/10 flex gap-3">
                      <AlertTriangle size={18} className="text-brand-rose shrink-0" />
                      <p className="text-[10px] text-brand-rose leading-relaxed font-medium uppercase tracking-tight">
                        IMPORTANT: Please ensure photos are clear and show the issue in context of its surroundings. Max 10MB per file.
                      </p>
                    </div>

                    <div className="mt-8 flex items-center gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-400 hover:text-white transition-all">
                        <Mic size={14} /> Add Voice Note
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <h2 className="text-2xl font-black text-white mb-2">Provide Details</h2>
                    <p className="text-slate-500 mb-8 text-sm">Add a title and detailed description to your report.</p>
                    
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Issue Title</label>
                        <input 
                          placeholder="Short summary (e.g., Pothole near Central Market)"
                          className="w-full bg-dark-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:border-primary-500/50 outline-none transition-all"
                          value={data.title}
                          onChange={e => setData({...data, title: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Detailed Description</label>
                        <textarea 
                          placeholder="Describe the issue, when did it start, how is it affecting traffic/residents..."
                          className="w-full bg-dark-950/50 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-primary-500/50 outline-none transition-all resize-none"
                          rows={6}
                          value={data.description}
                          onChange={e => setData({...data, description: e.target.value})}
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-dark-950 flex items-center justify-center text-primary-500">
                            <Shield size={16} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white">Anonymous Report</p>
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
                    <h2 className="text-2xl font-black text-white mb-2">Review Report</h2>
                    <p className="text-slate-500 mb-8 text-sm">Please confirm all details are correct before submitting.</p>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Category', value: data.category ? CATEGORY_META[data.category as keyof typeof CATEGORY_META].label : 'Not selected', icon: '📋' },
                        { label: 'Location', value: data.location.address || 'GPS Location', icon: '📍' },
                        { label: 'Severity', value: `Level ${data.severity}/10`, icon: '⚠️' },
                        { label: 'Identity', value: data.isAnonymous ? 'Anonymous' : user?.name, icon: '🛡️' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{item.icon}</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                          </div>
                          <span className="text-sm font-bold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 p-6 rounded-3xl bg-primary-500/10 border border-primary-500/20 text-center">
                      <p className="text-xs text-primary-400 font-bold uppercase tracking-widest mb-1">Estimated Resolution</p>
                      <h4 className="text-2xl font-black text-white font-display">48-72 Hours</h4>
                      <p className="text-[10px] text-slate-500 mt-2">You will earn <span className="text-primary-400 font-bold">+25 reward points</span> upon resolution.</p>
                    </div>
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div key="step5" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center text-center py-10">
                    <div className="w-24 h-24 rounded-[2.5rem] bg-emerald-500/20 flex items-center justify-center text-5xl mb-6 shadow-glow-emerald animate-bounce">
                      ✅
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 leading-tight">Complaint Filed <br />Successfully!</h2>
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
            <Card className="p-6 border-white/5 bg-white/5">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
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
                <h3 className="text-sm font-bold text-white">Safe Community</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                CivicEye is a platform for genuine public concern. All submissions are monitored. 
                Spam or false reporting may result in account suspension.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
