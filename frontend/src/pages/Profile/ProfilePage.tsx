import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { useSearchParams } from 'react-router-dom'
import { 
  User, Mail, Phone, MapPin, Shield, 
  Award, TrendingUp, Settings, ChevronRight, 
  Camera, CheckCircle2, History, CreditCard,
  Bell, Globe, LogOut, Eye, Type, Loader2
} from 'lucide-react'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../firebase'
import { CameraModal } from '../../components/common/CameraModal'
import { Card, Button, Avatar, Badge, StatCard } from '../../components/ui'
import { clsx } from 'clsx'

const ROLES = [
  { id: 'citizen', label: 'Citizen', desc: 'Standard user access' },
  { id: 'admin', label: 'Admin', desc: 'Total system access' },
]

export default function ProfilePage() {
  const { user, logout, verifyAccount, updateRole, updatePrivacyMode, updateAvatar } = useAuthStore()
  const { 
    darkMode, toggleDarkMode, 
    fontSize, highContrast, dyslexicFont, rtl,
    setAccessibility 
  } = useUIStore()
  
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'overview' | 'settings' | 'history') || 'overview'
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showCamera, setShowCamera] = useState(false)

  const setActiveTab = (tab: string) => {
    setSearchParams({ tab })
  }

  if (!user) return null

  const handleVerify = async () => {
    try {
      await verifyAccount();
    } catch (error) {
      console.error("Failed to verify account", error);
    }
  }

  const handleRoleChange = async (newRole: any) => {
    try {
      await updateRole(newRole);
    } catch (error) {
      console.error("Failed to update role", error);
    }
  }

  const togglePrivacyMode = async () => {
    if (!user.isVerified) return;
    try {
      await updatePrivacyMode(!user.privacyMode);
    } catch (error) {
      console.error("Failed to update privacy mode", error);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `avatars/${user.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateAvatar(url);
    } catch (error) {
      console.error("Avatar upload failed", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleCapture = async (file: File) => {
    setSaving(true);
    try {
      const storageRef = ref(storage, `avatars/${user.id}_${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateAvatar(url);
    } catch (error) {
      console.error("Avatar capture failed", error);
      alert("Failed to save avatar. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-dark-950 pt-24 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left: Identity Card */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-primary-500/20 to-brand-violet/20" />
              <div className="relative z-10 pt-4">
                <div className="relative inline-block group">
                  <div className="relative">
                    <Avatar name={user.name} src={user.avatar} size="lg" className="w-24 h-24 mx-auto border-4 border-slate-100 dark:border-dark-950 shadow-2xl" />
                    {saving && (
                      <div className="absolute inset-0 z-20 bg-dark-950/60 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-primary-500 animate-in fade-in duration-300">
                        <Loader2 size={24} className="text-primary-500 animate-spin" />
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleAvatarUpload}
                  />
                  <button 
                    onClick={() => setShowCamera(true)}
                    disabled={saving}
                    className="absolute bottom-0 right-0 p-2 bg-primary-500 text-slate-900 dark:text-white rounded-xl shadow-glow-blue opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-6 font-display">{user.name}</h2>
                <p className="text-sm text-slate-500 mt-1">{user.email}</p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  {user.isVerified ? (
                    <Badge variant="success">Verified Profile</Badge>
                  ) : (
                    <Badge variant="warning">Unverified</Badge>
                  )}
                  <Badge variant="info" className="capitalize">{(user.role || 'Citizen').replace('_', ' ')} Authority</Badge>
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-200 dark:border-white/5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Citizen ID</span>
                  <span className="text-slate-900 dark:text-white font-mono text-xs">CE-USR-8821</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">Member Since</span>
                  <span className="text-slate-900 dark:text-white">Mar 2024</span>
                </div>
              </div>

              <Button variant="danger" size="sm" className="w-full mt-8" onClick={logout}>
                <LogOut size={16} className="mr-2" /> Sign Out
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-widest flex items-center gap-2">
                <Award size={16} className="text-amber-400" /> My Badges
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {user.badges?.map((b: any) => (
                  <div key={b.id} title={b.name} className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-2xl shadow-inner cursor-help hover:scale-110 transition-transform">
                    {b.icon}
                  </div>
                ))}
                <div className="w-12 h-12 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-slate-700">
                  +3
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Tabs and Content */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-white/5 w-fit">
              {[
                { id: 'overview', label: 'Overview', icon: <TrendingUp size={16} /> },
                { id: 'settings', label: 'Account Settings', icon: <Settings size={16} /> },
                { id: 'history', label: 'Login History', icon: <History size={16} /> },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    console.log("Switching to tab:", t.id);
                    setActiveTab(t.id as any);
                  }}
                  className={clsx(
                    'flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all duration-300',
                    activeTab === t.id ? 'bg-primary-500 text-slate-900 dark:text-white shadow-glow-blue' : 'text-slate-500 hover:text-slate-900 dark:text-white'
                  )}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div 
                  key="overview" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="grid sm:grid-cols-2 gap-6">
                    {user.role === 'admin' ? (
                      <>
                        <StatCard label="City Resolution" value="94%" icon="📊" color="from-primary-500/10 to-indigo-500/10" />
                        <StatCard label="Active Personnel" value="24" icon="👷" color="from-emerald-500/10 to-green-500/10" />
                      </>
                    ) : (
                      <>
                        <StatCard label="Reward Points" value={user.rewardPoints || 0} icon="🏅" color="from-amber-500/10 to-orange-500/10" />
                        <StatCard label="Reports Resolved" value={user.resolvedCount || 0} icon="✅" color="from-emerald-500/10 to-green-500/10" />
                      </>
                    )}
                  </div>

                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-primary-500"><Phone size={18} /></div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Mobile Number</p>
                          <p className="text-sm text-slate-900 dark:text-white font-bold">{user.phone || 'Not provided'}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto text-primary-400">Edit</Button>
                      </div>
                      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-primary-500"><Mail size={18} /></div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Primary Email</p>
                          <p className="text-sm text-slate-900 dark:text-white font-bold">{user.email}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="ml-auto text-primary-400">Edit</Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">Saved Addresses</h3>
                      <Button variant="outline" size="sm">Add New</Button>
                    </div>
                    <div className="space-y-4">
                      {user.addresses?.map((addr: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-950 flex items-center justify-center text-primary-500"><MapPin size={18} /></div>
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{addr.label} {addr.isDefault && <Badge variant="info" className="ml-2">Default</Badge>}</p>
                            <p className="text-xs text-slate-500 mt-1">{addr.address}</p>
                          </div>
                        </div>
                      ))}
                      {(!user.addresses || user.addresses.length === 0) && (
                         <p className="text-sm text-slate-500 italic">No saved addresses found.</p>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div key="settings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  
                  {/* PROTOTYPE VERIFICATION CARD */}
                  <Card className="p-8 bg-gradient-to-r from-primary-500/10 to-brand-violet/10 border-primary-500/20">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                          <Shield size={20} className="text-primary-400" />
                          Account Verification (Prototype)
                        </h3>
                        <p className="text-sm text-slate-400">
                          {user.isVerified 
                            ? "Your account is verified. You have access to all features." 
                            : "Since this is a prototype, click the button below to instantly verify your account and unlock restricted features."}
                        </p>
                      </div>
                      {!user.isVerified && (
                        <Button onClick={handleVerify} glow>
                          Verify Account (Demo)
                        </Button>
                      )}
                      {user.isVerified && (
                        <Badge variant="success" className="px-3 py-1">
                          <CheckCircle2 size={14} className="mr-1 inline" /> Verified
                        </Badge>
                      )}
                    </div>
                  </Card>

                  {/* PROTOTYPE ROLE SWITCHER */}
                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">User Role (Demo Mode)</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                      {ROLES.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => handleRoleChange(r.id)}
                          className={clsx(
                            'p-4 rounded-2xl border transition-all text-left group',
                            user?.role === r.id 
                              ? 'bg-primary-500/10 border-primary-500 shadow-glow-blue' 
                              : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 hover:border-white/20'
                          )}
                        >
                          <p className={clsx('text-sm font-bold mb-1', user?.role === r.id ? 'text-primary-400' : 'text-slate-900 dark:text-white')}>
                            {r.label}
                          </p>
                          <p className="text-[10px] text-slate-500 uppercase tracking-widest">{r.desc}</p>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-600 mt-4 font-bold uppercase tracking-widest">
                      Note: Changing role will grant you different dashboard permissions instantly.
                    </p>
                  </Card>

                  {/* APPEARANCE & ACCESSIBILITY */}
                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Eye size={20} className="text-primary-400" />
                      Appearance & Accessibility
                    </h3>
                    <div className="space-y-6">
                      {/* Dark Mode */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                          <p className="text-xs text-slate-500">Toggle between dark and light themes</p>
                        </div>
                        <button 
                          onClick={toggleDarkMode}
                          className={clsx(
                            "w-12 h-6 rounded-full p-1 transition-all duration-300",
                            darkMode ? "bg-primary-500" : "bg-dark-700"
                          )}
                        >
                          <div className={clsx(
                            "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                            darkMode ? "translate-x-6" : "translate-x-0"
                          )} />
                        </button>
                      </div>

                      {/* Font Size */}
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Interface Font Size</p>
                          <p className="text-xs text-slate-500">Adjust text size for better readability</p>
                        </div>
                        <div className="flex bg-slate-100 dark:bg-dark-950 p-1 rounded-xl border border-white/10">
                          {['sm', 'md', 'lg'].map((size) => (
                            <button
                              key={size}
                              onClick={() => setAccessibility('fontSize', size)}
                              className={clsx(
                                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all",
                                fontSize === size ? "bg-primary-500 text-slate-900 dark:text-white shadow-glow-blue" : "text-slate-500 hover:text-slate-900 dark:text-white"
                              )}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Toggles */}
                      <div className="grid sm:grid-cols-2 gap-4">
                        {[
                          { id: 'highContrast', label: 'High Contrast', desc: 'Boost colors and borders', icon: <Eye size={14} /> },
                          { id: 'dyslexicFont', label: 'Dyslexic Font', desc: 'Specialized font for reading', icon: <Type size={14} /> },
                          { id: 'rtl', label: 'Right-to-Left (RTL)', desc: 'Mirror layout for RTL languages', icon: <Globe size={14} /> },
                        ].map((item) => {
                          const val = (useUIStore.getState() as any)[item.id];
                          return (
                            <button
                              key={item.id}
                              onClick={() => setAccessibility(item.id, !val)}
                              className={clsx(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all text-left",
                                val ? "bg-primary-500/10 border-primary-500" : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5"
                              )}
                            >
                              <div className={clsx(
                                "w-8 h-8 rounded-xl flex items-center justify-center",
                                val ? "bg-primary-500 text-slate-900 dark:text-white" : "bg-slate-100 dark:bg-dark-950 text-slate-500"
                              )}>
                                {item.icon}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                                <p className="text-[10px] text-slate-500">{item.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Security Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">Two-Factor Authentication</p>
                          <p className="text-xs text-slate-500">Secure your account with a secondary code</p>
                        </div>
                        <button className="w-12 h-6 rounded-full bg-dark-700 p-1"><div className="w-4 h-4 bg-white rounded-full" /></button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Anonymous Reporting Mode</p>
                            {!user.isVerified && (
                              <span className="text-[10px] bg-brand-rose/20 text-brand-rose px-2 py-0.5 rounded-full font-bold uppercase">
                                Requires Verification
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Keep your name hidden from public complaints by default.</p>
                        </div>
                        <button 
                          onClick={togglePrivacyMode}
                          disabled={!user?.isVerified}
                          className={clsx(
                            "w-12 h-6 rounded-full p-1 transition-all duration-300",
                            !user?.isVerified ? "bg-dark-700 opacity-50 cursor-not-allowed" : (user?.privacyMode ? "bg-primary-500" : "bg-dark-700")
                          )}
                        >
                          <div className={clsx(
                            "w-4 h-4 bg-white rounded-full transition-transform duration-300",
                            user?.privacyMode ? "translate-x-6" : "translate-x-0"
                          )} />
                        </button>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Communication Preferences</h3>
                    <div className="space-y-4">
                      {['Push Notifications', 'Email Updates', 'WhatsApp Alerts', 'SMS Notifications'].map(pref => (
                        <div key={pref} className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-300">{pref}</span>
                          <button className="text-xs text-primary-400 font-bold">MANAGE</button>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'history' && (
                <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <Card className="p-8">
                    <h3 className="text-lg font-bold text-white mb-6">Recent Login Activity</h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-white">MacBook Pro - Chrome</p>
                          <Badge variant="success">Current Session</Badge>
                        </div>
                        <p className="text-xs text-slate-500">Bengaluru, India • {new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-bold text-white">iPhone 13 - Safari</p>
                          <span className="text-xs text-slate-600">2 days ago</span>
                        </div>
                        <p className="text-xs text-slate-500">Bengaluru, India • IP: 192.168.1.4</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {showCamera && <CameraModal onCapture={handleCapture} onClose={() => setShowCamera(false)} />}
      </AnimatePresence>
    </div>
  )
}
