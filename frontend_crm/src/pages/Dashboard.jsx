import { useState, useEffect } from 'react'
import { Users, BookOpen, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts'
import { api } from '@/api/client'
import { StatCard, Badge, Avatar, getCourseColor, fmtUZS, fmtM, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/ui'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === 'revenue' ? fmtM(p.value) : p.value}
        </div>
      ))}
    </div>
  )
}

export default function Attendance() {
  const [stats, setStats] = useState(null)
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Загружаем данные именно для страницы посещаемости (Attendance)
    Promise.all([
      api.getStats(), // Статистика может быть общей или специфичной для посещаемости
      api.getAttendance(), // Метод из твоего api/client.js
      api.getCourses()
    ]).then(([s, att, cr]) => {
      setStats(s)
      // Берем последние записи о посещаемости для списка
      setAttendanceRecords(att.slice(0, 5))
      setCourses(cr)
      setLoading(false)
    }).catch(err => {
      console.error("Attendance data load error:", err)
      setLoading(false)
    })
  }, [])

  if (loading) return <div className="p-8"><Spinner /></div>
  if (!stats) return <div className="p-8 text-txt-muted font-mono">Failed to load attendance stats from backend.</div>

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      {/* Меняем заголовок на Attendance */}
      <PageHeader tag="Daily Logs" title="Attendance" />

      {/* Stat Cards — используем данные посещаемости */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard
          label="Total Present"
          value={stats.totalPresent || 0}
          icon={Users}
          accent="#10b981"
          delta={stats.presenceDelta || 0}
          sub="Today's attendance"
        />
        <StatCard
          label="Total Absent"
          value={stats.totalAbsent || 0}
          icon={AlertCircle}
          accent="#f43f5e"
          delta={0}
          sub="Missing today"
        />
        <StatCard
          label="Attendance Rate"
          value={`${stats.attendanceRate || 0}%`}
          icon={TrendingUp}
          accent="#a78bfa"
          delta={2}
          sub="Average monthly"
        />
        <StatCard
          label="Pending Mark"
          value={stats.pendingAttendance || 0}
          icon={BookOpen}
          accent="#eae8e3"
          delta={0}
          sub="Classes to check"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold">Attendance History</div>
              <div className="text-xs text-txt-muted mt-0.5">Students present per month</div>
            </div>
            <Badge>2026</Badge>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            {/* Используем stats.monthly_attendance из бэкенда */}
            <BarChart data={stats.monthly_attendance || []} barSize={22}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={28} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
              <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Absence Trend</div>
          <div className="text-xs text-txt-muted mb-5">Monthly Count</div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={stats.monthly_attendance || []}>
              <defs>
                <linearGradient id="absGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#f43f5e" strokeWidth={2} fill="url(#absGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Recent Attendance Logs */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Recent Logs</span>
            <button className="text-[11px] text-accent hover:text-violet-300 font-mono">History →</button>
          </div>
          <div>
            {attendanceRecords.map((item, i) => (
              <div key={item.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < attendanceRecords.length - 1 ? 'border-b border-border/60' : ''}`}>
                <Avatar name={item.studentName || item.fullname} color={getCourseColor(item.course)} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{item.studentName || item.fullname}</div>
                  <div className="text-xs text-txt-muted truncate">{item.course} — {item.date}</div>
                </div>
                <Badge type={item.status === 'present' ? 'paid' : 'unpaid'}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Courses Attendance Overview */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Course Attendance</span>
          </div>
          <div>
            {courses.map((c, i, arr) => (
              <div key={c.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color || '#7c3aed' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{c.title}</div>
                  <div className="text-xs text-txt-muted">{c.instructor}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">{c.attendanceRate || 0}%</div>
                  <div className="text-[10px] text-txt-muted">presence</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}