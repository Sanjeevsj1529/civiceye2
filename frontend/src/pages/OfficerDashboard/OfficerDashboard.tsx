import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ClipboardList, CheckCircle2, Clock, MapPin, 
  ChevronRight, Phone, MessageSquare, AlertTriangle,
  TrendingUp, Award, Layout, Navigation, Camera,
  MoreVertical, Filter, Search, Send, Check, User
} from 'lucide-react'
import { Card, StatCard, Badge, Button, Avatar, ProgressBar } from '../../components/ui'
import { COMPLAINTS, STATUS_META, CATEGORY_META } from '../../utils/mockData'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

export default function OfficerDashboard() {
  const { user } = useAuthStore()
  const [view, setView] = useState<'tasks' | 'map' | 'performance'>('tasks')
  const myTasks = COMPLAINTS.filter(c => c.status === 'assigned' || c.status === 'in_progress').slice(0, 5)

  return (
    <div className="min-h-screen pb-20 pt-24 px-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-6">
            <Avatar name={user?.name || "Ramesh Kumar"} size="lg" className="w-20 h-20 bg-brand-violet shadow-glow-violet border-4 border-white/5" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">Duty Desk: {user?.name.split(' ')[0]}</h1>
                <Badge variant="success" className="ring-4 ring-emerald-500/10">On Duty</Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-500 font-bold tracking-tight mt-1">
                <span className="text-primary-600 dark:text-primary-400">{user?.ward || 'North Ward'}</span> · {user?.department || 'Roads & Infrastructure'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
          <StatCard label="Assigned Tasks" value="12" icon="📋" trend={2} />
          <StatCard label="Resolved This Week" value="48" icon="✅" trend={15} color="from-emerald-500/10 to-green-500/10" />
          <StatCard label="SLA Compliance" value="96%" icon="⏱️" trend={4} color="from-blue-500/10 to-cyan-500/10" />
          <StatCard label="Performance Score" value="4.8" icon="⭐" trend={1} color="from-amber-500/10 to-yellow-500/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Tasks Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                <ClipboardList size={16} className="text-primary-500" /> Priority Queue
              </h3>
              <div className="flex items-center gap-4">
                <button className="text-xs text-slate-500 hover:text-white font-bold transition-colors">SORT BY SLA</button>
                <div className="w-px h-3 bg-white/10" />
                <button className="text-xs text-slate-500 hover:text-white font-bold transition-colors">VIEW ALL</button>
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
                  <Card className="p-6 border-white/5 bg-white/5 hover:border-primary-500/30 transition-all group">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
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
                          <h4 className="text-lg font-bold text-white truncate group-hover:text-primary-400 transition-colors flex items-center gap-2">
                            {task.title}
                            {task.isCommunityReport && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-medium font-sans">Multi-Citizen Issue</span>}
                          </h4>
                          <div className="flex items-center gap-4 mt-2">
                            <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapPin size={12} /> {task.location.address}</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5"><User size={12} /> {task.isCommunityReport ? 'Community Verified' : task.citizenName}</p>
                          </div>
                        </div>

                      <div className="flex items-center gap-3 pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-white/5 sm:pl-6">
                        <Link to={`/complaints/track/${task.referenceId}`}>
                          <Button size="sm" variant="outline">Navigate</Button>
                        </Link>
                        <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
                          Complete
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Performance Sidebar */}
          <div className="space-y-8">
            <Card className="p-8 border-white/5 bg-white/5 text-center">
              <div className="w-20 h-20 rounded-[2.5rem] bg-brand-violet/10 flex items-center justify-center text-4xl mx-auto mb-6 shadow-glow-violet border border-brand-violet/10">
                🚀
              </div>
              <h3 className="text-xl font-black text-white mb-2">Efficiency Rating</h3>
              <p className="text-sm text-slate-500 mb-8">You are in the top 5% of officers this month!</p>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Resolution Speed</span>
                    <span className="text-white">92%</span>
                  </div>
                  <ProgressBar value={92} color="bg-brand-violet" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <span>Citizen Rating</span>
                    <span className="text-white">4.8/5</span>
                  </div>
                  <ProgressBar value={96} color="bg-emerald-500" />
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-8 text-primary-400">View Performance Report</Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> Active Shift Awards
              </h3>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                <div className="text-2xl">🔥</div>
                <div>
                  <p className="text-xs font-bold text-white">Speed Demon</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">5 resolutions in under 12 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 opacity-40 grayscale">
                <div className="text-2xl">🤝</div>
                <div>
                  <p className="text-xs font-bold text-white">Community Fav</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">10 positive feedback ratings</p>
                </div>
              </div>
            </Card>

            <div className="p-6 rounded-3xl bg-primary-500/5 border border-primary-500/10">
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
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
