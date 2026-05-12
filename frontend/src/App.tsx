import { collection, addDoc } from "firebase/firestore";
import { db } from "./firebase";
import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { useAuthStore } from './store/authStore'
import { Skeleton } from './components/ui'

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
  <div className="min-h-screen pt-32 px-6 max-w-[1400px] mx-auto overflow-hidden">
    <Skeleton className="h-20 w-1/2 mb-16 rounded-xl" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
    <Skeleton className="h-[500px] rounded-handcrafted-lg" />
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
    </BrowserRouter>
  )
}