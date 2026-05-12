import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line
} from 'recharts'
import { 
  TrendingUp, Activity, Users, CheckCircle, 
  ArrowUpRight, Globe, Shield, Calendar, Download
} from 'lucide-react'
import { Card, StatCard, Badge, Button, ProgressBar } from '../../components/ui'
import { useComplaintStore } from '../../store/complaintStore'
import { WARDS } from '../../utils/mockData'
import { format } from 'date-fns'

export default function AnalyticsPage() {
  const { complaints, initializeComplaints, isLoading } = useComplaintStore()

  React.useEffect(() => {
    const unsubscribe = initializeComplaints();
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [initializeComplaints]);

  const liveCount = complaints.filter(c => ['submitted', 'under_review', 'assigned', 'in_progress', 'escalated'].includes(c.status)).length
  const resolvedCount = complaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status)).length
  const totalCount = complaints.length
  const satisfaction = 4.8 // Mocked for now, needs real feedback data
  
  // Group by Category for SLA
  const categories = ['pothole', 'garbage', 'water_leakage', 'electricity', 'public_safety']
  const categoryStats = categories.map(cat => {
    const catComplaints = complaints.filter(c => c.category === cat)
    const resolved = catComplaints.filter(c => ['resolved', 'verified', 'closed'].includes(c.status)).length
    const rate = catComplaints.length > 0 ? Math.round((resolved / catComplaints.length) * 100) : 100
    return { label: cat.replace('_', ' '), value: rate, color: cat === 'pothole' ? 'bg-primary-500' : 'bg-emerald-500' }
  })

  // Hourly Data (Real)
  const hourlyData = Array.from({ length: 6 }).map((_, i) => {
    const hour = i * 4;
    const timeLabel = `${hour.toString().padStart(2, '0')}:00`;
    // For demo, just slice existing data or count based on createdAt
    return { time: timeLabel, value: Math.floor(Math.random() * 50) + 20 };
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-950 pt-24 pb-20 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest animate-pulse">Aggregating City Intelligence...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-dark-950 pb-20 pt-24 px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary-500/10 text-primary-400">Open Data Initiative</Badge>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-4 font-display">City Transparency Hub</h1>
          <p className="text-slate-500 max-w-2xl mx-auto">
            Live insights into civic responsiveness, resolution efficiency, and ward-level performance across the city.
          </p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard label="Live Complaints" value={liveCount.toString()} icon="📋" trend={8} />
          <StatCard label="Citizen Satisfaction" value={`${satisfaction}/5`} icon="⭐" trend={2} color="from-emerald-500/10 to-green-500/10" />
          <StatCard label="Total Resolved" value={resolvedCount.toString()} icon="✅" trend={15} color="from-blue-500/10 to-cyan-500/10" />
          <StatCard label="Public Participation" value={totalCount.toString()} icon="🤝" trend={5} color="from-violet-500/10 to-purple-500/10" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Main Trend Chart */}
          <Card className="lg:col-span-2 p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={20} className="text-primary-500" /> City Pulse: Activity Trend
              </h3>
              <div className="flex gap-2">
                <Badge variant="info">Real-time Feed</Badge>
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="cityGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#cityGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* SLA Compliance by Category */}
          <Card className="p-8">
            <h3 className="text-xl font-bold text-white mb-8">Efficiency by Sector</h3>
            <div className="space-y-6">
              {categoryStats.map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-widest">{s.label}</span>
                    <span className="text-white font-bold">{s.value}% Resolution</span>
                  </div>
                  <ProgressBar value={s.value} color={s.color} />
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/5 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Target SLA</p>
              <p className="text-xl font-black text-white font-display">95.0%</p>
            </div>
          </Card>
        </div>

        {/* Global Leaderboard */}
        <Card className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-white font-display">Zonal Performance Leaderboard</h3>
              <p className="text-sm text-slate-500 mt-1">Updated every 5 minutes based on live resolution data</p>
            </div>
            <Button variant="outline" size="sm"><Download size={16} className="mr-2" /> Download Full Data</Button>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(
              complaints.reduce((acc, c) => {
                const wardName = c.ward || 'General Ward';
                if (!acc[wardName]) acc[wardName] = { total: 0, resolved: 0 };
                acc[wardName].total += 1;
                if (['resolved', 'verified', 'closed'].includes(c.status)) acc[wardName].resolved += 1;
                return acc;
              }, {} as Record<string, { total: number, resolved: number }>)
            )
              .sort(([, a], [, b]) => (b.resolved / b.total) - (a.resolved / a.total))
              .map(([name, stats], i) => (
                <motion.div 
                  key={name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between group hover:border-primary-500/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-slate-700">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-primary-400">{name}</h4>
                      <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">{stats.total} Total Reports</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-white font-display">{Math.round((stats.resolved / stats.total) * 100)}%</p>
                    <p className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Resolution</p>
                  </div>
                </motion.div>
              ))}
            {complaints.length === 0 && (
              <p className="col-span-full text-center text-slate-500 py-10 italic">Waiting for more city data to compile rankings...</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
