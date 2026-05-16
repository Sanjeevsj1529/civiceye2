import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, query, where, onSnapshot, doc, updateDoc, limit } from 'firebase/firestore'
import { db } from '../../firebase'
import { formatDistanceToNow } from 'date-fns'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { 
  TrendingUp, ClipboardList, Building2, Map as MapIcon, Activity,
  BarChart3, Users, Shield, AlertTriangle, 
  Search, Filter, Download, Zap, ChevronRight, 
  MapPin, Clock, CheckCircle2, MessageSquare, Bell, X, User
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Card, StatCard, Badge, Button, Avatar, ProgressBar } from '../../components/ui'
import { WARDS, OFFICERS, STATUS_META, CATEGORY_META } from '../../utils/mockData'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { useComplaintStore } from '../../store/complaintStore'
import { useNotificationStore } from '../../store/notificationStore'
import { Link } from 'react-router-dom'
import { format, subDays, isSameDay } from 'date-fns'

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

const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e']

// Mock Data for Charts
const chartData = [
  { name: 'Mon', count: 45, resolved: 32 },
  { name: 'Tue', count: 52, resolved: 38 },
  { name: 'Wed', count: 61, resolved: 45 },
  { name: 'Thu', count: 58, resolved: 50 },
  { name: 'Fri', count: 72, resolved: 55 },
  { name: 'Sat', count: 48, resolved: 40 },
  { name: 'Sun', count: 35, resolved: 30 },
]

const categoryData = [
  { name: 'Pothole', value: 35 },
  { name: 'Garbage', value: 25 },
  { name: 'Water', value: 20 },
  { name: 'Power', value: 15 },
  { name: 'Safety', value: 5 },
]

const DUMMY_WORKERS = [
  { id: 'w1', name: 'Ramesh Kumar', role: 'officer', department: 'Water & Sewage', avatar: '👨‍🔧', isOnline: true },
  { id: 'w2', name: 'Suresh Singh', role: 'officer', department: 'Electricity', avatar: '⚡', isOnline: true },
  { id: 'w3', name: 'Amit Sharma', role: 'officer', department: 'Roads & Infrastructure', avatar: '👷', isOnline: false },
  { id: 'w4', name: 'Priya Verma', role: 'officer', department: 'Health & Environment', avatar: '👩‍⚕️', isOnline: true },
  { id: 'w5', name: 'Vikram Das', role: 'officer', department: 'Sanitation', avatar: '🧹', isOnline: true },
]

const DEPARTMENTS = [
  'Sanitation',
  'Electricity',
  'Water & Sewage',
  'Roads & Infrastructure',
  'Public Safety',
  'Health & Environment'
];

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analytics' | 'management' | 'users'>('analytics')
  const { user } = useAuthStore()
  const { complaints, initializeComplaints, isLoading, updateComplaintStatus } = useComplaintStore()
  const { initializeNotifications, unreadCount, notifications, markAllAsRead } = useNotificationStore()
  const [lastCount, setLastCount] = useState(0)
  const [pulseView, setPulseView] = useState<'chart' | 'map'>('map')
  const [showNotification, setShowNotification] = useState(false)
  const [assigningComplaint, setAssigningComplaint] = useState<any>(null)
  const [deskSearch, setDeskSearch] = useState('')
  const [deskStatus, setDeskStatus] = useState('all')
  const [managingUser, setManagingUser] = useState<any>(null)

  const [officers, setOfficers] = useState<any[]>([])
  const [loadingOfficers, setLoadingOfficers] = useState(true)
  const [showAddOfficerModal, setShowAddOfficerModal] = useState(false)
  const [newOfficer, setNewOfficer] = useState({ name: '', email: '', department: DEPARTMENTS[0], phone: '' })

  useEffect(() => {
    if (!user) return;

    const unsubscribe = initializeComplaints();
    
    // Initialize notifications
    let unsubNotifications = () => {};
    try {
      unsubNotifications = initializeNotifications(user.id, 'admin');
    } catch (err) {
      console.error("Failed to init notifications:", err);
    }
    
    // Fetch all users for the management tab (Super Admin power)
    let unsubUsers = () => {};
    try {
      const qUsers = query(collection(db, 'users'), limit(50));
      unsubUsers = onSnapshot(qUsers, (snapshot) => {
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        setOfficers(userData);
        setLoadingOfficers(false);
      }, (error) => {
        console.error("Error fetching users directory:", error);
        setLoadingOfficers(false);
      });
    } catch (err) {
      console.error("Failed to setup users listener:", err);
      setLoadingOfficers(false);
    }

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
      if (typeof unsubUsers === 'function') unsubUsers();
      if (typeof unsubNotifications === 'function') unsubNotifications();
    };
  }, [user, initializeComplaints, initializeNotifications]);

  // Alert system for new complaints
  useEffect(() => {
    if (complaints.length > lastCount && lastCount > 0) {
      setShowNotification(true)
      const timer = setTimeout(() => setShowNotification(false), 5000)
      return () => clearTimeout(timer)
    }
    setLastCount(complaints.length)
  }, [complaints.length, lastCount])

  const areaName = user?.role === 'super_admin' ? 'City Operations' : (user?.wardName || 'Zonal Operations');

  const getWorkerStats = (workerId: string) => {
    const workerTasks = complaints.filter(c => c.assignedOfficerId === workerId);
    const resolvedTasks = workerTasks.filter(c => ['resolved', 'verified', 'closed'].includes(c.status));
    return {
      taskCount: workerTasks.length,
      resolvedCount: resolvedTasks.length,
    };
  };

  const fieldOfficers = officers.filter(o => o.role === 'officer');
  
  const departmentStats = DEPARTMENTS.map(dept => {
    const deptWorkers = fieldOfficers.filter(o => o.department === dept);
    const onlineWorkers = deptWorkers.filter(o => o.isOnline !== false);
    return {
      name: dept,
      total: deptWorkers.length,
      online: onlineWorkers.length
    };
  });

  const scopedComplaints = [...complaints]
    .filter(c => c && c.location && typeof c.location.lat === 'number' && typeof c.location.lng === 'number')
    .filter(c => user?.role === 'super_admin' || !user?.wardId || c.wardId === user.wardId)
    .sort((a, b) => ((b as any).socialPriority || 0) - ((a as any).socialPriority || 0));

  const filteredDeskComplaints = scopedComplaints.filter(c => {
    const searchLower = deskSearch.toLowerCase();
    const matchesSearch = deskSearch === '' || 
      c.referenceId?.toLowerCase().includes(searchLower) ||
      c.title?.toLowerCase().includes(searchLower) ||
      c.location?.address?.toLowerCase().includes(searchLower);
    
    const matchesStatus = deskStatus === 'all' || 
      (deskStatus === 'new' && c.status === 'submitted') ||
      (deskStatus === 'resolved' && c.status === 'resolved') ||
      (deskStatus === 'in_progress' && ['assigned', 'in_progress'].includes(c.status));

    return matchesSearch && matchesStatus;
  });

  const criticalAlerts = scopedComplaints.filter(c => {
    return (c.severity || 0) >= 8 || c.status === 'escalated';
  });

  // Dynamic Chart Data
  const dynamicChartData = Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dayName = format(date, 'EEE');
    const dayComplaints = scopedComplaints.filter(c => c.createdAt && isSameDay(new Date(c.createdAt), date));
    return {
      name: dayName,
      count: dayComplaints.length,
      resolved: dayComplaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status)).length
    };
  });

  // Dynamic Category Data
  const categories = ['pothole', 'garbage', 'water_leakage', 'electricity', 'street_light', 'drainage', 'public_safety', 'other'];
  const dynamicCategoryData = categories.map(cat => ({
    name: CATEGORY_META[cat as keyof typeof CATEGORY_META]?.label || 'Other',
    value: scopedComplaints.filter(c => c.category === cat).length
  })).filter(c => c.value > 0);

  // Dynamic Ward Data
  const dynamicWardData = WARDS.map(ward => {
    const wardComplaints = complaints.filter(c => c.wardId === ward.id);
    const resolved = wardComplaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status));
    return {
      ...ward,
      totalComplaints: wardComplaints.length,
      resolvedComplaints: resolved.length,
      slaComplianceRate: wardComplaints.length > 0 
        ? Math.round((resolved.length / wardComplaints.length) * 100) 
        : 100
    };
  });

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-[#020617] pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-20" />
        <div className="absolute left-1/4 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-indigo/15 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-neon-cyan/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="relative text-center">
          <div className="relative mx-auto mb-8 h-20 w-20">
            <div className="absolute inset-0 animate-spin rounded-3xl border-2 border-white/10 border-t-neon-cyan drop-shadow-lg" />
            <div className="absolute inset-4 rounded-2xl bg-gradient-to-br from-brand-indigo/60 to-neon-cyan/30 shadow-glow-blue backdrop-blur-md" />
          </div>
          <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse drop-shadow-sm">Syncing Command Center</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617] pointer-events-auto">
      {/* 1. Fullscreen Map Background */}
      <div className="absolute inset-0 z-0">
        <MapContainer 
          center={[28.6139, 77.2090]} 
          zoom={12} 
          className="h-full w-full custom-dark-map filter saturate-[1.2] contrast-125 opacity-70"
          zoomControl={false}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          {scopedComplaints.map(c => (
            <Circle 
              key={c.id}
              center={[c.location.lat, c.location.lng]}
              radius={400}
              pathOptions={{ 
                fillColor: c.severity >= 7 ? '#f43f5e' : '#06b6d4', 
                color: 'transparent',
                fillOpacity: 0.6
              }}
            >
              <Popup className="custom-cinematic-popup">
                <div className="p-3">
                  <p className="text-[10px] font-black uppercase text-neon-cyan mb-1 tracking-widest">{c.referenceId}</p>
                  <p className="text-sm font-black text-white leading-tight drop-shadow-sm">{c.title}</p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
        {/* Map Overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50 pointer-events-none z-10" />
        <div className="absolute inset-0 bg-noise opacity-[0.03] mix-blend-overlay pointer-events-none z-10" />
      </div>

      {/* HUD UI LAYER */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col p-6 pt-24 pb-24 lg:p-8 lg:pt-24 lg:pb-32">
        
        {/* Top HUD: Title & Mode Toggle */}
        <div className="flex justify-between items-start w-full">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-premium p-6 rounded-[2rem] border border-white/10 shadow-glow-lg pointer-events-auto panel-shine max-w-sm backdrop-blur-3xl bg-[#020617]/40"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-[0_0_8px_#06b6d4]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">Live Command</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter leading-none mb-2">City Ops</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{areaName}</p>
            
            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { id: 'analytics', icon: <TrendingUp size={14} />, label: 'Analytics' },
                { id: 'management', icon: <ClipboardList size={14} />, label: 'Triage' },
                { id: 'users', icon: <Users size={14} />, label: 'Personnel' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as any)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border',
                    tab === t.id ? 'bg-white/10 text-white border-neon-cyan shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-4 items-end pointer-events-auto"
          >
             <button 
                onClick={() => setShowNotification(!showNotification)}
                className="w-14 h-14 rounded-[1.25rem] glass-premium border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all shadow-glow-lg relative panel-shine bg-[#020617]/40 backdrop-blur-3xl"
              >
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.8)] border-2 border-[#020617]">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown inside HUD */}
              <AnimatePresence>
                {showNotification && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -20 }}
                    className="w-80 glass-premium border border-white/10 rounded-[2rem] shadow-glow-lg overflow-hidden panel-shine bg-[#020617]/80 backdrop-blur-3xl"
                  >
                     <div className="p-4 border-b border-white/5 flex items-center justify-between">
                       <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Alerts</h3>
                       <button onClick={() => markAllAsRead()} className="text-[9px] font-black text-neon-cyan uppercase">Clear</button>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto p-2">
                        {notifications.map((n: any) => (
                           <div key={n.id} className="p-3 rounded-xl hover:bg-white/5 mb-1 cursor-pointer transition-colors border-l-2 border-transparent hover:border-neon-cyan" onClick={() => { markAllAsRead(); setShowNotification(false); setTab('management'); setDeskSearch(n.referenceId); }}>
                              <p className="text-xs font-bold text-white">{n.title}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{n.message}</p>
                           </div>
                        ))}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
          </motion.div>
        </div>

        {/* Dynamic Center HUD Content based on Tab */}
        <div className="flex-1 flex w-full relative mt-8 pointer-events-none">
           <AnimatePresence mode="wait">
             
             {tab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex gap-6 h-full items-start">
                   {/* Left Panel: KPIs */}
                   <div className="w-80 flex flex-col gap-4 pointer-events-auto h-full overflow-y-auto custom-scrollbar pr-2">
                     {[
                        { label: 'Active', value: scopedComplaints.filter(c => !['resolved', 'closed'].includes(c.status)).length, icon: '🚨' },
                        { label: 'Critical', value: criticalAlerts.length, icon: '⚠️', color: 'text-rose-500' },
                        { label: 'Live Personnel', value: fieldOfficers.filter(o => o.isOnline !== false).length, icon: '👷' },
                      ].map((s, i) => (
                        <div key={s.label} className="glass-premium p-6 rounded-[2rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/40 backdrop-blur-3xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 blur-2xl rounded-full z-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                           <div className="flex justify-between items-start relative z-10">
                              <div>
                                <p className={clsx("text-4xl font-black drop-shadow-md tracking-tighter leading-none mb-2", s.color || 'text-white')}>{s.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</p>
                              </div>
                              <span className="text-2xl drop-shadow-lg">{s.icon}</span>
                           </div>
                        </div>
                      ))}
                   </div>

                   {/* Bottom Center Panel: Charts floating */}
                   <div className="flex-1 flex flex-col justify-end h-full pointer-events-none pb-4">
                      <div className="glass-premium p-6 rounded-[2.5rem] border border-white/10 shadow-glow-lg panel-shine bg-[#020617]/40 backdrop-blur-3xl pointer-events-auto h-72 flex gap-8">
                         <div className="flex-1">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 drop-shadow-sm">Trend Velocity</h3>
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={dynamicChartData}>
                                <defs>
                                  <linearGradient id="hudCount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(12px)' }} itemStyle={{ color: '#06b6d4' }} />
                                <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={4} fillOpacity={1} fill="url(#hudCount)" />
                              </AreaChart>
                            </ResponsiveContainer>
                         </div>
                         <div className="w-1/3">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white mb-4 drop-shadow-sm">Mix</h3>
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={dynamicCategoryData} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                                  {dynamicCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(2, 6, 23, 0.8)', border: 'none', borderRadius: '12px' }} />
                              </PieChart>
                            </ResponsiveContainer>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}

             {tab === 'management' && (
                <motion.div key="triage" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex justify-end h-full pointer-events-none">
                  {/* Right Panel: Triage Desk */}
                  <div className="w-full max-w-xl h-full flex flex-col pointer-events-auto glass-premium rounded-[2.5rem] border border-white/10 shadow-glow-lg bg-[#020617]/60 backdrop-blur-3xl overflow-hidden panel-shine">
                     <div className="p-6 border-b border-white/5 flex gap-4 bg-white/[0.02]">
                        <input value={deskSearch} onChange={(e) => setDeskSearch(e.target.value)} placeholder="Filter ID/Title..." className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-500 focus:border-neon-cyan outline-none transition-all shadow-inner-glow" />
                        <select value={deskStatus} onChange={(e) => setDeskStatus(e.target.value)} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer">
                          <option value="all" className="bg-[#020617]">All</option>
                          <option value="new" className="bg-[#020617]">New</option>
                          <option value="in_progress" className="bg-[#020617]">Live</option>
                        </select>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                        {filteredDeskComplaints.map(c => (
                           <div key={c.id} className="p-5 rounded-2xl border border-transparent hover:bg-white/5 hover:border-white/10 transition-all mb-2 cursor-pointer group flex gap-4">
                              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-inner-glow">{CATEGORY_META[c.category]?.icon || '📋'}</div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <p className="text-[9px] font-black text-brand-indigo uppercase tracking-[0.2em]">{c.referenceId}</p>
                                  <Badge className="text-[8px]">{c.status.replace('_', ' ')}</Badge>
                                </div>
                                <h4 className="text-sm font-black text-white leading-tight mb-2 group-hover:text-neon-cyan transition-colors">{c.title}</h4>
                                <div className="flex gap-2">
                                  <Link to={`/complaints/track/${c.referenceId}`} className="text-[9px] font-black uppercase text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/10">Review</Link>
                                  {(c.status === 'submitted' || c.status === 'escalated') && (
                                    <button onClick={() => setAssigningComplaint(c)} className="text-[9px] font-black uppercase text-neon-cyan px-3 py-1.5 rounded-lg border border-neon-cyan/30 hover:bg-neon-cyan/20 shadow-[0_0_10px_rgba(6,182,212,0.2)]">Deploy</button>
                                  )}
                                </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
             )}

             {tab === 'users' && (
                <motion.div key="users" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full flex justify-center items-center h-full pointer-events-none">
                  {/* Center Panel: Personnel */}
                  <div className="w-full max-w-4xl h-[80%] pointer-events-auto glass-premium rounded-[2.5rem] border border-white/10 shadow-glow-lg bg-[#020617]/60 backdrop-blur-3xl overflow-hidden panel-shine flex flex-col">
                     <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <h3 className="text-xl font-black text-white flex items-center gap-3"><Users size={20} className="text-neon-cyan" /> Personnel Grid</h3>
                        <Button size="sm" glow onClick={() => setShowAddOfficerModal(true)}>+ Recruit</Button>
                     </div>
                     <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                           {officers.map(o => (
                              <div key={o.id} className="p-5 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-inner-glow hover:border-brand-indigo/50 hover:-translate-y-1 transition-all group cursor-pointer" onClick={() => setManagingUser(o)}>
                                 <div className="flex gap-4 items-center">
                                    <Avatar name={o.name} src={o.avatar} size="md" className="ring-2 ring-white/10 group-hover:ring-neon-cyan/50" />
                                    <div>
                                       <p className="text-sm font-bold text-white truncate">{o.name}</p>
                                       <Badge variant={o.role === 'admin' ? 'success' : 'info'} className="text-[8px] mt-1">{o.role}</Badge>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </motion.div>
             )}

           </AnimatePresence>
        </div>

      </div>
      
      {/* Modals are kept outside the grid but use pointer-events-auto */}
      <AnimatePresence>
        {assigningComplaint && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAssigningComplaint(null)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md glass-premium border border-white/10 rounded-[2.5rem] shadow-glow-lg overflow-hidden panel-shine p-8 bg-[#020617]/90">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white flex items-center gap-3">Deploy Agent</h3>
                  <button onClick={() => setAssigningComplaint(null)} className="p-2 rounded-full bg-white/5 text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {fieldOfficers.map(worker => (
                    <button key={worker.id} onClick={() => { updateComplaintStatus(assigningComplaint.id, 'assigned', assigningComplaint.citizenId, assigningComplaint.referenceId, `Task assigned`, worker.id); setAssigningComplaint(null); }} className="w-full flex items-center justify-between p-4 rounded-[1.25rem] border border-white/10 bg-white/5 hover:bg-brand-indigo/20 transition-all text-left group">
                       <div>
                          <p className="text-sm font-bold text-white group-hover:text-neon-cyan">{worker.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-black">{worker.department}</p>
                       </div>
                       <ChevronRight size={18} className="text-slate-500 group-hover:text-neon-cyan" />
                    </button>
                  ))}
                </div>
             </motion.div>
          </div>
        )}

        {managingUser && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setManagingUser(null)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md glass-premium border border-white/10 rounded-[2.5rem] shadow-glow-lg overflow-hidden panel-shine p-8 bg-[#020617]/90">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white">Clearance Control</h3>
                  <button onClick={() => setManagingUser(null)} className="p-2 rounded-full bg-white/5 text-slate-400"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                   <p className="text-sm font-bold text-white">{managingUser.name}</p>
                   <div className="grid grid-cols-2 gap-4">
                     {['admin', 'citizen', 'officer', 'zonal_admin'].map(role => (
                       <button key={role} onClick={() => { updateDoc(doc(db, 'users', managingUser.id), { role }); setManagingUser({ ...managingUser, role }); }} className={clsx('p-4 rounded-[1.25rem] border transition-all text-left text-[10px] font-black uppercase tracking-[0.2em]', managingUser.role === role ? 'bg-brand-indigo/20 border-neon-cyan text-neon-cyan shadow-glow-blue' : 'bg-white/5 border-white/10 text-slate-400')}>
                         {role.replace('_', ' ')}
                       </button>
                     ))}
                   </div>
                </div>
             </motion.div>
           </div>
        )}

        {showAddOfficerModal && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 pointer-events-auto">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddOfficerModal(false)} className="absolute inset-0 bg-[#020617]/80 backdrop-blur-xl" />
             <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md glass-premium border border-white/10 rounded-[2.5rem] shadow-glow-lg overflow-hidden panel-shine p-8 bg-[#020617]/90">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white">Recruit Agent</h3>
                  <button onClick={() => setShowAddOfficerModal(false)} className="p-2 rounded-full bg-white/5 text-slate-400"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                  <input value={newOfficer.name} onChange={(e) => setNewOfficer({ ...newOfficer, name: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none" placeholder="Agent Name" />
                  <input value={newOfficer.email} onChange={(e) => setNewOfficer({ ...newOfficer, email: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white outline-none" placeholder="Email ID" />
                  <Button glow size="xl" className="w-full mt-4" onClick={() => setShowAddOfficerModal(false)}>Deploy</Button>
                </div>
             </motion.div>
           </div>
        )}
      </AnimatePresence>
    </div>
  )
}
