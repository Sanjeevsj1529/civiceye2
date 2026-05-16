import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { 
  ClipboardList, CheckCircle2, Clock, MapPin, 
  ChevronRight, AlertTriangle, Navigation,
  TrendingUp, Award, Check, User, Map as MapIcon, Radio, Activity, Zap
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Card, Badge, Button, Avatar, ProgressBar } from '../../components/ui'
import { STATUS_META, CATEGORY_META } from '../../utils/mockData'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { useComplaintStore } from '../../store/complaintStore'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function MapController({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, 14, { duration: 1.5 })
  }, [center, map])
  return null
}

export default function OfficerDashboard() {
  const { user } = useAuthStore()
  const { complaints, initializeComplaints, isLoading, updateComplaintStatus } = useComplaintStore()
  const [activeTask, setActiveTask] = useState<string | null>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090])

  useEffect(() => {
    const unsubscribe = initializeComplaints()
    if (user?.id) {
      updateDoc(doc(db, 'users', user.id), { isOnline: true })
    }
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
      if (user?.id) {
        updateDoc(doc(db, 'users', user.id), { isOnline: false })
      }
    }
  }, [initializeComplaints, user?.id])

  const myTasks = complaints.filter(c =>
    c.assignedOfficerId === user?.id ||
    (c.status === 'assigned' && !c.assignedOfficerId)
  )

  const resolvedCount = complaints.filter(c =>
    (c.assignedOfficerId === user?.id) &&
    ['resolved', 'verified', 'closed'].includes(c.status)
  ).length

  const activeTaskData = activeTask ? myTasks.find(t => t.id === activeTask) : null

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617]">
      {/* 1. Fullscreen Map */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {myTasks.map(task => (
            <Marker
              key={task.id}
              position={[task.location.lat, task.location.lng]}
              eventHandlers={{ click: () => { setActiveTask(task.id); setMapCenter([task.location.lat, task.location.lng]) } }}
            >
              <Popup className="custom-cinematic-popup">
                <div className="p-3 min-w-[200px]">
                  <p className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-1">{task.referenceId}</p>
                  <p className="text-sm font-bold text-white leading-tight mb-3">{task.title}</p>
                  <div className="flex flex-col gap-2">
                    <Link to={`/complaints/track/${task.referenceId}`}>
                      <Button size="sm" glow className="w-full bg-brand-indigo border-none text-[10px] tracking-widest">VIEW TASK</Button>
                    </Link>
                    <Button
                      size="sm" variant="outline"
                      className="w-full text-[10px] border-white/20 tracking-widest hover:bg-white/5"
                      onClick={() => window.open(`https://www.google.com/maps?q=${task.location.lat},${task.location.lng}`, '_blank')}
                    >
                      🧭 MAPS ROUTE
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <MapController center={mapCenter} />
        </MapContainer>

        {/* Map overlay gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/70 via-transparent to-[#020617]/70 pointer-events-none z-10" />
      </div>

      {/* 2. HUD Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex p-6 pt-24 pb-28 lg:p-8 lg:pt-24 lg:pb-32 gap-8">

        {/* LEFT: Officer Profile + Stats */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex flex-col gap-5 pointer-events-auto"
        >
          {/* Identity Card */}
          <div className="glass-premium p-6 rounded-[2rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/60 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-indigo/20 blur-3xl rounded-full" />
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <div className="relative">
                <Avatar name={user?.name || 'Officer'} size="lg" className="ring-4 ring-brand-indigo/30 shadow-glow-blue" />
                <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#020617] shadow-glow-emerald animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] font-black text-neon-cyan uppercase tracking-[0.25em]">Field Officer · On Duty</p>
                <h2 className="text-xl font-black text-white">{(user?.name || 'Officer').split(' ')[0]}</h2>
                <p className="text-[10px] text-slate-400 font-bold">{user?.wardName || 'North Ward'}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-white">{myTasks.length}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Tasks</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-emerald-400">{resolvedCount}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Done</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-amber-400">4.8</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Score</p>
              </div>
            </div>

            <Button glow className="w-full mt-5 bg-emerald-500 hover:bg-emerald-400 border-none shadow-glow-emerald text-white font-black uppercase tracking-widest text-[10px] relative z-10">
              <Check size={16} className="mr-2" /> Mark Available
            </Button>
          </div>

          {/* Broadcast Card */}
          <div className="glass-premium p-6 rounded-[2rem] border border-brand-indigo/30 shadow-glow-blue panel-shine bg-[#020617]/60 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute -top-8 -right-8 w-28 h-28 bg-neon-cyan/15 blur-2xl rounded-full" />
            <h4 className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em] flex items-center gap-2 mb-4 relative z-10">
              <Radio size={14} className="animate-pulse" /> Broadcast
            </h4>
            <p className="text-sm text-slate-300 italic leading-relaxed relative z-10">
              "Heavy rainfall expected tonight. All officers on standby for drainage complaints."
            </p>
            <p className="text-[9px] text-neon-cyan font-black uppercase tracking-widest mt-4 relative z-10">— Command Center</p>
          </div>

          {/* Performance */}
          <div className="glass-premium p-6 rounded-[2rem] border border-white/10 panel-shine bg-[#020617]/60 backdrop-blur-3xl flex-1 relative overflow-hidden">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-5">
              <Activity size={14} className="text-brand-indigo" /> Performance
            </h3>
            <div className="space-y-5">
              {[
                { label: 'Resolution Speed', value: 92, color: 'bg-gradient-to-r from-brand-violet to-[#c084fc]' },
                { label: 'SLA Compliance', value: 96, color: 'bg-gradient-to-r from-neon-cyan to-blue-400' },
                { label: 'Citizen Rating', value: 96, color: 'bg-gradient-to-r from-emerald-500 to-emerald-400' },
              ].map(m => (
                <div key={m.label} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <span>{m.label}</span>
                    <span className="text-white">{m.value}%</span>
                  </div>
                  <ProgressBar value={m.value} color={m.color} />
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-amber-500/20 shadow-inner-glow">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm font-bold text-white">Speed Demon</p>
                  <p className="text-[9px] text-amber-200/70 uppercase tracking-widest">5 resolutions &lt; 12h</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CENTER: Map label overlays */}
        <div className="flex-1 relative pointer-events-none">
          {/* Active task HUD overlay */}
          <AnimatePresence>
            {activeTaskData && (
              <motion.div
                key={activeTaskData.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto w-[500px] glass-premium p-6 rounded-[2rem] border border-neon-cyan/30 shadow-glow-blue bg-[#020617]/80 backdrop-blur-3xl"
              >
                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl shadow-inner-glow">
                    {CATEGORY_META[activeTaskData.category]?.icon || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-neon-cyan uppercase tracking-[0.2em]">{activeTaskData.referenceId}</p>
                    <h4 className="text-lg font-black text-white truncate">{activeTaskData.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold flex items-center gap-1.5">
                      <MapPin size={12} className="text-brand-indigo" /> {activeTaskData.location?.address}
                    </p>
                  </div>
                  <button onClick={() => setActiveTask(null)} className="text-slate-500 hover:text-white transition-colors text-xl leading-none">×</button>
                </div>
                <div className="flex gap-3 mt-5">
                  <Link to={`/complaints/track/${activeTaskData.referenceId}`} className="flex-1">
                    <Button size="md" variant="outline" className="w-full border-white/20 text-[10px] tracking-widest">NAVIGATE</Button>
                  </Link>
                  <Button
                    size="md" glow
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 border-none shadow-glow-emerald text-[10px] tracking-widest text-white"
                    onClick={() => {
                      updateComplaintStatus(activeTaskData.id, 'resolved', activeTaskData.citizenId, activeTaskData.referenceId, 'Resolved by field officer', user?.id || '')
                      setActiveTask(null)
                    }}
                  >
                    COMPLETE
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Map counter badge */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="glass-premium px-6 py-3 rounded-[1.25rem] border border-white/10 shadow-glow-blue backdrop-blur-3xl flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-neon-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse" />
              <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{myTasks.length} Active Targets on Grid</p>
            </div>
          </div>
        </div>

        {/* RIGHT: Task Queue */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-96 flex flex-col pointer-events-auto"
        >
          <div className="glass-premium flex-1 rounded-[2rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/60 backdrop-blur-3xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                <ClipboardList size={14} className="text-neon-cyan" /> Priority Queue
                <Badge variant="info" className="ml-1">{myTasks.length}</Badge>
              </h3>
              <button className="text-[9px] font-black text-slate-500 hover:text-neon-cyan uppercase tracking-widest transition-colors">SORT SLA</button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {myTasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => { setActiveTask(task.id === activeTask ? null : task.id); setMapCenter([task.location.lat, task.location.lng]) }}
                  className={clsx(
                    'p-4 rounded-2xl border cursor-pointer transition-all group relative overflow-hidden',
                    activeTask === task.id
                      ? 'border-neon-cyan/40 bg-neon-cyan/5 shadow-glow-blue'
                      : 'border-white/5 hover:border-brand-indigo/40 hover:bg-white/5'
                  )}
                >
                  {activeTask === task.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-cyan" />}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg shadow-inner-glow flex-shrink-0">
                      {CATEGORY_META[task.category]?.icon || '📋'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[9px] font-black text-brand-indigo uppercase tracking-[0.2em]">{task.referenceId}</p>
                        <Badge variant={task.severity >= 7 ? 'error' : 'info'} className="text-[8px]">Sev {task.severity}</Badge>
                      </div>
                      <h4 className={clsx('text-sm font-black leading-tight truncate transition-colors', activeTask === task.id ? 'text-neon-cyan' : 'text-white group-hover:text-neon-cyan')}>
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                          <MapPin size={10} className="text-brand-indigo" /> {task.ward}
                        </span>
                        <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                        <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                          <Clock size={10} className="text-neon-cyan" /> {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                    <Link to={`/complaints/track/${task.referenceId}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full border-white/20 text-[9px] tracking-widest hover:bg-white/5">NAVIGATE</Button>
                    </Link>
                    <Button
                      size="sm" glow
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-400 border-none shadow-glow-emerald text-[9px] tracking-widest text-white"
                      onClick={(e) => { e.stopPropagation(); updateComplaintStatus(task.id, 'resolved', task.citizenId, task.referenceId, 'Resolved by field officer', user?.id || '') }}
                    >
                      COMPLETE
                    </Button>
                  </div>
                </motion.div>
              ))}

              {myTasks.length === 0 && (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4 opacity-50">🎉</div>
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.1em]">Area Clear</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">All tasks completed.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
