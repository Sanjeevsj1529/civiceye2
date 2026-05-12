import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useComplaintStore } from '../../store/complaintStore'
import { useAuthStore } from '../../store/authStore'
import { CATEGORY_META, STATUS_META } from '../../utils/mockData'
import { Button, Card, Badge, Avatar } from '../../components/ui'
import { 
  TrendingUp, MessageSquare, Share2, Heart, 
  MapPin, Clock, Search, Filter, ArrowRight,
  ShieldCheck, CheckCircle2, MoreHorizontal,
  Flame, Zap, Repeat
} from 'lucide-react'
import { clsx } from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import { Link } from 'react-router-dom'

export default function CommunityFeed() {
  const { user } = useAuthStore()
  const { complaints, upvoteComplaint, echoComplaint, initializeComplaints, isLoading } = useComplaintStore()
  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'resolved'>('trending')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const unsubscribe = initializeComplaints()
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [initializeComplaints])

  const feedItems = complaints
    .filter(c => !c.isAnonymous) // Only public reports
    .filter(c => {
      if (activeTab === 'resolved') return ['resolved', 'verified', 'closed'].includes(c.status)
      return true
    })
    .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (activeTab === 'trending') return ((b as any).socialPriority || 0) - ((a as any).socialPriority || 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Feed Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white font-display flex items-center gap-3">
              Civic Pulse <span className="text-primary-500 animate-pulse">●</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">See what's happening in your community in real-time.</p>
          </div>
          <Link to="/complaints/new">
            <Button glow className="rounded-2xl shadow-glow-blue">
              <Zap size={18} className="mr-2" /> Post Public Report
            </Button>
          </Link>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
            {[
              { id: 'trending', label: 'Trending', icon: <Flame size={14} /> },
              { id: 'recent', label: 'Recent', icon: <Clock size={14} /> },
              { id: 'resolved', label: 'Solved', icon: <CheckCircle2 size={14} /> },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-black transition-all",
                  activeTab === t.id 
                    ? "bg-primary-500 text-slate-900 dark:text-white shadow-glow-blue" 
                    : "text-slate-500 hover:text-slate-900 dark:text-white"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search community reports..."
              className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary-500/50 transition-all"
            />
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Syncing Pulse...</p>
            </div>
          ) : feedItems.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-0 border-white/10 bg-white dark:bg-white/5 overflow-hidden group">
                {/* User Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-white/5">
                  <div className="flex items-center gap-3">
                    <Avatar name={c.citizenName} size="sm" className="ring-2 ring-primary-500/20" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {c.citizenName}
                        <ShieldCheck size={14} className="text-primary-500" />
                      </p>
                      <p className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                        {c.location.ward} · {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant={['resolved', 'verified', 'closed'].includes(c.status) ? 'success' : 'info'} className="uppercase text-[9px] font-black">
                    {STATUS_META[c.status].label}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{CATEGORY_META[c.category].icon}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-primary-400 transition-colors">{c.title}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
                    {c.description}
                  </p>

                  {/* Evidence Photo */}
                  {c.media && c.media[0] && (
                    <div className="aspect-[16/9] rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 mb-6 bg-slate-100 dark:bg-dark-900">
                      <img src={c.media[0].url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Evidence" />
                    </div>
                  )}

                  {/* Dynamic Priority Indicators */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <Badge className="bg-slate-50 dark:bg-white/5 text-slate-500 border-none px-3 py-1 text-[10px] font-bold">
                      #{c.category.toUpperCase()}
                    </Badge>
                    {((c as any).socialPriority || 0) > 15 && (
                      <Badge className="bg-brand-rose text-white border-none px-3 py-1 text-[10px] font-black animate-pulse shadow-glow-rose">
                        🔥 HOT TOPIC
                      </Badge>
                    )}
                    {['resolved', 'verified'].includes(c.status) && (
                      <Badge className="bg-emerald-500 text-white border-none px-3 py-1 text-[10px] font-black flex items-center gap-1.5">
                        <CheckCircle2 size={12} /> PUBLIC TRUST EARNED
                      </Badge>
                    )}
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => upvoteComplaint(c.id, user?.id || '')}
                        className={clsx(
                          "flex items-center gap-2 text-sm font-bold transition-all hover:scale-110",
                          (c as any).upvoters?.includes(user?.id) ? "text-primary-500" : "text-slate-500"
                        )}
                      >
                        <Heart size={20} fill={(c as any).upvoters?.includes(user?.id) ? "currentColor" : "none"} />
                        <span>{c.upvotes}</span>
                      </button>
                      <button 
                        onClick={() => echoComplaint(c.id, user?.id || '')}
                        className={clsx(
                          "flex items-center gap-2 text-sm font-bold transition-all hover:scale-110",
                          (c as any).echoers?.includes(user?.id) ? "text-brand-violet" : "text-slate-500"
                        )}
                      >
                        <Repeat size={20} />
                        <span>{(c as any).echoCount || 0}</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-500 text-sm font-bold hover:text-slate-900 dark:hover:text-white transition-all">
                        <MessageSquare size={20} />
                        <span>{c.comments.length}</span>
                      </button>
                    </div>
                    <Link to={`/complaints/track/${c.referenceId}`}>
                      <Button variant="ghost" size="sm" className="text-primary-500 font-black uppercase tracking-widest text-[10px] group-hover:translate-x-2 transition-transform">
                        Track Progress <ArrowRight size={14} className="ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Status Update Banner (Public Trust) */}
                {['resolved', 'verified'].includes(c.status) && (
                  <div className="bg-emerald-500/10 p-4 flex items-center justify-between border-t border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        <ShieldCheck size={16} />
                      </div>
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        Admin Update: Issue has been officially resolved.
                      </p>
                    </div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Verified Fix</span>
                  </div>
                )}
              </Card>
            </motion.div>
          ))}

          {!isLoading && feedItems.length === 0 && (
            <div className="py-20 text-center">
              <div className="text-6xl mb-6">🏜️</div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">The Pulse is quiet</h3>
              <p className="text-slate-500">Be the first to report a public issue in your area.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
