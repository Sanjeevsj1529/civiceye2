import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useParams, Link } from 'react-router-dom'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_META, STATUS_META } from '../../utils/mockData'
import { Button, Card, Badge, Avatar, ProgressBar } from '../../components/ui'
import { 
  ChevronLeft, Clock, MapPin, User, MessageSquare, 
  Share2, AlertCircle, CheckCircle2, TrendingUp, 
  Calendar, Shield, MoreHorizontal, Send, Phone
} from 'lucide-react'
import { clsx } from 'clsx'
import { FloatingOrbs } from '../../components/cinematic'
import { format, formatDistanceToNow } from 'date-fns'

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

export default function ComplaintTracking() {
  const { id } = useParams()
  const { user } = useAuthStore()
  const { complaints, addComment, upvoteComplaint, initializeComplaints, isLoading } = useComplaintStore()
  const [commentText, setCommentText] = useState('')
  const [activeTab, setActiveTab] = useState<'timeline' | 'details' | 'chat'>('timeline')

  useEffect(() => {
    const unsubscribe = initializeComplaints();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initializeComplaints]);

  // Find complaint by referenceId or id
  const complaint = complaints.find(c => c.referenceId === id || c.id === id)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-dark-950 pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Fetching Report Intel...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-100 dark:bg-dark-950">
        <div className="text-6xl mb-6">🔍</div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Complaint Not Found</h2>
        <p className="text-slate-500 mb-8">We couldn't find a report with reference ID <span className="text-slate-900 dark:text-white font-mono">{id}</span></p>
        <Link to="/dashboard/citizen"><Button>Back to Dashboard</Button></Link>
      </div>
    )
  }

  const meta = CATEGORY_META[complaint.category as keyof typeof CATEGORY_META] || CATEGORY_META.other;
  const statusMeta = STATUS_META[complaint.status as keyof typeof STATUS_META] || STATUS_META.submitted;

  const handleAddComment = () => {
    if (!commentText.trim() || !user) return
    addComment(complaint.id, commentText, user.id, user.name, user.role || 'citizen', complaint.citizenId, complaint.referenceId)
    setCommentText('')
  }

  return (
    <div className="min-h-screen pb-20 pt-32 px-6 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-brand-indigo/[0.06] via-transparent to-transparent dark:from-brand-indigo/12" />
      <FloatingOrbs className="z-0 opacity-75" />
      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.1] pointer-events-none">
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-0 left-0 w-full h-full bg-dots [background-size:40px_40px] animate-grid-pan" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Back Link */}
        <Link 
          to="/dashboard/citizen" 
          className="inline-flex items-center gap-3 text-[10px] font-black text-slate-500 hover:text-brand-indigo dark:text-slate-400 mb-12 transition-all uppercase tracking-[0.2em]"
        >
          <ChevronLeft size={14} /> Return to Mission Control
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Panel: 8 Cols */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header Card */}
            <Card className="p-10 border-2 border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 relative overflow-hidden shadow-soft">
              <div className="absolute top-0 right-0 p-6">
                <Badge className={clsx(
                  'px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-handcrafted border-none',
                  statusMeta.bg === 'bg-emerald-500/10' ? 'bg-emerald-500 text-white' : 
                  statusMeta.bg === 'bg-amber-500/10' ? 'bg-amber-500 text-white' : 
                  'bg-brand-indigo text-white'
                )}>
                  {statusMeta.label}
                </Badge>
              </div>
              
              <div className="flex flex-col md:flex-row items-start gap-10">
                <div className="w-32 h-32 rounded-handcrafted bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-6xl shadow-inner border-2 border-slate-200 dark:border-white/5 relative overflow-hidden group shrink-0">
                  {complaint.media && complaint.media[0] ? (
                    <img 
                      src={complaint.media[0].url} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                      alt="Primary evidence" 
                    />
                  ) : (
                    <span className="grayscale opacity-50">{meta.icon}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.3em]">{complaint.referenceId}</span>
                    <div className="h-px w-8 bg-slate-200 dark:bg-white/10" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{complaint.createdAt ? format(new Date(complaint.createdAt), 'MMM d, yyyy') : 'Recently'}</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-black text-brand-navy dark:text-white mb-6 tracking-tighter leading-[0.95]">
                    {complaint.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-8">
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold">
                      <MapPin size={16} className="text-brand-indigo" /> {complaint.location.address}
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs font-bold">
                      <Shield size={16} className="text-brand-indigo" /> Severity {complaint.severity}/10
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-12 pt-10 border-t-2 border-slate-100 dark:border-white/5 flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="xl" onClick={() => user && upvoteComplaint(complaint.id, user.id)} className="btn-handcrafted px-8 border-2 border-brand-navy dark:border-white/20 text-brand-navy dark:text-white">
                    👍 <span className="font-black ml-2">{complaint.upvotes} Upvotes</span>
                  </Button>
                  <Button variant="ghost" size="xl" className="btn-handcrafted text-brand-indigo font-black uppercase tracking-widest text-[10px]">
                    <Share2 size={18} className="mr-3" /> Copy Case Link
                  </Button>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="px-5 py-2 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Est. Completion</p>
                    <p className="text-xs font-black text-brand-navy dark:text-white mt-0.5">{complaint.estimatedResolutionDays} Days Remaining</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-3">
              {[
                { id: 'timeline', label: 'Mission Log', icon: <Clock size={16} /> },
                { id: 'details', label: 'Evidence', icon: <AlertCircle size={16} /> },
                { id: 'chat', label: 'Field Comms', icon: <MessageSquare size={16} /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={clsx(
                    'flex items-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border-2',
                    activeTab === t.id 
                      ? 'bg-brand-navy text-white border-brand-navy dark:bg-white dark:text-brand-navy dark:border-white shadow-handcrafted' 
                      : 'text-slate-500 border-slate-200 dark:border-white/5 hover:border-brand-indigo dark:hover:border-white/20'
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'timeline' && (
                <motion.div 
                  key="timeline" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-8"
                >
                  {complaint.timeline?.map((event, i) => (
                    <div key={event.id} className="relative pl-16 pb-4">
                      {/* Line */}
                      {i < (complaint.timeline?.length || 0) - 1 && (
                        <div className="absolute left-[31px] top-12 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-brand-indigo/60 via-neon-cyan/35 to-slate-100/80 dark:from-brand-indigo dark:via-neon-cyan/40 dark:to-white/10 shadow-[0_0_12px_rgba(79,70,229,0.35)]" />
                      )}
                      
                      {/* Icon Node */}
                      <div className={clsx(
                        'absolute left-0 top-0 w-16 h-16 rounded-xl flex items-center justify-center text-2xl border-2 transition-all duration-300',
                        i === 0 
                          ? 'bg-brand-navy text-white border-brand-indigo/80 dark:bg-gradient-to-br dark:from-brand-indigo dark:to-violet-700 shadow-glow-blue ring-2 ring-brand-indigo/30 animate-pulse-glow' 
                          : 'bg-white dark:bg-dark-950 text-slate-400 border-slate-200 dark:border-white/10 shadow-soft hover:border-brand-indigo/40'
                      )}>
                        {event.status === 'submitted' ? '📥' : event.status === 'assigned' ? '👤' : event.status === 'resolved' ? '✅' : '⚙️'}
                      </div>

                      <div className="glass-premium border border-white/12 bg-white/95 dark:bg-white/[0.06] rounded-2xl p-8 hover:border-brand-indigo/45 hover:shadow-glow-blue transition-all duration-500 group relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-xs font-black text-brand-navy dark:text-white uppercase tracking-[0.2em]">{event.status.replace('_', ' ')}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.timestamp ? format(new Date(event.timestamp), 'MMM d · h:mm a') : 'Now'}</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium leading-relaxed">{event.note}</p>
                        
                        {/* Evidence Thumbnails */}
                        {event.status === 'submitted' && complaint.media && complaint.media.length > 0 && (
                          <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            {complaint.media.map(m => (
                              <div key={m.id} className="w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-100 dark:border-white/5 shrink-0 group/img cursor-pointer">
                                <img src={m.url} className="w-full h-full object-cover transition-transform group-hover/img:scale-110" alt="Evidence preview" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-3 pt-6 border-t border-slate-100 dark:border-white/5">
                          <Avatar name={event.actor} size="sm" className="w-8 h-8 rounded-lg shadow-sm" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-brand-navy dark:text-slate-300 uppercase tracking-tighter">{event.actor}</span>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{event.actorRole}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'details' && (
                <motion.div 
                  key="details" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <Card className="p-8 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Description</h3>
                    <p className="text-slate-400 leading-relaxed mb-10">{complaint.description}</p>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Reported Evidence</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {complaint.media && complaint.media.length > 0 ? (
                        complaint.media.map(m => (
                          <div key={m.id} className="aspect-square rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 group cursor-pointer relative">
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="text-[10px] font-bold text-white uppercase tracking-widest">View Full</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                          <p className="text-slate-500 text-sm font-medium">No visual evidence attached to this report.</p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div 
                  key="chat" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col h-[600px] glass rounded-3xl overflow-hidden border-slate-200 dark:border-white/5"
                >
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">Officer Ramesh Kumar</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Assigned Responder</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-xl"><Phone size={14} /></Button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    <div className="flex justify-center">
                      <Badge className="bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/5 text-slate-600">Chat started on {format(new Date(complaint.createdAt), 'MMM d')}</Badge>
                    </div>
                    
                    {complaint.comments?.map(c => (
                      <div key={c.id} className={clsx('flex flex-col', c.authorRole === 'citizen' ? 'items-end' : 'items-start')}>
                        <div className={clsx(
                          'max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed',
                          c.authorRole === 'citizen' ? 'bg-primary-500 text-slate-900 dark:text-white rounded-tr-none' : 'bg-white/10 text-slate-300 rounded-tl-none'
                        )}>
                          {c.text}
                        </div>
                        <span className="text-[10px] text-slate-600 font-bold mt-2 uppercase tracking-tighter">
                          {c.authorName} · {formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-4 bg-slate-100 dark:bg-dark-950 border-t border-slate-200 dark:border-white/5 flex gap-3">
                    <input 
                      placeholder="Type a message to the officer..."
                      className="flex-1 bg-slate-50 dark:bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-primary-500/50 outline-none transition-all"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button size="sm" className="px-5" onClick={handleAddComment}>
                      <Send size={16} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: 4 Cols */}
          <div className="lg:col-span-4 space-y-6">
            {/* Resolution Progress */}
            <Card className="p-8 border-white/10 bg-slate-50 dark:bg-white/5 text-center">
              <div className="w-20 h-20 rounded-[2rem] bg-primary-500/10 flex items-center justify-center text-4xl mx-auto mb-6 shadow-glow-blue border border-primary-500/10">
                ⏱️
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Resolving Soon</h3>
              <p className="text-sm text-slate-500 mb-8">Estimated resolution by Friday, 6:00 PM</p>
              <div className="space-y-4">
                <ProgressBar value={40} showLabel />
                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                  <span className={clsx(complaint.status === 'submitted' && 'text-primary-500')}>Received</span>
                  <span className={clsx(complaint.status === 'assigned' && 'text-primary-500')}>Confirming</span>
                  <span className={clsx(complaint.status === 'in_progress' && 'text-primary-500')}>Assigning</span>
                  <span className={clsx(complaint.status === 'in_progress' && 'text-primary-500')}>On Field</span>
                  <span className={clsx(complaint.status === 'resolved' && 'text-primary-500')}>Resolved</span>
                </div>
              </div>
            </Card>

            {/* Officer Info */}
            <Card className="p-6 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <User size={16} className="text-primary-400" /> Assigned Officer
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <Avatar name="Ramesh Kumar" size="lg" className="w-14 h-14 bg-brand-violet shadow-glow-violet" />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">Inspector Ramesh Kumar</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Badge: CE-9821</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">4.8</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-tighter">Rating</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-center">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">18h</p>
                  <p className="text-[10px] text-slate-600 uppercase tracking-tighter">Avg Res.</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-6">View Officer Profile</Button>
            </Card>

            {/* Location Context */}
            <Card className="p-6 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <MapPin size={16} className="text-emerald-400" /> Area Context
              </h3>
              <div className="h-56 rounded-3xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/5 mb-4 relative overflow-hidden group shadow-inner">
                <MapContainer 
                  center={[complaint.location.lat, complaint.location.lng]} 
                  zoom={15} 
                  className="h-full w-full"
                  zoomControl={false}
                  dragging={true}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[complaint.location.lat, complaint.location.lng]}>
                    <Popup className="custom-popup">
                      <div className="p-1">
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{complaint.referenceId}</p>
                        <p className="text-xs font-bold text-slate-900 mt-1">{complaint.location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                
                {/* Floating Map Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-8 h-8 rounded-xl bg-white/90 dark:bg-dark-900/90 shadow-lg border border-white/10 flex items-center justify-center text-slate-900 dark:text-white hover:bg-primary-500 hover:text-white transition-all">
                    <TrendingUp size={14} />
                  </button>
                </div>

                <div className="absolute bottom-3 right-3 z-[1000]">
                  <Button 
                    size="sm" 
                    variant="secondary"
                    className="bg-white/95 dark:bg-dark-900/95 text-primary-600 dark:text-primary-400 font-bold px-3 py-1.5 h-auto rounded-xl shadow-glow-blue border border-primary-500/20"
                    onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`, '_blank')}
                  >
                    🗺️ Open in Google Maps
                  </Button>
                </div>
                
                <div className="absolute top-3 left-3 z-[1000] px-3 py-1.5 rounded-xl bg-dark-950/80 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[8px] font-black text-white uppercase tracking-widest">Verified GPS Lock</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Ward</span>
                  <span className="text-slate-900 dark:text-white font-bold">{complaint.ward}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Nearby Complaints</span>
                  <span className="text-slate-900 dark:text-white font-bold">12 Active</span>
                </div>
              </div>
            </Card>

            {/* Need Help? */}
            <div className="p-6 rounded-3xl bg-brand-rose/5 border border-brand-rose/10 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-brand-rose/10 flex items-center justify-center text-brand-rose mb-4">
                <Shield size={20} />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Need Immediate Help?</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed mb-4">
                If this is a life-threatening emergency, please contact 112 directly.
              </p>
              <Button variant="ghost" size="sm" className="text-brand-rose w-full">Report Inaccuracy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
