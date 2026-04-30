import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Sidebar    from '@/components/Sidebar'
import Login      from '@/components/Login'
import Dashboard  from '@/pages/Dashboard'
import Students   from '@/pages/Students'
import Courses    from '@/pages/Courses'
import Payments   from '@/pages/Payments'
import Attendance from '@/pages/Attendance'
import Reports    from '@/pages/Reports'
import Settings   from '@/pages/Settings'

export default function App() {
  const [authed, setAuthed] = useState(false)

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-0">
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#18181b',
            color: '#fff',
            border: '1px solid #27272a',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
        }}
      />
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/"           element={<Dashboard />}  />
          <Route path="/students"   element={<Students />}   />
          <Route path="/courses"    element={<Courses />}    />
          <Route path="/payments"   element={<Payments />}   />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/reports"    element={<Reports />}    />
          <Route path="/settings"   element={<Settings />}   />
          <Route path="*"           element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
