import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import { 
  ClipboardList, CheckCircle2, Clock, MapPin, 
  ChevronRight, Phone, MessageSquare, AlertTriangle,
  TrendingUp, Award, Layout, Navigation, Camera,
  MoreVertical, Filter, Search, Send, Check, User, Map as MapIcon
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Card, StatCard, Badge, Button, Avatar, ProgressBar } from '../../components/ui'
import { STATUS_META, CATEGORY_META } from '../../utils/mockData'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { useComplaintStore } from '../../store/complaintStore'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function OfficerDashboard() {
  const { user } = useAuthStore()
  const { complaints, initializeComplaints, isLoading, updateComplaintStatus } = useComplaintStore()
  const [view, setView] = useState<'tasks' | 'map' | 'performance'>('tasks')

  useEffect(() => {
    const unsubscribe = initializeComplaints();
    
    // Set online status
    if (user?.id) {
      updateDoc(doc(db, 'users', user.id), { isOnline: true });
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (user?.id) {
        updateDoc(doc(db, 'users', user.id), { isOnline: false });
      }
    };
  }, [initializeComplaints, user?.id]);

  const myTasks = complaints.filter(c => 
    c.assignedOfficerId === user?.id || 
    (c.status === 'assigned' && !c.assignedOfficerId) // Fallback for demo
  )

  const resolvedCount = complaints.filter(c => 
    (c.assignedOfficerId === user?.id) && 
    ['resolved', 'verified', 'closed'].includes(c.status)
  ).length

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-dark-950 pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Establishing Field Connection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 pt-24 px-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <Avatar name={user?.name || "Ramesh Kumar"} size="lg" className="w-20 h-20 bg-brand-violet shadow-glow-violet border-4 border-slate-200 dark:border-white/5" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Duty Desk: {(user?.name || 'Officer').split(' ')[0]}</h1>
                <Badge variant="success" className="ring-4 ring-emerald-500/10">On Duty</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-500 font-bold tracking-tight mt-1">
                <span className="text-primary-600 dark:text-primary-400">{user?.wardName || 'North Ward'}</span> · {user?.department || 'Roads & Infrastructure'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-xl mr-4">
               <button 
                onClick={() => setView('tasks')}
                className={clsx('p-2 rounded-lg transition-all', view === 'tasks' ? 'bg-primary-500 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white')}
              >
                <ClipboardList size={18} />
              </button>
              <button 
                onClick={() => setView('map')}
                className={clsx('p-2 rounded-lg transition-all', view === 'map' ? 'bg-primary-500 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white')}
              >
                <MapIcon size={18} />
              </button>
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Navigation size={16} className="mr-2" /> Start Shift
            </Button>
            <Button size="sm" glow className="bg-emerald-500 hover:bg-emerald-600 shadow-glow-emerald border-none">
              <Check size={16} className="mr-2" /> Mark Available
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Assigned Tasks" value={myTasks.length.toString()} icon="📋" trend={2} />
          <StatCard label="Resolved" value={resolvedCount.toString()} icon="✅" trend={15} color="from-emerald-500/10 to-green-500/10" />
          <StatCard label="SLA Compliance" value="96%" icon="⏱️" trend={4} color="from-blue-500/10 to-cyan-500/10" />
          <StatCard label="Performance Score" value="4.8" icon="⭐" trend={1} color="from-amber-500/10 to-yellow-500/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {view === 'tasks' ? (
                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                      <ClipboardList size={16} className="text-primary-500" /> Priority Queue
                    </h3>
                    <div className="flex items-center gap-4">
                      <button className="text-xs text-slate-500 hover:text-slate-900 dark:text-white font-bold transition-colors">SORT BY SLA</button>
                      <div className="w-px h-3 bg-white/10" />
                      <button className="text-xs text-slate-500 hover:text-slate-900 dark:text-white font-bold transition-colors">VIEW ALL</button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {myTasks.map((task, i) => (
                      <motion.div 
                        key={task.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Card className="p-6 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:border-primary-500/30 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                              {CATEGORY_META[task.category].icon}
                            </div>
                            
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-[10px] font-mono text-slate-600 font-bold uppercase tracking-widest">{task.referenceId}</span>
                                  <Badge variant={task.severity >= 7 ? 'error' : 'info'}>Sev {task.severity}</Badge>
                                  {task.isCommunityReport && (
                                    <Badge variant="warning" className="bg-brand-rose/10 text-brand-rose border border-brand-rose/20 animate-pulse-glow flex items-center gap-1.5">
                                      🏘️ SOCIETY
                                      <span className="w-1 h-1 rounded-full bg-brand-rose/40" />
                                      <span className="font-black">{Math.floor(Math.random() * 6) + 2} Reports</span>
                                    </Badge>
                                  )}
                                  <Badge variant="default" className="bg-brand-rose/10 text-brand-rose border border-brand-rose/20">
                                    Due in 4h
                                  </Badge>
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-400 transition-colors flex items-center gap-2">
                                  {task.title}
                                  {task.isCommunityReport && <span className="text-[10px] bg-slate-50 dark:bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-medium font-sans">Multi-Citizen Issue</span>}
                                </h4>
                                <div className="flex items-center gap-4 mt-2">
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> {task.location.address}</p>
                                  <p className="text-xs text-slate-500 flex items-center gap-1.5"><User size={12} /> {task.isCommunityReport ? 'Community Verified' : task.citizenName}</p>
                                </div>
                              </div>

                            <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/5 sm:pl-6">
                              <Link to={`/complaints/track/${task.referenceId}`}>
                                <Button size="sm" variant="outline">Navigate</Button>
                              </Link>
                              <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20" onClick={() => updateComplaintStatus(task.id, 'resolved', task.citizenId, task.referenceId, 'Resolved by field officer', user?.id || '')}>
                                Complete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                    {myTasks.length === 0 && (
                      <div className="py-20 text-center">
                        <div className="text-6xl mb-4">🎉</div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No assigned tasks</h3>
                        <p className="text-slate-500">You're all caught up for now.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div key="map" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="h-[600px] rounded-[2rem] border border-slate-200 dark:border-white/5 overflow-hidden relative">
                   <MapContainer 
                      center={[28.6139, 77.2090]} 
                      zoom={12} 
                      className="h-full w-full"
                      zoomControl={false}
                    >
                      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      {myTasks.map(task => (
                        <Marker key={task.id} position={[task.location.lat, task.location.lng]}>
                          <Popup className="custom-popup">
                            <div className="p-3 w-48">
                              <p className="text-xs font-black text-slate-900 mb-1">{task.title}</p>
                              <p className="text-[10px] text-slate-500 mb-3 truncate">{task.location.address}</p>
                              <div className="flex flex-col gap-2">
                                <Link to={`/complaints/track/${task.referenceId}`}>
                                  <Button size="sm" className="w-full">View Task</Button>
                                </Link>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="w-full text-[10px]"
                                  onClick={() => window.open(`https://www.google.com/maps?q=${task.location.lat},${task.location.lng}`, '_blank')}
                                >
                                  🧭 Google Maps
                                </Button>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      <MapController center={[28.6139, 77.2090]} />
                    </MapContainer>
                    <div className="absolute top-6 left-6 z-[1000] glass px-4 py-2 rounded-xl border border-white/10">
                      <p className="text-[10px] text-slate-900 dark:text-white font-bold uppercase tracking-widest">{myTasks.length} Assigned Locations</p>
                    </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-8">
            <Card className="p-8 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 text-center">
              <div className="w-20 h-20 rounded-[2.5rem] bg-brand-violet/10 flex items-center justify-center text-4xl mx-auto mb-6 shadow-glow-violet border border-brand-violet/10">
                🚀
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">Efficiency Rating</h3>
              <p className="text-sm text-slate-500 mb-8">You are in the top 5% of officers this month!</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Resolution Speed</span>
                    <span className="text-slate-900 dark:text-white">92%</span>
                  </div>
                  <ProgressBar value={92} color="bg-brand-violet" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Citizen Rating</span>
                    <span className="text-slate-900 dark:text-white">4.8/5</span>
                  </div>
                  <ProgressBar value={96} color="bg-emerald-500" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-8 text-primary-400">View Performance Report</Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> Active Shift Awards
              </h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 mb-4">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Speed Demon</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">5 resolutions in under 12 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 opacity-40 grayscale">
                <div className="text-2xl">🤝</div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Community Fav</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">10 positive feedback ratings</p>
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-primary-400" /> Internal Broadcast
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Heavy rainfall expected in North Ward tonight. All officers on standby for drainage related complaints."
              </p>
              <p className="text-[10px] text-slate-600 font-bold uppercase mt-4">— Command Center</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
