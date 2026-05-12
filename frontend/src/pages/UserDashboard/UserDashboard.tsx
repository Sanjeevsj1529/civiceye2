import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_META, STATUS_META } from '../../utils/mockData'
import { Button, StatCard, Card, Badge, Avatar, Skeleton } from '../../components/ui'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Plus, Search, Filter, List, Layout, Calendar, Map as MapIcon, 
  ChevronRight, TrendingUp, CheckCircle2, Clock, Award, FileText,
  Download, Bell, Share2, MoreHorizontal
} from 'lucide-react'
import { clsx } from 'clsx'
import { format, subDays, isSameDay } from 'date-fns'

// --- Activity Heatmap Component ---
function ActivityHeatmap() {
  const weeks = 15
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const date = subDays(new Date(), (weeks * 7 - 1 - i))
    const count = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0
    return { date, count }
  })

  const getColor = (c: number) => {
    if (c === 0) return 'bg-slate-200 dark:bg-slate-800'
    if (c === 1) return 'bg-brand-indigo/30'
    if (c === 2) return 'bg-brand-indigo/50'
    if (c === 3) return 'bg-brand-indigo/70'
    return 'bg-brand-indigo'
  }

  return (
    <Card className="p-6 rounded-xl border border-slate-200 dark:border-white/5 shadow-soft">
      <h3 className="text-xs font-black text-brand-navy dark:text-white mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
        <TrendingUp size={14} className="text-brand-indigo" /> Civic Participation
      </h3>
      <div className="flex gap-1 overflow-x-auto pb-4 custom-scrollbar">
        {Array.from({ length: weeks }, (_, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {days.slice(wi * 7, wi * 7 + 7).map((d, di) => (
              <div 
                key={di} 
                title={`${format(d.date, 'MMM d')}: ${d.count} actions`}
                className={clsx('w-3 h-3 rounded-[2px] transition-colors duration-500', getColor(d.count))} 
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Past 105 Days</p>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(i => <div key={i} className={clsx('w-2.5 h-2.5 rounded-[2px]', getColor(i))} />)}
          <span>More</span>
        </div>
      </div>
    </Card>
  )
}

// ... KanbanBoard ...
function KanbanBoard({ complaints }: { complaints: any[] }) {
  const columns = [
    { id: 'todo', label: 'To Do', icon: <Clock size={16} />, statuses: ['submitted', 'under_review'] },
    { id: 'wip', label: 'In Progress', icon: <TrendingUp size={16} />, statuses: ['assigned', 'in_progress', 'escalated'] },
    { id: 'done', label: 'Resolved', icon: <CheckCircle2 size={16} />, statuses: ['resolved', 'verified', 'closed'] },
  ]

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 mt-6 custom-scrollbar">
      {columns.map(col => {
        const items = complaints.filter(c => col.statuses.includes(c.status))
        return (
          <div key={col.id} className="min-w-[280px] flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-primary-400">{col.icon}</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">{col.label}</h4>
              </div>
              <Badge variant="info">{items.length}</Badge>
            </div>
            
            <div className="flex-1 space-y-4 p-2 rounded-3xl bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-white/5 min-h-[400px]">
              {items.map(c => (
                <Link to={`/complaints/track/${c.referenceId}`} key={c.id}>
                  <Card hover className="p-4 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-primary-500/30">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl">{CATEGORY_META[c.category as keyof typeof CATEGORY_META].icon}</span>
                      <Badge variant={c.severity >= 7 ? 'error' : c.severity >= 4 ? 'warning' : 'info'}>
                        Sev {c.severity}
                      </Badge>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900 dark:text-white mb-1 line-clamp-1">{c.title}</h5>
                    <p className="text-[10px] text-slate-500 font-mono mb-3">{c.referenceId}</p>
                    
                    <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5">
                      <div className="flex -space-x-2">
                        <Avatar name={c.citizenName} size="sm" className="border-2 border-dark-900" />
                        {c.assignedOfficer && <Avatar name={c.assignedOfficer} size="sm" className="border-2 border-dark-900 bg-brand-violet" />}
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase">{format(new Date(c.createdAt), 'MMM d')}</span>
                    </div>
                  </Card>
                </Link>
              ))}
              {items.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <div className="text-2xl mb-2">📭</div>
                  <p className="text-[10px] font-bold uppercase tracking-widest">No items here</p>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// --- Calendar View Component ---
function CalendarView({ complaints }: { complaints: any[] }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const prevMonthDays = Array.from({ length: firstDayOfMonth }, (_, i) => i)

  return (
    <Card className="p-8 rounded-3xl border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/5">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <ChevronRight size={18} className="rotate-180" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center pb-4">{d}</div>
        ))}
        
        {prevMonthDays.map(d => <div key={`p-${d}`} className="aspect-square opacity-20" />)}
        
        {days.map(day => {
          const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
          const dayComplaints = complaints.filter(c => isSameDay(new Date(c.createdAt), dayDate))
          
          return (
            <div key={day} className="relative aspect-square rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center group hover:border-primary-500/50 transition-all cursor-pointer">
              <span className="text-sm font-bold text-slate-500 group-hover:text-primary-500">{day}</span>
              {dayComplaints.length > 0 && (
                <div className="absolute bottom-2 flex gap-0.5">
                  {dayComplaints.slice(0, 3).map((c, i) => (
                    <div key={i} className={clsx('w-1 h-1 rounded-full', STATUS_META[c.status as keyof typeof STATUS_META].color)} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// --- Map View Component ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function MapView({ complaints }: { complaints: any[] }) {
  const center: [number, number] = complaints.length > 0 
    ? [complaints[0].location.lat, complaints[0].location.lng]
    : [28.6139, 77.2090]

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full z-0">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {complaints.map(c => (
        <Marker key={c.id} position={[c.location.lat, c.location.lng]}>
          <Popup className="rounded-2xl overflow-hidden">
            <div className="p-2 min-w-[200px]">
              <h4 className="text-xs font-black text-slate-900 mb-2">{c.title}</h4>
              <Badge variant={c.status === 'resolved' ? 'success' : 'info'}>{c.status}</Badge>
              <Link to={`/complaints/track/${c.referenceId}`} className="block mt-4 text-[10px] font-bold text-primary-500 uppercase tracking-widest hover:underline">Track Report →</Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

// --- Main Dashboard Component ---
export default function UserDashboard() {
  const { user } = useAuthStore()
  const { 
    complaints, 
    viewMode, 
    setViewMode, 
    filterStatus, 
    filterCategory,
    searchQuery, 
    setFilter, 
    initializeComplaints,
    isLoading
  } = useComplaintStore()
  const navigate = useNavigate()

  useEffect(() => {
    const unsubscribe = initializeComplaints();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initializeComplaints]);

  const getFilteredComplaints = () => {
    // Priority 1: Filter by current user only for history
    let list = complaints.filter(c => c.citizenId === user?.id)
    
    // Priority 2: Apply filters
    if (filterStatus !== 'all') {
      list = list.filter(c => c.status === filterStatus)
    }
    if (filterCategory !== 'all') {
      list = list.filter(c => c.category === filterCategory)
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.referenceId.toLowerCase().includes(q)
      )
    }
    return list
  }

  const myComplaints = complaints.filter(c => c.citizenId === user?.id)
  const filtered = getFilteredComplaints()

  const stats = [
    { label: 'Total Filed', value: myComplaints.length, icon: '📋', trend: 12 },
    { label: 'Resolved', value: myComplaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status)).length, icon: '✅', trend: 8, color: 'emerald' },
    { label: 'Avg Time', value: '2.4d', icon: '⏱️', trend: -5, color: 'blue' },
    { label: 'Rewards', value: user?.rewardPoints || 0, icon: '🏅', trend: 25, color: 'amber' },
  ]

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden">
      {/* Background Texture - High Utility Feel */}
      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.08] pointer-events-none">
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-0 left-0 w-full h-full bg-dots [background-size:40px_40px]" />
        

      </div>

      <div className="max-w-[1400px] mx-auto px-6 pt-32 relative z-10">
        {/* Header Section ... */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16"
        >
          <div className="max-w-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Badge className="bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Citizen Portal</Badge>
              <div className="h-px w-12 bg-slate-200 dark:bg-white/10" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-brand-navy dark:text-white font-display tracking-tight leading-[0.9]">
              Hello, <span className="text-brand-indigo">{(user?.name || 'Citizen').split(' ')[0]}.</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-6 font-medium leading-relaxed">
              Tracking your local reports and civic impact in <span className="text-brand-navy dark:text-slate-200 font-bold">{format(new Date(), 'MMMM yyyy')}</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Identity Badge */}
            <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white dark:bg-white/5 border-2 border-brand-indigo/20 shadow-soft -rotate-1">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-900 flex items-center justify-center">
                <Avatar name={user?.name || 'C'} size="sm" />
              </div>
              <div>
                <p className="text-[10px] font-black text-brand-indigo uppercase leading-none">Verified Citizen</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">ID: #{user?.id?.slice(0, 6).toUpperCase()}</p>
              </div>
            </div>
            <Link to="/complaints/new">
              <Button size="xl" className="btn-handcrafted px-10 shadow-handcrafted bg-brand-navy dark:bg-brand-indigo">
                <Plus size={20} className="mr-2" /> File New Report
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Grid - Breaking Symmetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative group"
            >
              {isLoading ? (
                <Skeleton className="h-32 rounded-xl" />
              ) : (
                <div className="glass p-6 rounded-handcrafted border-2 border-slate-200 dark:border-white/10 relative overflow-hidden group hover:translate-y-[-8px] transition-all duration-500 hover:shadow-handcrafted">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-bl-[2.5rem] -tr-4 z-0" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                      <span className={clsx(
                        "text-[10px] font-black px-2 py-0.5 rounded-full",
                        s.trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                      )}>{s.trend > 0 ? '+' : ''}{s.trend}%</span>
                    </div>
                    <p className="text-3xl font-black text-brand-navy dark:text-white leading-none">{s.value}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">{s.label}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-8 space-y-8">
            {/* View Controls & Filter */}
            <Card className="p-4 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-950/50 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
                {[
                  { id: 'list', icon: <List size={16} />, label: 'List' },
                  { id: 'kanban', icon: <Layout size={16} />, label: 'Kanban' },
                  { id: 'calendar', icon: <Calendar size={16} />, label: 'Calendar' },
                  { id: 'map', icon: <MapIcon size={16} />, label: 'Map' },
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setViewMode(v.id as any)}
                    className={clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300',
                      viewMode === v.id ? 'bg-primary-500 text-slate-900 dark:text-white shadow-glow-blue' : 'text-slate-500 hover:text-slate-900 dark:text-white'
                    )}
                  >
                    {v.icon} <span className="hidden sm:inline">{v.label}</span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 flex-1 lg:max-w-xs">
                <div className="relative w-full">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input 
                    placeholder="Search your reports..."
                    className="w-full bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white focus:border-primary-500/50 outline-none transition-all"
                    value={searchQuery}
                    onChange={e => setFilter('searchQuery', e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" className="px-3">
                  <Filter size={16} />
                </Button>
              </div>
            </Card>

            <AnimatePresence mode="wait">
              {viewMode === 'list' && (
                <motion.div 
                  key="list-view"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {isLoading ? Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-3xl" />) : (
                    filtered.map((c, i) => (
                      <motion.div 
                        key={c.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link to={`/complaints/track/${c.referenceId}`}>
                          <div className="glass p-5 rounded-[2rem] border border-slate-200 dark:border-white/5 hover:border-primary-500/30 transition-all duration-300 group cursor-pointer flex flex-col sm:flex-row sm:items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform shadow-inner">
                              {CATEGORY_META[c.category].icon}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-xs font-mono text-slate-600 font-bold uppercase tracking-widest">{c.referenceId}</span>
                                <Badge variant={STATUS_META[c.status].label === 'Resolved' ? 'success' : 'info'}>
                                  {STATUS_META[c.status].label}
                                </Badge>
                              </div>
                              <h4 className="text-lg font-bold text-slate-900 dark:text-white truncate group-hover:text-primary-400 transition-colors">
                                {c.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-xs text-slate-500 flex items-center gap-1.5"><MapIcon size={12} /> {c.ward}</p>
                                <p className="text-xs text-slate-500 flex items-center gap-1.5"><Clock size={12} /> {format(new Date(c.createdAt), 'MMM d, yyyy')}</p>
                              </div>
                            </div>

                            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-white/5 pt-4 sm:pt-0 sm:pl-6">
                              <div className="text-right">
                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">Engagement</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">👍 {c.upvotes}</p>
                              </div>
                              <button className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-white transition-colors">
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))
                  )}
                  {filtered.length === 0 && !isLoading && (
                    <div className="py-20 text-center">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No complaints found</h3>
                      <p className="text-slate-500">Try adjusting your search or filters</p>
                    </div>
                  )}
                </motion.div>
              )}

              {viewMode === 'kanban' && (
                <motion.div key="kanban-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <KanbanBoard complaints={myComplaints} />
                </motion.div>
              )}
              {viewMode === 'calendar' && (
                <motion.div key="calendar-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
                  <CalendarView complaints={myComplaints} />
                </motion.div>
              )}

              {viewMode === 'map' && (
                <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-[600px] rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5">
                  <MapView complaints={myComplaints} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Panel */}
          <div className="lg:col-span-4 space-y-8">
            {/* Insights Heatmap */}
            <ActivityHeatmap />

            {/* Achievements Section */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> Milestones
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {user?.badges.map(b => (
                  <motion.div 
                    key={b.id}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-3xl shadow-glow-violet border border-amber-500/20">
                      {b.icon}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 text-center leading-tight uppercase">{b.name}</span>
                  </motion.div>
                ))}
                <div className="flex flex-col items-center gap-2 opacity-30 grayscale">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-3xl">
                    🔒
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 text-center uppercase">10 Reports</span>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-6 text-primary-400">View All Badges</Button>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <Plus size={16} className="text-primary-400" /> Resources
              </h3>
              <div className="space-y-2">
                {[
                  { icon: <Download size={16} />, label: 'Export Activity (PDF)' },
                  { icon: <Bell size={16} />, label: 'Notification Settings' },
                  { icon: <Share2 size={16} />, label: 'Invite Neighbors' },
                  { 
                    icon: <FileText size={16} />, 
                    label: 'View Civic Pulse', 
                    link: '/community' 
                  },
                ].map((item, i) => (
                  <Link to={(item as any).link || '#'} key={i} className="block">
                    <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-white/10 border border-slate-200 dark:border-white/5 transition-all text-left">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{item.icon}</span>
                        <span className="text-sm text-slate-300 font-medium">{item.label}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600" />
                    </button>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
