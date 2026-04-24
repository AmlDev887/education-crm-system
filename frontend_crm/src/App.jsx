import { useState } from 'react' // Добавляем useState
import { Routes, Route, Navigate } from 'react-router-dom'
import Auth from './Auth' // Импортируй свой новый файл Auth.jsx
import Sidebar from '@/components/Sidebar'
import Dashboard  from '@/pages/Dashboard'
import Students   from '@/pages/Students'
import Courses    from '@/pages/Courses'
import Payments   from '@/pages/Payments'
import Attendance from '@/pages/Attendance'
import Reports    from '@/pages/Reports'
import Settings   from '@/pages/Settings'

export default function App() {
  // 1. Создаем состояние: залогинен пользователь или нет
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 2. Если НЕ залогинен — показываем ТОЛЬКО окно входа
  if (!isAuthenticated) {
    return <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  // 3. Если залогинен — показываем весь остальной интерфейс
  return (
    <div className="flex h-screen overflow-hidden bg-bg-0">
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