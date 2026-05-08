import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { 
  Users, ClipboardList, CheckCircle, AlertTriangle, 
  TrendingUp, Map as MapIcon, Calendar, Search, 
  Filter, Download, MoreHorizontal, ArrowUpRight,
  Shield, Building2, UserCheck, Clock, Zap
} from 'lucide-react'
import { Card, StatCard, Badge, Button, Avatar, ProgressBar } from '../../components/ui'
import { COMPLAINTS, WARDS, OFFICERS, STATUS_META } from '../../utils/mockData'
import { clsx } from 'clsx'
import { useAuthStore } from '../../store/authStore'
import { format } from 'date-fns'

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

export default function AdminDashboard() {
  const [tab, setTab] = useState<'analytics' | 'management' | 'users'>('analytics')
  const { user } = useAuthStore()
  const isZonal = user?.role === 'zonal_admin'
  const areaName = isZonal ? 'North Ward' : 'Central Hub'
  
  return (
    <div className="min-h-screen pb-20 pt-24 px-6">
      <div className="max-w-[1800px] mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white font-display">
                {isZonal ? `Zonal HQ: ${areaName}` : 'City Command Center'} 🏛️
              </h1>
              <Badge variant="info" className="bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                {isZonal ? 'Zonal Control' : 'Global Authority'}
              </Badge>
            </div>
            <p className="text-slate-600 dark:text-slate-500">Managing civic infrastructure for <span className="text-slate-900 dark:text-white font-bold underline decoration-primary-500/30">{areaName}</span> · {format(new Date(), 'MMMM d, yyyy')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="hidden sm:flex border-white/10 hover:bg-white/5">
              <Download size={16} className="mr-2" /> Daily Report
            </Button>
            <Button size="sm" glow className="bg-primary-500 hover:bg-primary-600 ring-4 ring-primary-500/20">
              <Zap size={16} className="mr-2" /> {isZonal ? 'Ward Alert' : 'Global Broadcast'}
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-white/5 w-fit mb-8">
          {[
            { id: 'analytics', label: 'Live Analytics', icon: <TrendingUp size={16} /> },
            { id: 'management', label: 'Complaint Desk', icon: <ClipboardList size={16} /> },
            { id: 'users', label: 'User Directory', icon: <Users size={16} /> },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={clsx(
                'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300',
                tab === t.id ? 'bg-primary-500 text-white shadow-glow-blue' : 'text-slate-500 hover:text-white'
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {tab === 'analytics' && (
          <div className="space-y-8">
            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Live Complaints" value="1,284" icon="🔥" trend={14} color="from-rose-500/10 to-red-500/10" />
              <StatCard label="Resolved Today" value="452" icon="✅" trend={8} color="from-emerald-500/10 to-green-500/10" />
              <StatCard label="Avg. Response" value="18.5m" icon="⚡" trend={-12} color="from-blue-500/10 to-cyan-500/10" />
              <StatCard label="Officer Capacity" value="84%" icon="👮" trend={2} color="from-amber-500/10 to-yellow-500/10" />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp size={20} className="text-primary-500" /> Resolution Velocity
                  </h3>
                  <div className="flex gap-2">
                    <Badge variant="info">Daily</Badge>
                    <Badge variant="default">Weekly</Badge>
                  </div>
                </div>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
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
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-lg font-bold text-white mb-8">Category Mix</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
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
                  {categoryData.map((c, i) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-xs text-slate-400">{c.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{c.value}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Ward Performance Table */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building2 size={20} className="text-primary-500" /> Zonal Performance
                </h3>
                <Button variant="ghost" size="sm" className="text-primary-500">View Map View</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward Name</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Issues</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">SLA Score</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Officers</th>
                      <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {WARDS.map((ward) => (
                      <tr key={ward.id} className="group hover:bg-white/5 transition-all">
                        <td className="py-4 font-bold text-white">{ward.name}</td>
                        <td className="py-4 text-sm text-slate-400">{ward.totalComplaints}</td>
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-24">
                              <ProgressBar value={ward.slaComplianceRate} color={ward.slaComplianceRate > 85 ? 'bg-emerald-500' : 'bg-amber-500'} />
                            </div>
                            <span className="text-xs font-bold text-white">{ward.slaComplianceRate}%</span>
                          </div>
                        </td>
                        <td className="py-4 text-sm text-slate-400">{ward.officerCount}</td>
                        <td className="py-4">
                          <div className="flex gap-0.5 text-yellow-500">
                            {Array(5).fill(0).map((_, i) => <span key={i} className="text-[10px]">★</span>)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {tab === 'management' && (
          <div className="space-y-6">
            {/* Real-time Triage */}
            <div className="grid lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3">
                <Card className="p-0 border-white/10 bg-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input placeholder="Filter by ID, Title or Location..." className="bg-dark-950/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:border-primary-500/50 outline-none w-80" />
                      </div>
                      <select className="bg-dark-950/50 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none">
                        <option>All Status</option>
                        <option>New Submission</option>
                        <option>Escalated</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="info">52 New Today</Badge>
                      <Badge variant="error">12 Escalated</Badge>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-white/5">
                    {COMPLAINTS.slice(0, 8).map((c) => (
                      <div key={c.id} className="p-6 flex items-center gap-6 hover:bg-white/5 transition-all group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                          {c.category === 'pothole' ? '🕳️' : '🗑️'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-mono text-primary-500 font-bold tracking-widest">{c.referenceId}</span>
                            <Badge variant={c.severity >= 7 ? 'error' : 'info'}>Sev {c.severity}</Badge>
                            {c.isCommunityReport && (
                              <Badge variant="warning" className="bg-brand-rose/10 text-brand-rose border border-brand-rose/20 animate-pulse-glow flex items-center gap-1.5">
                                🏘️ SOCIETY REPORT
                                <span className="w-1 h-1 rounded-full bg-brand-rose/40" />
                                <span className="font-black">{Math.floor(Math.random() * 8) + 3} Citizens</span>
                              </Badge>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white truncate flex items-center gap-2">
                            {c.title}
                            {c.isCommunityReport && <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-full text-slate-500 font-medium">Auto-Grouped by Area</span>}
                          </h4>
                          <p className="text-xs text-slate-500 mt-1">{c.location.address}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <div className="hidden sm:block text-right">
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Reported By</p>
                            <p className="text-xs text-white mt-1 font-medium">{c.citizenName}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="px-4">Details</Button>
                            <Button size="sm" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">Assign</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="p-6 bg-brand-rose/5 border-brand-rose/20">
                  <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest flex items-center gap-2">
                    <AlertTriangle size={16} className="text-brand-rose" /> Critical Alerts
                  </h3>
                  <div className="space-y-4">
                    {[1, 2].map(i => (
                      <div key={i} className="bg-dark-950/50 p-4 rounded-2xl border border-brand-rose/10">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="error">SLA BREACH</Badge>
                          <span className="text-[10px] text-slate-600">2m ago</span>
                        </div>
                        <p className="text-xs text-white font-bold">CMP-2024-X992</p>
                        <p className="text-[10px] text-slate-500 mt-1">Water Leakage at North Ward has exceeded 48hr SLA.</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest">Officer Availability</h3>
                  <div className="space-y-4">
                    {OFFICERS.map(o => (
                      <div key={o.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} src={o.avatar} size="sm" />
                          <div>
                            <p className="text-xs font-bold text-white">{o.name.split(' ')[1]}</p>
                            <p className="text-[10px] text-slate-600">{o.department}</p>
                          </div>
                        </div>
                        <div className={clsx('w-2 h-2 rounded-full', o.status === 'on_duty' ? 'bg-emerald-500' : 'bg-slate-700')} />
                      </div>
                    ))}
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-6 text-primary-400">Manage Workforce</Button>
                </Card>
              </div>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <Card className="p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users size={20} className="text-primary-500" /> System Directory
              </h3>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input placeholder="Search users..." className="bg-dark-950/50 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:border-primary-500/50 outline-none w-64" />
                </div>
                <Button size="sm">Add User</Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ward</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                    <th className="pb-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {OFFICERS.map((o) => (
                    <tr key={o.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={o.name} src={o.avatar} size="sm" />
                          <div>
                            <p className="text-sm font-bold text-white">{o.name}</p>
                            <p className="text-[10px] text-slate-500">{o.email || 'officer@civiceye.gov'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="info">Officer</Badge>
                      </td>
                      <td className="py-4 text-xs text-slate-400">{o.ward || 'North Ward'}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className={clsx('w-1.5 h-1.5 rounded-full', o.status === 'on_duty' ? 'bg-emerald-500' : 'bg-slate-600')} />
                          <span className="text-[10px] text-white font-medium uppercase">{o.status.replace('_', ' ')}</span>
                        </div>
                      </td>
                      <td className="py-4 text-xs text-slate-500">2h ago</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
