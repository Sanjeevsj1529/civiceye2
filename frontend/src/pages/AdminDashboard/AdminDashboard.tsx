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
  { id: 'w1', name: 'Ramesh Kumar', role: 'Plumber', avatar: '👨‍🔧', isOnline: true },
  { id: 'w2', name: 'Suresh Singh', role: 'Electrician', avatar: '⚡', isOnline: true },
  { id: 'w3', name: 'Amit Sharma', role: 'Civil Worker', avatar: '👷', isOnline: false },
  { id: 'w4', name: 'Priya Verma', role: 'Health Inspector', avatar: '👩‍⚕️', isOnline: true },
  { id: 'w5', name: 'Vikram Das', role: 'Sanitation Lead', avatar: '🧹', isOnline: true },
]

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
      <div className="min-h-screen bg-slate-100 dark:bg-dark-950 pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-indigo border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Syncing Command Center...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pb-20 pt-32 px-6 relative overflow-hidden">
      {/* Background Texture for Admin Panel */}
      <div className="absolute inset-0 z-0 opacity-[0.35] dark:opacity-[0.08] pointer-events-none">
        <div className="absolute inset-0 bg-noise" />
        <div className="absolute top-0 left-0 w-full h-full bg-dots [background-size:40px_40px]" />
        

        <div className="absolute top-1/2 left-4 w-px h-32 bg-slate-200 dark:bg-white/10 -translate-y-1/2" />
        <div className="absolute top-1/2 right-4 w-px h-32 bg-slate-200 dark:bg-white/10 -translate-y-1/2" />
      </div>

      <div className="max-w-[1600px] mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="px-3 py-1 rounded-full bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-indigo inline-block mr-2 animate-pulse" />
                Live Command Center
              </div>
              <div className="h-px w-20 bg-slate-200 dark:bg-white/10" />
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-brand-navy dark:text-white tracking-tighter leading-[0.9]">
              City Operations <br />
              <span className="text-brand-indigo italic">Management HQ</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 mt-8 font-medium leading-relaxed">
              Real-time administrative control over city-wide reports, field personnel, and infrastructure health.
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Operational Patch */}
            <div className="hidden xl:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white dark:bg-white/5 border-2 border-brand-navy/10 dark:border-white/10 rotate-1 shadow-soft">
              <div className="w-8 h-8 rounded-full bg-brand-indigo flex items-center justify-center text-white text-[10px] font-black">CE</div>
              <div>
                <p className="text-[8px] font-black uppercase text-slate-400 leading-none">Ops Unit</p>
                <p className="text-[10px] font-bold text-brand-navy dark:text-white">v2.4.0-STABLE</p>
              </div>
            </div>
            <Button variant="outline" size="xl" className="btn-handcrafted border-2 border-brand-navy dark:border-white/20 text-brand-navy dark:text-white">
              <Download size={20} className="mr-2" /> Operations Report
            </Button>
            <Button size="xl" className="btn-handcrafted px-10 shadow-handcrafted bg-brand-navy dark:bg-brand-indigo">
              <Zap size={20} className="mr-2" /> Broadcast Alert
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowNotification(!showNotification)}
              className="w-12 h-12 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-soft relative"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-4 ring-brand-cream dark:ring-brand-navy">
                  {unreadCount}
                </span>
              )}
            </button>

              <AnimatePresence>
                {showNotification && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotification(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 z-50 origin-top-right"
                    >
                      <Card className="shadow-2xl border-white/10 overflow-hidden">
                        <div className="p-4 border-b border-white/5 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">Alerts</h3>
                          <button 
                            onClick={() => markAllAsRead()}
                            className="text-[10px] font-black text-primary-500 uppercase hover:underline"
                          >
                            Clear All
                          </button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                              <Bell size={32} className="mx-auto mb-3 text-slate-700 opacity-20" />
                              <p className="text-xs text-slate-500 font-medium">All clear! No new alerts.</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5">
                              {notifications.map((n: any) => (
                                <div 
                                  key={n.id} 
                                  className={clsx(
                                    "p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer relative",
                                    !n.isRead && "bg-primary-500/5"
                                  )}
                                  onClick={() => {
                                    useNotificationStore.getState().markAsRead(n.id);
                                    if (n.referenceId) {
                                      setTab('management');
                                      setDeskSearch(n.referenceId);
                                    }
                                    setShowNotification(false);
                                  }}
                                >
                                  {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />}
                                  <p className="text-xs font-bold text-slate-900 dark:text-white mb-1">{n.title}</p>
                                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{n.message}</p>
                                  <p className="text-[9px] text-slate-400 mt-2 uppercase font-black tracking-tighter">
                                    {formatDistanceToNow(new Date(n.createdAt?.toDate?.() || n.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
          </div>
        </div>

        {/* Navigation Tabs - Handcrafted feel */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          {[
            { id: 'analytics', label: 'Operations Analytics', icon: <TrendingUp size={16} /> },
            { id: 'management', label: 'Triage Desk', icon: <ClipboardList size={16} /> },
            { id: 'users', label: 'Personnel Directory', icon: <Users size={16} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={clsx(
                'flex items-center gap-3 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 border-2',
                tab === t.id 
                  ? 'bg-brand-navy text-white border-brand-navy dark:bg-white dark:text-brand-navy dark:border-white shadow-handcrafted' 
                  : 'text-slate-500 border-slate-200 dark:border-white/5 hover:border-brand-indigo dark:hover:border-white/20'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'analytics' && (
          <div className="space-y-12">
            {/* KPI Section - Breaking Symmetry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
              {[
                { label: 'Active Reports', value: scopedComplaints.filter(c => !['resolved', 'verified', 'closed'].includes(c.status)).length.toString(), icon: '🚨', trend: 12 },
                { label: 'Resolution Rate', value: '94.2%', icon: '✅', trend: 5 },
                { label: 'Live Personnel', value: DUMMY_WORKERS.filter(o => o.isOnline).length.toString(), icon: '👷', trend: 0 },
                { label: 'Critical Escalations', value: criticalAlerts.length.toString(), icon: '⚠️', trend: -2 },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <div className="glass p-8 rounded-handcrafted border-2 border-slate-200 dark:border-white/10 relative overflow-hidden hover:translate-y-[-8px] transition-all duration-500 hover:shadow-handcrafted">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-bl-[4rem] -tr-8 z-0" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{s.icon}</span>
                        {s.trend !== 0 && (
                          <span className={clsx(
                            "text-[10px] font-black px-3 py-1 rounded-full",
                            s.trend > 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                          )}>{s.trend > 0 ? '↑' : '↓'} {Math.abs(s.trend)}%</span>
                        )}
                      </div>
                      <p className="text-5xl font-black text-brand-navy dark:text-white tracking-tighter leading-none">{s.value}</p>
                      <p className="text-xs text-slate-500 font-black uppercase tracking-widest mt-4">{s.label}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8 overflow-hidden relative">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapIcon size={20} className="text-primary-500" /> Live City Pulse: Area Intelligence
                  </h3>
                  <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                    <button 
                      onClick={() => setPulseView('chart')}
                      className={clsx('p-1.5 rounded-lg transition-all', pulseView === 'chart' ? 'bg-primary-500 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white')}
                    >
                      <Activity size={16} />
                    </button>
                    <button 
                      onClick={() => setPulseView('map')}
                      className={clsx('p-1.5 rounded-lg transition-all', pulseView === 'map' ? 'bg-primary-500 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-white')}
                    >
                      <MapIcon size={16} />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {pulseView === 'chart' ? (
                    <motion.div key="chart" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dynamicChartData}>
                          <defs>
                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                            itemStyle={{ color: '#fff' }}
                          />
                          <Area type="monotone" dataKey="count" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                          <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </motion.div>
                  ) : (
                    <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-80 w-full rounded-2xl border border-slate-200 dark:border-white/5 overflow-hidden relative">
                       <MapContainer 
                          center={[28.6139, 77.2090]} 
                          zoom={12} 
                          className="h-full w-full"
                          zoomControl={false}
                        >
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                          {scopedComplaints.map(c => (
                            <Circle 
                              key={c.id}
                              center={[c.location.lat, c.location.lng]}
                              radius={300}
                              pathOptions={{ 
                                fillColor: c.severity >= 7 ? '#f43f5e' : '#06b6d4', 
                                color: 'transparent',
                                fillOpacity: 0.6
                              }}
                            >
                              <Popup className="custom-popup">
                                <div className="p-2">
                                  <p className="text-[10px] font-black uppercase text-slate-500 mb-1">{c.referenceId}</p>
                                  <p className="text-xs font-bold text-slate-900">{c.title}</p>
                                  <p className="text-[10px] text-slate-600 mt-1">{c.location.address}</p>
                                </div>
                              </Popup>
                            </Circle>
                          ))}
                        </MapContainer>
                        <div className="absolute bottom-4 left-4 z-[1000] glass px-3 py-1.5 rounded-lg border border-white/10">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-[8px] text-slate-900 dark:text-white font-bold uppercase">
                              <div className="w-2 h-2 bg-primary-500 rounded-full" /> Normal
                            </div>
                            <div className="flex items-center gap-2 text-[8px] text-slate-900 dark:text-white font-bold uppercase">
                              <div className="w-2 h-2 bg-rose-500 rounded-full" /> Critical
                            </div>
                          </div>
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              <Card className="p-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-8">Category Mix</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dynamicCategoryData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {dynamicCategoryData.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-xs text-slate-400">{c.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{c.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>
        )}

        {tab === 'management' && (
          <div className="space-y-10">
            {/* Real-time Triage */}
            <div className="grid lg:grid-cols-4 gap-12">
              <div className="lg:col-span-3">
                <Card className="p-0 border-2 border-brand-navy/20 dark:border-white/10 bg-white dark:bg-white/5 overflow-hidden rounded-[3rem] shadow-premium">
                  <div className="p-10 border-b-2 border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-8 bg-slate-50/50 dark:bg-white/5">
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                      <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          value={deskSearch}
                          onChange={(e) => setDeskSearch(e.target.value)}
                          placeholder="Search ID, Title, Location..." 
                          className="w-full bg-white dark:bg-dark-950 border-2 border-slate-200 dark:border-white/5 rounded-xl pl-12 pr-4 py-3 text-sm text-brand-navy dark:text-white focus:border-brand-indigo outline-none transition-all font-medium" 
                        />
                      </div>
                      <select 
                        value={deskStatus}
                        onChange={(e) => setDeskStatus(e.target.value)}
                        className="bg-white dark:bg-dark-950 border-2 border-slate-200 dark:border-white/5 rounded-xl px-6 py-3 text-xs font-black uppercase tracking-widest text-brand-navy dark:text-white outline-none cursor-pointer hover:border-brand-indigo transition-all"
                      >
                        <option value="all">Full Registry</option>
                        <option value="new">Unassigned</option>
                        <option value="in_progress">Operational</option>
                        <option value="resolved">Completed</option>
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <Badge className="bg-brand-indigo text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{scopedComplaints.filter(c => c.status === 'submitted').length} New Reports</Badge>
                      <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{criticalAlerts.length} Priority</Badge>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-200 dark:divide-white/5">
                    {filteredDeskComplaints.slice(0, 20).map((c) => (
                      <div key={c.id} className="p-8 flex flex-col xl:flex-row xl:items-center gap-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-brand-indigo transition-all" />
                        
                        <div className="flex items-center gap-6 flex-1 min-w-0">
                          <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-3xl group-hover:rotate-6 transition-transform shadow-inner border border-slate-200 dark:border-white/5">
                            {CATEGORY_META[c.category]?.icon || '📋'}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <span className="text-[10px] font-black text-brand-indigo uppercase tracking-[0.2em]">{c.referenceId}</span>
                              <Badge className={clsx(
                                "text-[8px] font-black uppercase px-2 py-0.5 rounded",
                                c.severity >= 7 ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-brand-indigo/10 text-brand-indigo border border-brand-indigo/20"
                              )}>Level {c.severity}</Badge>
                              
                              {c.isCommunityReport && (
                                <Badge className="bg-brand-navy text-white border-none text-[8px] font-black px-2 py-0.5 rounded shadow-sm">
                                  SOCIETY: {c.societyName}
                                </Badge>
                              )}
                            </div>
                            
                            <h4 className="text-xl font-black text-brand-navy dark:text-white truncate leading-tight mb-2">
                              {c.title}
                            </h4>
                            
                            <div className="flex flex-wrap items-center gap-6">
                              <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <MapPin size={14} className="text-slate-400" />
                                {c.location.address}
                              </p>
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-2 text-[10px] font-black text-brand-navy dark:text-slate-300">
                                  <TrendingUp size={12} /> {c.upvotes || 0} Votes
                                </span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-white/10" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                  {formatDistanceToNow(new Date(c.createdAt))} ago
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-10 xl:pl-10 xl:border-l border-slate-200 dark:border-white/5">
                          <div className="hidden sm:block text-right">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Reporter</p>
                            <p className="text-sm font-bold text-brand-navy dark:text-white">{c.citizenName}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Link to={`/complaints/track/${c.referenceId}`}>
                              <Button variant="outline" size="lg" className="px-6 border-2 border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest hover:border-brand-indigo">Review</Button>
                            </Link>
                            
                            {c.status === 'resolved' ? (
                              <Button 
                                size="lg" 
                                onClick={() => updateComplaintStatus(c.id, 'verified', c.citizenId, c.referenceId, 'Verified and approved by Admin.')}
                                className="bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 px-6 text-xs font-black uppercase tracking-widest"
                              >
                                Approve Fix
                              </Button>
                            ) : c.status === 'submitted' || c.status === 'escalated' ? (
                              <Button 
                                size="lg" 
                                onClick={() => setAssigningComplaint(c)}
                                className="bg-brand-indigo text-white shadow-lg shadow-brand-indigo/20 px-6 text-xs font-black uppercase tracking-widest"
                              >
                                Deploy Personnel
                              </Button>
                            ) : (
                              <div className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 dark:border-white/5">
                                {c.status.replace('_', ' ')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {scopedComplaints.length === 0 && (
                      <div className="p-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-white/5 flex items-center justify-center mx-auto mb-4 text-2xl">📭</div>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No complaints found in the grid</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-brand-rose/5 border-brand-rose/20">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={16} className="text-brand-rose" /> Critical Alerts
                  </h3>
                  <div className="space-y-4">
                    {criticalAlerts.slice(0, 3).map(c => (
                      <div key={c.id} className="bg-slate-100 dark:bg-dark-950/50 p-4 rounded-2xl border border-brand-rose/10 group hover:border-brand-rose/30 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="error">{c.status === 'escalated' ? 'ESCALATED' : 'CRITICAL'}</Badge>
                          <span className="text-[10px] text-slate-600">{formatDistanceToNow(new Date(c.updatedAt))} ago</span>
                        </div>
                        <p className="text-xs text-slate-900 dark:text-white font-bold">{c.referenceId}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{c.title}</p>
                        <div className="mt-3 flex justify-end">
                           <Link to={`/complaints/track/${c.referenceId}`} className="text-[10px] text-brand-rose font-bold uppercase hover:underline">Take Action →</Link>
                        </div>
                      </div>
                    ))}
                    {criticalAlerts.length === 0 && (
                      <p className="text-[10px] text-slate-600 text-center py-4 italic">No critical alerts currently.</p>
                    )}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest">Global Personnel</h3>
                  <div className="space-y-4">
                    {officers.slice(0, 8).map(o => (
                      <div key={o.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} src={o.avatar} size="sm" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{o.name}</p>
                            <p className="text-[10px] text-slate-600">{(o as any).department || 'Administrative'}</p>
                          </div>
                        </div>
                        <div className={clsx('w-2 h-2 rounded-full', (o as any).isOnline !== false ? 'bg-emerald-500' : 'bg-slate-700')} />
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-6 text-primary-400" onClick={() => setTab('users')}>Manage Full Workforce</Button>
                </Card>
              </div>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <Card className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users size={20} className="text-primary-500" /> System Directory
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input placeholder="Search users..." className="bg-slate-100 dark:bg-dark-950/50 border border-slate-200 dark:border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:border-primary-500/50 outline-none w-64" />
                </div>
                <Button size="sm">Add User</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5">
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {officers.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} src={o.avatar} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{o.name}</p>
                            <p className="text-[10px] text-slate-500">{o.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={o.role === 'admin' ? 'success' : 'info'}>{o.role.toUpperCase()}</Badge>
                      </td>
                      <td className="py-4 text-xs text-slate-400">{(o as any).wardName || 'City Wide'}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-1.5 h-1.5 rounded-full', (o as any).isOnline !== false ? 'bg-emerald-500' : 'bg-slate-600')} />
                          <span className="text-[10px] text-slate-900 dark:text-white font-medium uppercase">{(o as any).isOnline !== false ? 'Online' : 'Offline'}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Button variant="ghost" size="sm" onClick={() => setManagingUser(o)}>Manage</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
      <>
        {/* Assignment Modal */}
        <AnimatePresence>
          {assigningComplaint && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setAssigningComplaint(null)}
                className="absolute inset-0 bg-slate-100 dark:bg-dark-950/80 backdrop-blur-sm" 
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-md bg-slate-50 dark:bg-dark-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white font-display">Assign Task</h3>
                    <button onClick={() => setAssigningComplaint(null)} className="text-slate-500 hover:text-slate-900 dark:text-white">
                      <X size={24} />
                    </button>
                  </div>
   
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 mb-8">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Complaint</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{assigningComplaint.title}</p>
                    <p className="text-[10px] text-primary-400 mt-1 font-mono">{assigningComplaint.referenceId}</p>
                  </div>
   
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-2">Select Personnel</h4>
                  <div className="space-y-3">
                    {DUMMY_WORKERS.map(worker => (
                      <button
                        key={worker.id}
                        onClick={async () => {
                          await updateComplaintStatus(
                            assigningComplaint.id, 
                             'assigned', 
                             assigningComplaint.citizenId, 
                             assigningComplaint.referenceId,
                             `Task assigned to ${worker.name}`,
                             worker.id
                          );
                          setAssigningComplaint(null);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-xl">{worker.avatar}</div>
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-400">{worker.name}</p>
                            <p className="text-[10px] text-slate-500">{worker.role}</p>
                          </div>
                        </div>
                        <Badge variant={worker.isOnline ? 'success' : 'info'} className="text-[8px]">
                          {worker.isOnline ? 'Available' : 'Offline'}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {/* User Management Modal */}
        <AnimatePresence>
          {managingUser && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setManagingUser(null)}
                className="absolute inset-0 bg-slate-100 dark:bg-dark-950/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg glass border border-white/10 rounded-[2.5rem] overflow-hidden p-8"
              >
                <div className="flex items-center gap-4 mb-8">
                  <Avatar name={managingUser.name} src={managingUser.avatar} size="lg" />
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{managingUser.name}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{managingUser.email}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Personnel Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      {['admin', 'citizen'].map(role => (
                        <button 
                          key={role}
                          onClick={async () => {
                            await updateDoc(doc(db, 'users', managingUser.id), { role });
                            setManagingUser(null);
                          }}
                          className={clsx(
                            'p-4 rounded-2xl border transition-all text-left group',
                            managingUser.role === role ? 'bg-primary-500/20 border-primary-500/50' : 'bg-slate-50 dark:bg-white/5 border-white/10 hover:border-white/20'
                          )}
                        >
                          <p className={clsx('text-sm font-bold capitalize', managingUser.role === role ? 'text-slate-900 dark:text-white' : 'text-slate-400')}>
                            {role}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">Quick Actions</label>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" className="text-rose-500 border-rose-500/20 hover:bg-rose-500/10">Suspend Access</Button>
                      <Button variant="outline">Reset Credentials</Button>
                      <Button variant="outline" onClick={() => setManagingUser(null)}>Close</Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </>
    </div>
  )
}
