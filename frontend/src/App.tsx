import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuthStore } from './store/authStore'
import { Skeleton } from './components/ui'
import { SmoothScrollProvider } from './components/cinematic/SmoothScrollProvider'
import { motion } from 'framer-motion'

// Lazy loaded pages for performance
const LandingPage = lazy(() => import('./pages/Landing/LandingPage'))
const LoginPage = lazy(() => import('./pages/Auth/LoginPage'))
const RegisterPage = lazy(() => import('./pages/Auth/RegisterPage'))
const UserDashboard = lazy(() => import('./pages/UserDashboard/UserDashboard'))
const NewComplaint = lazy(() => import('./pages/UserDashboard/NewComplaint'))
const ComplaintTracking = lazy(() => import('./pages/ComplaintTracking/ComplaintTracking'))
const MapPage = lazy(() => import('./pages/Map/MapPage'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard/AdminDashboard'))
const OfficerDashboard = lazy(() => import('./pages/OfficerDashboard/OfficerDashboard'))
const AnalyticsPage = lazy(() => import('./pages/Analytics/AnalyticsPage'))
const ProfilePage = lazy(() => import('./pages/Profile/ProfilePage'))
const AboutPage = lazy(() => import('./pages/Landing/AboutPage'))
const ContactPage = lazy(() => import('./pages/Landing/ContactPage'))
const CommunityFeed = lazy(() => import('./pages/Community/CommunityFeed'))

// --- Loading Fallback ---
const PageLoader = () => (
  <div className="relative min-h-screen overflow-hidden bg-[#030712] pt-32">
    <div className="pointer-events-none absolute inset-0 bg-mesh opacity-50" />
    <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-brand-indigo/30 blur-[100px]" />
    <div className="absolute bottom-1/4 right-1/4 h-48 w-48 rounded-full bg-neon-cyan/20 blur-[90px]" />
    <div className="relative mx-auto flex max-w-[1400px] flex-col items-center px-6">
      <motion.div
        className="relative mb-16"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="relative h-16 w-16">
          <motion.span
            className="absolute inset-0 rounded-2xl border-2 border-brand-indigo/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.span
            className="absolute inset-2 rounded-xl bg-gradient-to-br from-brand-indigo to-neon-cyan shadow-glow-blue"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </motion.div>
      <p className="mb-12 text-[11px] font-black uppercase tracking-[0.45em] text-slate-500">
        Initializing civic mesh
      </p>
      <Skeleton className="mb-16 h-14 w-2/3 max-w-xl rounded-2xl border border-white/5 bg-white/[0.06]" />
      <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
            <Skeleton className="h-40 rounded-2xl border border-white/5 bg-white/[0.04]" />
          </motion.div>
        ))}
      </div>
      <Skeleton className="h-[420px] w-full rounded-[2rem] border border-white/5 bg-white/[0.04]" />
    </div>
  </div>
)

// --- Auth Guard ---
const ProtectedRoute = ({ children, role }: { children: React.ReactNode; role?: string | string[] }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore()

  if (isLoading) return <PageLoader />

  if (!isAuthenticated) return <Navigate to="/login" replace />

  // If a specific role is required, check it
  if (role) {
    const roles = Array.isArray(role) ? role : [role]
    const hasRole = roles.includes(user?.role || '')
    if (!hasRole) return <Navigate to="/" replace />
  }

  return <>{children}</>
}



export default function App() {
  const { user, initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <BrowserRouter>
      <SmoothScrollProvider>
      <Suspense fallback={<PageLoader />}>

        <Routes>
          <Route path="/" element={<AppShell />}>

            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="complaints/track/:id" element={<ComplaintTracking />} />
            <Route path="complaints/map" element={<MapPage />} />
            <Route path="community" element={<CommunityFeed />} />

            {/* Citizen Routes */}
            <Route
              path="dashboard/citizen"
              element={<ProtectedRoute role="citizen"><UserDashboard /></ProtectedRoute>}
            />

            <Route
              path="complaints/new"
              element={<ProtectedRoute><NewComplaint /></ProtectedRoute>}
            />

            <Route
              path="profile"
              element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
            />

            {/* Officer Routes */}
            <Route
              path="dashboard/officer"
              element={<ProtectedRoute role="officer"><OfficerDashboard /></ProtectedRoute>}
            />

            <Route
              path="dashboard/admin"
              element={
                <ProtectedRoute role={['admin', 'zonal_admin', 'super_admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Route>
        </Routes>
      </Suspense>
      </SmoothScrollProvider>
    </BrowserRouter>
  )
}