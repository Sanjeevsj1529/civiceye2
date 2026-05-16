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
      <div className="relative min-h-screen overflow-hidden bg-[#020617] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" />
        <div className="absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-indigo/15 blur-[120px] animate-pulse-slow" />
        <div className="relative text-center">
          <div className="relative mx-auto mb-8 h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-3xl border-2 border-white/10 border-t-neon-cyan drop-shadow-lg" />
            <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-brand-indigo/60 to-neon-cyan/30 shadow-glow-blue backdrop-blur-md" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse drop-shadow-sm">Fetching Report Intel...</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-noise opacity-[0.15]" />
        <div className="relative z-10 text-center glass-premium p-12 rounded-[2.5rem] border border-white/10 shadow-glow-lg max-w-lg">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-5xl mx-auto mb-6 shadow-inner-glow border border-white/10">🔍</div>
          <h2 className="text-2xl font-black text-white mb-3">Target Not Found</h2>
          <p className="text-slate-400 mb-8 font-medium text-sm">We couldn't locate report registry <span className="text-neon-cyan font-black tracking-widest">{id}</span>.</p>
          <Link to="/dashboard/citizen">
            <Button size="lg" glow className="w-full bg-gradient-to-r from-brand-indigo to-neon-cyan text-white border-none">RETURN TO HQ</Button>
          </Link>
        </div>
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
      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.12] pointer-events-none">
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-0 left-0 w-full h-full bg-dots [background-size:40px_40px] animate-grid-pan" />
        <div className="absolute -top-40 left-1/4 h-[500px] w-[500px] rounded-full bg-brand-indigo/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-neon-cyan/10 blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        {/* Back Link */}
        <Link 
          to={user?.role === 'citizen' ? '/dashboard/citizen' : user?.role === 'officer' ? '/dashboard/officer' : '/dashboard/admin'} 
          className="inline-flex items-center gap-3 text-[10px] font-black text-slate-400 hover:text-neon-cyan mb-10 transition-all uppercase tracking-[0.2em] group"
        >
          <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-neon-cyan/50 group-hover:bg-neon-cyan/10 transition-all">
            <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          </div>
          Return to Mission Control
        </Link>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Panel: 8 Cols */}
          <div className="lg:col-span-8 space-y-10">
            {/* Header Card */}
            <Card className="p-0 border border-white/10 glass-premium relative overflow-hidden shadow-glow-lg panel-shine">
              <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/10 blur-[80px] rounded-full z-0" />
              
              <div className="p-10 relative z-10">
                <div className="absolute top-10 right-10">
                  <Badge className={clsx(
                    'px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border-none shadow-lg backdrop-blur-md',
                    statusMeta.bg === 'bg-emerald-500/10' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-500/30' : 
                    statusMeta.bg === 'bg-amber-500/10' ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-500/30' : 
                    'bg-brand-indigo/20 text-neon-cyan shadow-[0_0_15px_rgba(79,70,229,0.3)] border border-brand-indigo/30'
                  )}>
                    {statusMeta.label}
                  </Badge>
                </div>
                
                <div className="flex flex-col md:flex-row items-start gap-10">
                  <div className="w-32 h-32 rounded-[2rem] bg-white/5 flex items-center justify-center text-6xl shadow-inner-glow border border-white/10 relative overflow-hidden group shrink-0 backdrop-blur-sm">
                    {complaint.media && complaint.media[0] ? (
                      <img 
                        src={complaint.media[0].url} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt="Primary evidence" 
                      />
                    ) : (
                      <span className="drop-shadow-lg group-hover:scale-110 transition-transform">{meta.icon}</span>
                    )}
                    <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] pointer-events-none" />
                  </div>
                  
                  <div className="flex-1 mt-2">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.3em] drop-shadow-sm">{complaint.referenceId}</span>
                      <div className="h-px w-8 bg-white/20" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{complaint.createdAt ? format(new Date(complaint.createdAt), 'MMM d, yyyy') : 'Recently'}</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[0.95] drop-shadow-md pr-32">
                      {complaint.title}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-8">
                      <div className="flex items-center gap-3 text-slate-300 text-xs font-bold tracking-wide">
                        <MapPin size={16} className="text-brand-indigo drop-shadow-[0_0_8px_rgba(79,70,229,0.8)]" /> {complaint.location.address}
                      </div>
                      <div className="flex items-center gap-3 text-slate-300 text-xs font-bold tracking-wide">
                        <Shield size={16} className="text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" /> Severity {complaint.severity}/10
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <Button variant="outline" size="xl" glow onClick={() => user && upvoteComplaint(complaint.id, user.id)} className="bg-white/5 border-white/20 text-white hover:bg-brand-indigo/20 hover:border-brand-indigo/50 hover:shadow-glow-blue transition-all">
                      <span className="text-xl mr-2">👍</span> <span className="font-black tracking-widest text-[10px] uppercase">{complaint.upvotes} Upvotes</span>
                    </Button>
                    <Button variant="ghost" size="xl" className="text-slate-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]">
                      <Share2 size={16} className="mr-3 text-neon-cyan" /> Copy Link
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner-glow">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-tighter mb-1">Est. Completion</p>
                      <p className="text-xs font-black text-white drop-shadow-sm">{complaint.estimatedResolutionDays} Days Remaining</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-3 relative z-10">
              {[
                { id: 'timeline', label: 'Mission Log', icon: <Clock size={16} /> },
                { id: 'details', label: 'Evidence', icon: <AlertCircle size={16} /> },
                { id: 'chat', label: 'Field Comms', icon: <MessageSquare size={16} /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={clsx(
                    'flex items-center gap-3 px-8 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest transition-all duration-300 border backdrop-blur-md',
                    activeTab === t.id 
                      ? 'bg-brand-indigo/20 text-white border-brand-indigo/50 shadow-glow-blue' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/30 hover:bg-white/10'
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
                  className="space-y-8 relative z-10"
                >
                  {complaint.timeline?.map((event, i) => (
                    <div key={event.id} className="relative pl-16 pb-4">
                      {/* Line */}
                      {i < (complaint.timeline?.length || 0) - 1 && (
                        <div className="absolute left-[31px] top-12 bottom-0 w-[3px] rounded-full bg-gradient-to-b from-brand-indigo/60 via-neon-cyan/35 to-transparent shadow-[0_0_12px_rgba(79,70,229,0.35)]" />
                      )}
                      
                      {/* Icon Node */}
                      <div className={clsx(
                        'absolute left-0 top-0 w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl border transition-all duration-300 z-10',
                        i === 0 
                          ? 'bg-brand-indigo/20 text-white border-brand-indigo/50 shadow-glow-blue backdrop-blur-md' 
                          : 'bg-white/5 text-slate-400 border-white/10 shadow-inner-glow backdrop-blur-md'
                      )}>
                        <span className="drop-shadow-md">{event.status === 'submitted' ? '📥' : event.status === 'assigned' ? '👤' : event.status === 'resolved' ? '✅' : '⚙️'}</span>
                      </div>

                      <div className="glass-premium border border-white/10 bg-white/5 rounded-[2rem] p-8 hover:border-brand-indigo/50 hover:shadow-glow-blue transition-all duration-500 group relative overflow-hidden panel-shine">
                        <div className="absolute inset-0 bg-noise opacity-[0.05] pointer-events-none mix-blend-overlay" />
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 relative z-10">
                          <h4 className="text-sm font-black text-white uppercase tracking-[0.2em] group-hover:text-neon-cyan transition-colors">{event.status.replace('_', ' ')}</h4>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{event.timestamp ? format(new Date(event.timestamp), 'MMM d · h:mm a') : 'Now'}</span>
                        </div>
                        <p className="text-sm text-slate-300 mb-8 font-medium leading-relaxed relative z-10">{event.note}</p>
                        
                        {/* Evidence Thumbnails */}
                        {event.status === 'submitted' && complaint.media && complaint.media.length > 0 && (
                          <div className="flex gap-4 mb-8 overflow-x-auto pb-2 relative z-10 custom-scrollbar">
                            {complaint.media.map(m => (
                              <div key={m.id} className="w-28 h-28 rounded-2xl overflow-hidden border border-white/10 shrink-0 group/img cursor-pointer relative shadow-inner-glow">
                                <img src={m.url} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110" alt="Evidence preview" />
                                <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] pointer-events-none" />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-4 pt-6 border-t border-white/10 relative z-10">
                          <Avatar name={event.actor} size="sm" className="w-10 h-10 rounded-xl shadow-md border border-white/10" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black text-white uppercase tracking-tighter drop-shadow-sm">{event.actor}</span>
                            <span className="text-[8px] font-black text-brand-indigo uppercase tracking-[0.2em]">{event.actorRole}</span>
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
                  className="space-y-6 relative z-10"
                >
                  <Card className="p-10 border border-white/10 glass-premium panel-shine">
                    <h3 className="text-sm font-black text-white mb-6 tracking-[0.2em] uppercase">Mission Intel</h3>
                    <p className="text-slate-300 leading-relaxed mb-10 text-sm font-medium">{complaint.description}</p>
                    
                    <h3 className="text-sm font-black text-white mb-6 tracking-[0.2em] uppercase mt-12">Visual Evidence</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                      {complaint.media && complaint.media.length > 0 ? (
                        complaint.media.map(m => (
                          <div key={m.id} className="aspect-square rounded-3xl overflow-hidden border border-white/10 group cursor-pointer relative shadow-inner-glow">
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute inset-0 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] pointer-events-none transition-opacity" />
                            <div className="absolute inset-0 bg-[#020617]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                              <span className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] drop-shadow-md">EXPAND</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full p-16 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">No visual telemetry provided.</p>
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
                  className="flex flex-col h-[600px] glass-premium rounded-[2.5rem] overflow-hidden border border-white/10 shadow-glow-lg relative z-10"
                >
                  <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none mix-blend-overlay" />
                  {/* Chat Header */}
                  <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between backdrop-blur-md relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <div>
                        <p className="text-sm font-black text-white">Officer Ramesh Kumar</p>
                        <p className="text-[10px] text-neon-cyan uppercase tracking-[0.2em] font-black mt-0.5">Assigned Responder</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="md" className="rounded-2xl border border-white/5 hover:bg-white/10 text-white"><Phone size={16} /></Button>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar relative z-10 bg-[#020617]/20">
                    <div className="flex justify-center">
                      <Badge className="bg-white/5 border border-white/10 text-slate-400 font-black tracking-widest text-[9px] px-4 py-1.5 backdrop-blur-sm">COMMS INITIATED: {format(new Date(complaint.createdAt), 'MMM d')}</Badge>
                    </div>
                    
                    {complaint.comments?.map(c => (
                      <div key={c.id} className={clsx('flex flex-col', c.authorRole === 'citizen' ? 'items-end' : 'items-start')}>
                        <div className={clsx(
                          'max-w-[80%] p-5 rounded-3xl text-sm leading-relaxed border backdrop-blur-md',
                          c.authorRole === 'citizen' ? 'bg-brand-indigo/30 border-brand-indigo/50 text-white rounded-tr-none shadow-glow-blue' : 'bg-white/10 border-white/10 text-slate-200 rounded-tl-none shadow-inner-glow'
                        )}>
                          {c.text}
                        </div>
                        <span className="text-[9px] text-slate-500 font-black mt-2 uppercase tracking-[0.2em]">
                          {c.authorName} <span className="mx-1 text-white/20">|</span> {formatDistanceToNow(new Date(c.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Input Area */}
                  <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4 backdrop-blur-md relative z-10">
                    <input 
                      placeholder="Transmit message to ops..."
                      className="flex-1 bg-[#020617]/50 border border-white/10 rounded-[1.25rem] px-6 py-4 text-sm text-white placeholder:text-slate-500 focus:border-brand-indigo focus:bg-white/10 outline-none transition-all shadow-inner-glow"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    />
                    <Button size="xl" glow className="px-6 bg-gradient-to-r from-brand-indigo to-neon-cyan border-none text-white shadow-glow-blue" onClick={handleAddComment}>
                      <Send size={18} />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar: 4 Cols */}
          <div className="lg:col-span-4 space-y-8 relative z-10">
            {/* Resolution Progress */}
            <Card className="p-8 border-white/10 glass-premium text-center relative overflow-hidden group panel-shine">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/10 blur-2xl rounded-full z-0 group-hover:bg-neon-cyan/20 transition-colors duration-500" />
              <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center text-5xl mx-auto mb-6 shadow-glow-blue border border-white/10 relative z-10 backdrop-blur-md group-hover:scale-110 transition-transform">
                <span className="drop-shadow-lg">⏱️</span>
              </div>
              <h3 className="text-xl font-black text-white mb-2 relative z-10 drop-shadow-sm">Resolving Soon</h3>
              <p className="text-[10px] text-neon-cyan uppercase tracking-widest font-black mb-8 relative z-10">Est: Friday, 6:00 PM</p>
              <div className="space-y-5 relative z-10">
                <ProgressBar value={40} color="bg-gradient-to-r from-brand-indigo to-neon-cyan shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                <div className="flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-tighter">
                  <span className={clsx(complaint.status === 'submitted' && 'text-neon-cyan drop-shadow-sm')}>Received</span>
                  <span className={clsx(complaint.status === 'assigned' && 'text-neon-cyan drop-shadow-sm')}>Confirming</span>
                  <span className={clsx(complaint.status === 'in_progress' && 'text-neon-cyan drop-shadow-sm')}>Assigning</span>
                  <span className={clsx(complaint.status === 'in_progress' && 'text-neon-cyan drop-shadow-sm')}>On Field</span>
                  <span className={clsx(complaint.status === 'resolved' && 'text-neon-cyan drop-shadow-sm')}>Resolved</span>
                </div>
              </div>
            </Card>

            {/* Officer Info */}
            <Card className="p-8 border-white/10 glass-premium panel-shine">
              <h3 className="text-sm font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-sm">
                <User size={18} className="text-brand-indigo drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]" /> Assigned Officer
              </h3>
              <div className="flex items-center gap-5 mb-8">
                <Avatar name="Ramesh Kumar" size="lg" className="w-16 h-16 bg-gradient-to-br from-[#4f46e5] to-[#8b5cf6] shadow-glow-blue border-2 border-white/20" />
                <div>
                  <p className="font-black text-white drop-shadow-sm">Inspector Ramesh Kumar</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-black">Badge: CE-9821</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center shadow-inner-glow hover:bg-white/10 transition-colors">
                  <p className="text-xl font-black text-white drop-shadow-sm">4.8</p>
                  <p className="text-[10px] text-neon-cyan uppercase tracking-widest font-black mt-1">Rating</p>
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center shadow-inner-glow hover:bg-white/10 transition-colors">
                  <p className="text-xl font-black text-white drop-shadow-sm">18h</p>
                  <p className="text-[10px] text-neon-cyan uppercase tracking-widest font-black mt-1">Avg Res.</p>
                </div>
              </div>
              <Button variant="outline" size="md" className="w-full mt-8 border-white/20 text-[10px] uppercase tracking-widest font-black hover:bg-white/5">View Full Profile</Button>
            </Card>

            {/* Location Context */}
            <Card className="p-8 border-white/10 glass-premium panel-shine">
              <h3 className="text-sm font-black text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-3 drop-shadow-sm">
                <MapPin size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Area Context
              </h3>
              <div className="h-64 rounded-[2rem] bg-white/5 border border-white/10 mb-6 relative overflow-hidden group shadow-inner-glow glass-premium">
                <MapContainer 
                  center={[complaint.location.lat, complaint.location.lng]} 
                  zoom={15} 
                  className="h-full w-full custom-dark-map filter saturate-150 contrast-125"
                  zoomControl={false}
                  dragging={true}
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  <Marker position={[complaint.location.lat, complaint.location.lng]}>
                    <Popup className="custom-cinematic-popup">
                      <div className="p-2 w-48">
                        <p className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] drop-shadow-sm">{complaint.referenceId}</p>
                        <p className="text-xs font-black text-white mt-1 leading-tight">{complaint.location.address}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
                
                {/* Floating Map Controls */}
                <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-10 h-10 rounded-[1.25rem] bg-white/10 backdrop-blur-md shadow-glow-blue border border-white/20 flex items-center justify-center text-white hover:bg-brand-indigo transition-all">
                    <TrendingUp size={16} />
                  </button>
                </div>

                <div className="absolute bottom-4 right-4 z-[1000]">
                  <Button 
                    size="sm" 
                    glow
                    className="bg-white/10 backdrop-blur-md text-white font-black px-4 py-2 h-auto rounded-2xl shadow-glow-blue border border-white/20 text-[10px] uppercase tracking-widest hover:bg-white/20"
                    onClick={() => window.open(`https://www.google.com/maps?q=${complaint.location.lat},${complaint.location.lng}`, '_blank')}
                  >
                    🗺️ EXTERNAL MAPS
                  </Button>
                </div>
                
                <div className="absolute top-4 left-4 z-[1000] px-4 py-2 rounded-[1.25rem] bg-black/50 backdrop-blur-md border border-white/10 flex items-center gap-3 shadow-inner-glow">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.2em] drop-shadow-sm">GPS LOCK</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Ward Protocol</span>
                  <span className="text-white font-black drop-shadow-sm">{complaint.ward}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Nearby Targets</span>
                  <span className="text-white font-black drop-shadow-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" />
                    12 Active
                  </span>
                </div>
              </div>
            </Card>

            {/* Need Help? */}
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-rose-500/10 to-rose-900/10 border border-rose-500/20 flex flex-col items-center text-center shadow-[0_0_30px_rgba(244,63,94,0.1)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-noise opacity-10 mix-blend-overlay pointer-events-none" />
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-400 mb-6 shadow-[0_0_15px_rgba(244,63,94,0.3)] border border-rose-500/30 group-hover:scale-110 transition-transform relative z-10 backdrop-blur-sm">
                <Shield size={24} className="drop-shadow-md" />
              </div>
              <h4 className="text-sm font-black text-white mb-3 uppercase tracking-widest relative z-10 drop-shadow-sm">Emergency Protocol</h4>
              <p className="text-[10px] text-slate-300 leading-relaxed mb-6 font-medium relative z-10 uppercase tracking-wider">
                If this escalates to a life-threatening scenario, override and contact 112 directly.
              </p>
              <Button variant="ghost" size="sm" className="text-rose-400 hover:text-white hover:bg-rose-500/20 w-full border border-rose-500/20 uppercase tracking-[0.2em] font-black text-[10px] relative z-10">Report Inaccuracy</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
