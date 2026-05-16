import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_META, STATUS_META } from '../../utils/mockData'
import { Button, Badge, Avatar } from '../../components/ui'
import { Link } from 'react-router-dom'
import {
  Map as MapIcon, ChevronRight, TrendingUp, Clock, Award, Download, Bell, Share2, Zap, FileText
} from 'lucide-react'
import { subDays, isSameDay, formatDistanceToNow } from 'date-fns'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})
L.Marker.prototype.options.icon = DefaultIcon

// --- Activity Heatmap Component ---
function ActivityHeatmap() {
  const weeks = 15
  const days = Array.from({ length: weeks * 7 }, (_, i) => {
    const date = subDays(new Date(), (weeks * 7 - 1 - i))
    const count = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0
    return { date, count }
  })

  const getColor = (c: number) => {
    if (c === 0) return 'bg-white/5'
    if (c === 1) return 'bg-brand-indigo/30'
    if (c === 2) return 'bg-brand-indigo/50'
    if (c === 3) return 'bg-brand-indigo/70'
    return 'bg-brand-indigo shadow-[0_0_4px_rgba(79,70,229,0.6)]'
  }

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
        {Array.from({ length: weeks }, (_, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {days.slice(wi * 7, wi * 7 + 7).map((d, di) => (
              <div
                key={di}
                className={`w-3 h-3 rounded-[2px] transition-colors duration-500 ${getColor(d.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Past 105 Days</p>
        <div className="flex items-center gap-1 text-[9px] text-slate-500">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map(i => <div key={i} className={`w-2 h-2 rounded-[2px] ${getColor(i)}`} />)}
          <span>More</span>
        </div>
      </div>
    </div>
  )
}

// --- Main Dashboard Component ---
export default function UserDashboard() {
  const { user } = useAuthStore()
  const {
    complaints,
    filterStatus,
    filterCategory,
    searchQuery,
    setFilter,
    initializeComplaints,
  } = useComplaintStore()

  useEffect(() => {
    const unsubscribe = initializeComplaints()
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [initializeComplaints])

  const myComplaints = complaints.filter(c => c.citizenId === user?.id)

  const getFilteredComplaints = () => {
    let list = [...myComplaints]
    if (filterStatus !== 'all') list = list.filter(c => c.status === filterStatus)
    if (filterCategory !== 'all') list = list.filter(c => c.category === filterCategory)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.referenceId.toLowerCase().includes(q)
      )
    }
    return list
  }

  const filtered = getFilteredComplaints()

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617] pointer-events-auto">
      {/* 1. Fullscreen Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {myComplaints.map(c => (
            <Marker key={c.id} position={[c.location.lat, c.location.lng]}>
              <Popup className="custom-cinematic-popup">
                <div className="p-3">
                  <h4 className="text-[10px] font-black text-neon-cyan uppercase tracking-widest mb-1">{c.referenceId}</h4>
                  <p className="text-sm font-bold text-white leading-tight drop-shadow-sm">{c.title}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/60 via-transparent to-[#020617]/60 pointer-events-none z-10" />
      </div>

      {/* 2. HUD Layer */}
      <div className="absolute inset-0 z-20 pointer-events-none flex p-6 pt-24 pb-28 lg:p-8 lg:pt-24 lg:pb-32 gap-8">

        {/* LEFT: Citizen Profile & Impact */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-80 flex flex-col gap-5 pointer-events-auto"
        >
          {/* Identity Card */}
          <div className="glass-premium p-6 rounded-[2rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/60 backdrop-blur-3xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-indigo/20 blur-3xl rounded-full z-0" />
            <div className="flex items-center gap-4 mb-5 relative z-10">
              <Avatar name={user?.name || 'C'} size="lg" className="ring-4 ring-brand-indigo/30 shadow-glow-blue" />
              <div>
                <p className="text-[9px] font-black text-neon-cyan uppercase tracking-[0.25em]">Verified Citizen</p>
                <h2 className="text-xl font-black text-white">{user?.name?.split(' ')[0] || 'Citizen'}</h2>
                <p className="text-[10px] text-slate-400 font-bold font-mono">ID: #{user?.id?.slice(0, 6).toUpperCase()}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 relative z-10">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-white">{myComplaints.length}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Reports</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-emerald-400">{myComplaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status)).length}</p>
                <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-1">Resolved</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-3 text-center shadow-inner-glow">
                <p className="text-2xl font-black text-amber-400">{user?.rewardPoints || 0}</p>
                <p className="text-[8px] font-black uppercase text-amber-400/70 tracking-widest mt-1">Score</p>
              </div>
            </div>

            <Link to="/complaints/new">
              <Button glow className="w-full mt-5 bg-gradient-to-r from-brand-indigo to-neon-cyan border-white/20 font-black uppercase tracking-widest text-[10px] relative z-10">
                + File New Report
              </Button>
            </Link>
          </div>

          {/* Heatmap */}
          <div className="glass-premium p-5 rounded-[2rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/60 backdrop-blur-3xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <TrendingUp size={12} className="text-brand-indigo" /> Impact Heatmap
            </h3>
            <ActivityHeatmap />
          </div>

          {/* Awards */}
          <div className="glass-premium p-5 rounded-[2rem] border border-white/10 panel-shine bg-[#020617]/60 backdrop-blur-3xl flex-1 overflow-hidden">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <Award size={12} className="text-amber-400" /> Milestones
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {(user?.badges || []).map((b: any) => (
                <div key={b.id} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-xl shadow-glow-amber border border-amber-500/30 group-hover:scale-110 transition-transform">
                    <span>{b.icon}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-400 text-center uppercase tracking-wider truncate w-full text-center">{b.name}</span>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2 opacity-40">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center text-xl">🔒</div>
                <span className="text-[8px] font-black text-slate-500 text-center uppercase tracking-wider">10 Reports</span>
              </div>
            </div>
          </div>

          {/* Quick Resources */}
          <div className="glass-premium p-5 rounded-[2rem] border border-white/10 panel-shine bg-[#020617]/60 backdrop-blur-3xl">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
              <Zap size={12} className="text-neon-cyan" /> Resources
            </h3>
            <div className="space-y-2">
              {[
                { icon: <Download size={14} />, label: 'Export Activity' },
                { icon: <Bell size={14} />, label: 'Notifications' },
                { icon: <Share2 size={14} />, label: 'Invite Neighbors' },
                { icon: <FileText size={14} />, label: 'Civic Pulse', link: '/community' },
              ].map((item, i) => (
                <Link to={(item as any).link || '#'} key={i}>
                  <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-brand-indigo/20 border border-white/5 hover:border-brand-indigo/30 transition-all text-left group">
                    <div className="p-1.5 rounded-lg bg-white/5 text-slate-400 group-hover:text-neon-cyan transition-colors">{item.icon}</div>
                    <span className="text-[11px] text-slate-300 font-bold group-hover:text-white transition-colors">{item.label}</span>
                    <ChevronRight size={12} className="text-slate-600 group-hover:text-neon-cyan transition-colors ml-auto" />
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Reports Feed */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 h-full flex flex-col glass-premium rounded-[2.5rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/60 backdrop-blur-3xl overflow-hidden pointer-events-auto max-w-xl ml-auto"
        >
          {/* Search header */}
          <div className="p-5 border-b border-white/5 bg-white/[0.02] flex gap-3">
            <input
              value={searchQuery}
              onChange={e => setFilter('searchQuery', e.target.value)}
              placeholder="Search reports..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:border-neon-cyan outline-none transition-all"
            />
            <select
              value={filterStatus}
              onChange={e => setFilter('filterStatus', e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer appearance-none min-w-[100px]"
            >
              <option value="all" className="bg-[#020617]">All</option>
              <option value="submitted" className="bg-[#020617]">Submitted</option>
              <option value="in_progress" className="bg-[#020617]">Live</option>
              <option value="resolved" className="bg-[#020617]">Resolved</option>
            </select>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {filtered.map(c => (
              <Link to={`/complaints/track/${c.referenceId}`} key={c.id}>
                <div className="p-4 rounded-2xl border border-white/5 hover:border-brand-indigo/50 hover:bg-white/5 transition-all cursor-pointer group flex gap-4 relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-neon-cyan transition-all" />
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl group-hover:rotate-6 transition-transform shadow-inner-glow flex-shrink-0">
                    {CATEGORY_META[c.category]?.icon || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-[9px] font-black text-brand-indigo uppercase tracking-[0.2em]">{c.referenceId}</p>
                      <Badge variant={STATUS_META[c.status]?.label === 'Resolved' ? 'success' : 'info'} className="text-[8px]">
                        {STATUS_META[c.status]?.label}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-black text-white leading-tight mb-2 group-hover:text-neon-cyan transition-colors truncate">{c.title}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                        <MapIcon size={10} className="text-brand-indigo" /> {c.ward}
                      </span>
                      <span className="w-0.5 h-0.5 rounded-full bg-white/20" />
                      <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                        <Clock size={10} className="text-neon-cyan" /> {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center justify-center pl-3 border-l border-white/10">
                    <ChevronRight size={18} className="text-slate-500 group-hover:text-neon-cyan transition-colors" />
                  </div>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center">
                <div className="text-4xl mb-4 grayscale opacity-40">📭</div>
                <h3 className="text-sm font-black text-white tracking-[0.1em] uppercase">No Logs Found</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">
                  {myComplaints.length === 0 ? 'File your first report to get started.' : 'Try adjusting your filters.'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
