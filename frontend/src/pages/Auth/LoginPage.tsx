import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { UserRole } from '../../types/user'
import { Button, Card, Badge } from '../../components/ui'
import { ChevronLeft, Mail, Phone, Lock, ArrowRight, ShieldCheck, Github, Smartphone } from 'lucide-react'
import { clsx } from 'clsx'

const ROLES: { id: UserRole; label: string; icon: string; desc: string }[] = [
  { id: 'citizen', label: 'Citizen', icon: '👤', desc: 'File & track public issues' },
  { id: 'officer', label: 'Field Worker', icon: '👷', desc: 'Resolve & Update Tasks' },
  { id: 'zonal_admin', label: 'Zonal Admin', icon: '🛡️', desc: 'Manage Assigned Ward' },
  { id: 'super_admin', label: 'Super Admin', icon: '🏛️', desc: 'Global City Oversight' },
]

export default function LoginPage() {
  const [step, setStep] = useState<'role' | 'credentials' | 'location' | 'forgot_password'>('role')
  const [role, setRole] = useState<UserRole>('citizen')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')
  const [wardId, setWardId] = useState('')
  const [wardName, setWardName] = useState('')
  const { login, resetPassword, updateUISettings, updateRole, isLoading, user } = useAuthStore()
  const [emailFocused, setEmailFocused] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email || !password) return setError('Please enter both email and password')
    setError('')
    try {
      await login(email, password)
      
      // For demo accounts, we skip the Firestore role update to avoid errors
      if (!['citizen@civiceye.com', 'officer@civiceye.com', 'zonal@civiceye.com', 'admin@civiceye.com'].includes(email)) {
        await updateRole(role);
      }
      
      if (role === 'super_admin' || role === 'zonal_admin' || role === 'admin') {
        navigate('/dashboard/admin')
      } else if (role === 'officer') {
        navigate('/dashboard/officer')
      } else {
        navigate('/dashboard/citizen')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login')
    }
  }

  const handleFinishLogin = async () => {
    if (!wardId) return setError('Please select a ward')
    try {
      await updateUISettings({ wardId, wardName })
      navigate('/')
    } catch (err: any) {
      setError('Failed to update ward assignment')
    }
  }

  const handleResetPassword = async () => {
    if (!email) return setError('Please enter your email to reset password')
    setError('')
    setResetMessage('')
    try {
      await resetPassword(email)
      setResetMessage('Password reset link sent to your email!')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-brand-violet flex items-center justify-center text-2xl shadow-glow-blue group-hover:scale-110 transition-transform">👁️</div>
            <span className="font-display font-black text-3xl tracking-tight text-slate-900 dark:text-white">CivicEye</span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Welcome Back</h1>
          <p className="text-slate-500 mt-2">Log in to track your reports and earn points</p>
        </div>

        <Card className="p-8 shadow-2xl border-slate-200 dark:border-slate-200 dark:border-white/10">
          <AnimatePresence mode="wait">
            {step === 'role' && (
              <motion.div 
                key="step-role"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Select Your Role</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRole(r.id)}
                      className={clsx(
                        'flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 text-left',
                        role === r.id 
                          ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                          : 'bg-slate-50 dark:bg-white/5 border-white/5 hover:border-white/20'
                      )}
                    >
                      <span className="text-3xl mb-3">{r.icon}</span>
                      <span className={clsx('text-sm font-black', role === r.id ? 'text-primary-600 dark:text-primary-400' : 'text-slate-900 dark:text-white')}>{r.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-500 mt-2 font-bold uppercase tracking-[0.2em] text-center">{r.desc}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full" size="lg" onClick={() => setStep('credentials')}>
                  Continue as {ROLES.find(r => r.id === role)?.label} <ArrowRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'credentials' && (
              <motion.div 
                key="step-creds"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setStep('role')}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 dark:text-white mb-6 transition-colors"
                >
                  <ChevronLeft size={14} /> Back to role selection
                </button>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Login with {role.replace('_', ' ')} ID</h2>
                
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
                    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-primary-500/50 transition-all">
                      <Mail size={18} className="text-slate-500" />
                      <input 
                        type="email"
                        placeholder="yourname@domain.com"
                        value={email}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setTimeout(() => setEmailFocused(false), 200)}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder:text-slate-700"
                      />
                    </div>
                    
                    <AnimatePresence>
                      {emailFocused && (
                        <motion.button
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          type="button"
                          onClick={() => {
                            if (role === 'super_admin') {
                              setEmail('admin@civiceye.com')
                              setPassword('admin123')
                            } else if (role === 'zonal_admin') {
                              setEmail('zonal@civiceye.com')
                              setPassword('zonal123')
                            } else if (role === 'officer') {
                              setEmail('officer@civiceye.com')
                              setPassword('officer123')
                            } else {
                              setEmail('citizen@civiceye.com')
                              setPassword('citizen123')
                            }
                          }}
                          className="w-full flex items-center justify-between px-4 py-2 mt-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-[10px] font-bold text-primary-500 uppercase tracking-widest hover:bg-primary-500/20 transition-all shadow-lg"
                        >
                          <span>⚡ Autofill {role.replace('_', ' ')} Demo</span>
                          <span className="opacity-60 text-[8px]">Tap to fill</span>
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Password</label>
                      <button 
                        onClick={() => { setStep('forgot_password'); setError(''); setResetMessage(''); }}
                        className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-primary-500/50 transition-all">
                      <Lock size={18} className="text-slate-500" />
                      <input 
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>


                {error && <p className="text-xs text-brand-rose mb-4 text-center">{error}</p>}

                <Button className="w-full" size="lg" isLoading={isLoading} onClick={handleLogin}>
                  Login
                </Button>

                <div className="mt-8 flex items-center gap-4 text-slate-700">
                  <div className="h-px flex-1 bg-slate-50 dark:bg-white/5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Or Continue With</span>
                  <div className="h-px flex-1 bg-slate-50 dark:bg-white/5" />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 text-sm text-slate-900 dark:text-white transition-all">
                    <ShieldCheck size={18} className="text-primary-500" /> Gov ID
                  </button>
                  <button className="flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-white/10 text-sm text-slate-900 dark:text-white transition-all">
                    <Smartphone size={18} className="text-violet-500" /> DigiLocker
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'location' && (
              <motion.div 
                key="step-location"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Ward Assignment</h2>
                <p className="text-sm text-slate-500 mb-8">Select the ward you are authorized to manage for this session.</p>
                
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Active Ward</label>
                    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-primary-500/50 transition-all">
                      <Smartphone size={18} className="text-slate-500" />
                      <select 
                        className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full appearance-none"
                        value={wardId}
                        onChange={e => {
                          const names = ['North Ward', 'South Ward', 'East Ward', 'West Ward', 'Central Ward'];
                          const idx = parseInt(e.target.value.replace('w', '')) - 1;
                          setWardId(e.target.value);
                          setWardName(names[idx]);
                        }}
                      >
                        <option value="" disabled className="bg-white dark:bg-dark-900">Select Ward</option>
                        <option value="w1" className="bg-white dark:bg-dark-900">North Ward</option>
                        <option value="w2" className="bg-white dark:bg-dark-900">South Ward</option>
                        <option value="w3" className="bg-white dark:bg-dark-900">East Ward</option>
                        <option value="w4" className="bg-white dark:bg-dark-900">West Ward</option>
                        <option value="w5" className="bg-white dark:bg-dark-900">Central Ward</option>
                      </select>
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-brand-rose mb-4 text-center">{error}</p>}

                <Button className="w-full" size="lg" onClick={handleFinishLogin}>
                  Enter Dashboard <ArrowRight size={18} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {step === 'forgot_password' && (
              <motion.div 
                key="step-forgot"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <button 
                  onClick={() => setStep('credentials')}
                  className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-900 dark:text-white mb-6 transition-colors"
                >
                  <ChevronLeft size={14} /> Back to login
                </button>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                <p className="text-sm text-slate-500 mb-6">Enter your email address and we'll send you a secure link to reset your password.</p>
                
                <div className="space-y-4 mb-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email</label>
                    <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 focus-within:border-primary-500/50 transition-all">
                      <Mail size={18} className="text-slate-500" />
                      <input 
                        type="email"
                        placeholder="yourname@domain.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white w-full placeholder:text-slate-700"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-brand-rose mb-4 text-center">{error}</p>}
                {resetMessage && <p className="text-xs text-emerald-400 mb-4 text-center">{resetMessage}</p>}

                <Button className="w-full" size="lg" isLoading={isLoading} onClick={handleResetPassword}>
                  Send Reset Link
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>

        <p className="text-center mt-8 text-sm text-slate-600">
          New to CivicEye? <Link to="/register" className="text-primary-500 font-bold hover:underline">Create an account</Link>
        </p>
      </motion.div>
    </div>
  )
}
