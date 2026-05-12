import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { UserRole } from '../../types/user'
import { Button, Card } from '../../components/ui'
import { User, Mail, Phone, MapPin, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react'
import { clsx } from 'clsx'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<UserRole>('citizen')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
    wardId: '',
    wardName: '',
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { register, isLoading } = useAuthStore()

  const handleNext = () => setStep(s => s + 1)
  const handleBack = () => setStep(s => s - 1)

  const handleSubmit = async () => {
    try {
      setError('')
      await register(formData.email, formData.password, role, formData)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/5 rounded-full" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Join CivicEye</h1>
          <p className="text-slate-500 mt-2">Empowering citizens for a better tomorrow</p>
        </div>

        <Card className="p-8 shadow-2xl border-slate-200 dark:border-white/10">
          {/* Progress Tracker */}
          <div className="flex items-center justify-between mb-10">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300',
                  step >= s ? 'bg-primary-500 text-white shadow-glow-blue' : 'bg-white/5 text-slate-600 border border-white/10'
                )}>
                  {step > s ? <CheckCircle2 size={18} /> : s}
                </div>
                {s < 3 && <div className={clsx('flex-1 h-0.5 mx-4 rounded-full', step > s ? 'bg-primary-500' : 'bg-white/5')} />}
              </React.Fragment>
            ))}
          </div>

          {step === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold text-white mb-6">Choose Your Role</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { id: 'citizen', label: 'Citizen', icon: '👤', desc: 'Report issues' },
                  { id: 'admin', label: 'Field Officer', icon: '👷', desc: 'Resolve & Manage' },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id as UserRole)}
                    className={clsx(
                      'p-6 rounded-2xl border transition-all duration-300 text-left',
                      role === r.id ? 'bg-primary-500/10 border-primary-500' : 'bg-white/5 border-white/5 hover:border-white/20'
                    )}
                  >
                    <span className="text-4xl mb-4 block">{r.icon}</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">{r.label}</span>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-[0.2em]">{r.desc}</p>
                  </button>
                ))}
              </div>
              <Button className="w-full" size="lg" onClick={handleNext}>
                Continue <ArrowRight size={18} className="ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold text-white mb-6">Personal Details</h2>
              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Full Name</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <User size={18} className="text-slate-500" />
                    <input 
                      placeholder="John Doe" 
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Email Address</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Mail size={18} className="text-slate-500" />
                    <input 
                      placeholder="john@example.com" 
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Phone Number</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <Phone size={18} className="text-slate-500" />
                    <input 
                      placeholder="+91 98765 43210" 
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-1">Password</label>
                  <div className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10">
                    <ShieldCheck size={18} className="text-slate-500" />
                    <input 
                      type="password"
                      placeholder="••••••••" 
                      className="bg-transparent border-none outline-none text-sm text-white w-full"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
                <Button className="flex-[2]" onClick={handleNext}>Next Step</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <h2 className="text-xl font-bold text-white mb-6">Identity Verification</h2>
              <p className="text-sm text-slate-500 mb-8">Verification helps us maintain a secure and trustworthy community.</p>
              
              <div className="space-y-6 mb-8">

                <div className="flex items-start gap-3 px-2">
                  <input type="checkbox" id="terms" className="mt-1 accent-primary-500" />
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed">
                    I agree to the <Link to="/terms" className="text-primary-400">Terms of Service</Link> and <Link to="/privacy" className="text-primary-400">Privacy Policy</Link>. I understand that filing false reports is a punishable offense.
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={handleBack}>Back</Button>
                <Button className="flex-[2]" glow onClick={handleSubmit}>Complete Registration</Button>
              </div>
            </motion.div>
          )}
        </Card>

        <p className="text-center mt-8 text-sm text-slate-600">
          Already have an account? <Link to="/login" className="text-primary-500 font-bold hover:underline">Sign in instead</Link>
        </p>
      </motion.div>
    </div>
  )
}
