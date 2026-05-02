import { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Users, BookOpen, DollarSign, TrendingUp, AlertCircle, CheckCircle,
  ArrowUpRight, RefreshCw, AlertTriangle, Wallet
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, CartesianGrid,
} from 'recharts'
import { api } from '@/api/client'
import { Badge, Avatar, getCourseColor, fmtM, Spinner } from '@/components/ui'
import { PageHeader } from '@/components/ui'

// ─── Хелпер форматирования суммы ──────────────────────────────────
const fmtUZS = (v) => {
  if (!v && v !== 0) return '—'
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K'
  return String(v)
}

// ─── Названия месяцев на русском ─────────────────────────────────
const RU_MONTHS = {
  Jan: 'Янв', Feb: 'Фев', Mar: 'Мар', Apr: 'Апр',
  May: 'Май', Jun: 'Июн', Jul: 'Июл', Aug: 'Авг',
  Sep: 'Сен', Oct: 'Окт', Nov: 'Ноя', Dec: 'Дек',
}
const toRuMonth = (key) => RU_MONTHS[key] || key

// ─── Статус → русский ─────────────────────────────────────────────
const STATUS_RU = { paid: 'Оплачено', unpaid: 'Не оплачено', pending: 'В ожидании', present: 'Присутствует', absent: 'Отсутствует' }

// ─── Тултип графика ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'revenue' ? fmtUZS(p.value) + ' сум' : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── Карточка статистики ──────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, sub, delta }) {
  return (
    <div className="card flex-1 p-5 min-w-[160px]">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: accent + '20' }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color: accent }}>{value}</div>
      {sub && <div className="text-xs text-txt-muted mt-1">{sub}</div>}
      {delta !== undefined && delta !== 0 && (
        <div className="flex items-center gap-1 mt-1 text-[11px] text-success font-mono">
          <ArrowUpRight size={11} /> +{delta} в этом месяце
        </div>
      )}
    </div>
  )
}

// ─── Основной компонент ───────────────────────────────────────────
export default function Dashboard() {
  const [students, setStudents]       = useState([])
  const [courses, setCourses]         = useState([])
  const [attendance, setAttendance]   = useState([])
  const [payments, setPayments]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [error, setError]             = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  // ─── Загрузка данных ─────────────────────────────────────────
  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const [s, c, a, p] = await Promise.all([
        api.getStudents(),
        api.getCourses(),
        api.getAttendance(),
        api.getPayments(),
      ])
      setStudents(s)
      setCourses(c)
      setAttendance(a)
      setPayments(Array.isArray(p) ? p : [])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Ошибка загрузки дашборда:', err)
      setError(err.message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ─── Агрегация статистики ─────────────────────────────────────
  const stats = useMemo(() => {
    const totalStudents  = students.length
    const activeStudents = students.filter(s => s.is_active).length

    const totalPresent   = attendance.filter(a => a.status === 'present').length
    const totalAbsent    = attendance.filter(a => a.status === 'absent').length
    const attendanceRate = attendance.length > 0
      ? Math.round((totalPresent / attendance.length) * 100)
      : 0

    const paidPayments   = payments.filter(p => p.status === 'paid')
    const unpaidPayments = payments.filter(p => p.status !== 'paid')
    const totalRevenue   = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
    const paidCount      = paidPayments.length
    const unpaidCount    = unpaidPayments.length
    const totalDebt      = unpaidPayments.reduce((acc, p) => acc + (p.amount || 0), 0)

    const now = new Date()
    const newThisMonth = students.filter(s => {
      const d = new Date(s.date_rage)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    }).length

    return {
      totalStudents, activeStudents, paidCount, unpaidCount,
      totalPresent, totalAbsent, attendanceRate,
      totalRevenue, totalDebt, newThisMonth,
      activeCourses: courses.length,
    }
  }, [students, courses, attendance, payments])

  // ─── Данные графика по месяцам ───────────────────────────────
  const monthlyData = useMemo(() => {
    const map = {}
    students.forEach(s => {
      const d = new Date(s.date_rage)
      if (isNaN(d)) return
      const keyEn = d.toLocaleString('en', { month: 'short' })
      const key   = toRuMonth(keyEn)
      if (!map[key]) map[key] = { month: key, students: 0, revenue: 0 }
      map[key].students++
    })
    payments.forEach(p => {
      if (p.status !== 'paid') return
      const d = new Date(p.payment_date)
      if (isNaN(d)) return
      const keyEn = d.toLocaleString('en', { month: 'short' })
      const key   = toRuMonth(keyEn)
      if (!map[key]) map[key] = { month: key, students: 0, revenue: 0 }
      map[key].revenue += p.amount || 0
    })
    return Object.values(map)
  }, [students, payments])

  // ─── Посещаемость по месяцам ─────────────────────────────────
  const attendanceMonthly = useMemo(() => {
    const map = {}
    attendance.forEach(r => {
      const d     = new Date(r.date)
      const keyEn = d.toLocaleString('en', { month: 'short' })
      const key   = toRuMonth(keyEn)
      if (!map[key]) map[key] = { month: key, present: 0, absent: 0 }
      if (r.status === 'present') map[key].present++
      else map[key].absent++
    })
    return Object.values(map).slice(-6)
  }, [attendance])

  // ─── Статистика по курсам ────────────────────────────────────
  const courseStats = useMemo(() => {
    return courses.map(c => {
      const recs    = attendance.filter(a => a.course_id === c.id)
      const present = recs.filter(a => a.status === 'present').length
      const rate    = recs.length > 0 ? Math.round((present / recs.length) * 100) : 0
      const studentCount   = students.filter(s => s.course === c.title).length
      const courseRevenue  = payments
        .filter(p => p.status === 'paid' && p.course_title === c.title)
        .reduce((acc, p) => acc + (p.amount || 0), 0)
      return { ...c, attendanceRate: rate, studentCount, courseRevenue }
    })
  }, [courses, attendance, students, payments])

  // ─── Должники ─────────────────────────────────────────────────
  const debtors = useMemo(() =>
    payments.filter(p => p.status !== 'paid').slice(0, 5),
    [payments]
  )

  // ─── Последние студенты ───────────────────────────────────────
  const recentStudents = useMemo(() =>
    [...students]
      .sort((a, b) => new Date(b.date_rage) - new Date(a.date_rage))
      .slice(0, 5),
    [students]
  )

  // ─── Последние записи посещаемости ───────────────────────────
  const recentLogs = useMemo(() => [...attendance].reverse().slice(0, 6), [attendance])

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (error)   return <div className="p-8 text-danger font-mono text-center">⚠ {error}</div>

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">

      {/* ── Шапка ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-6">
        <PageHeader tag="Обзор" title="Дашборд" />
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-[10px] font-mono text-txt-dim">
              обновлено в {lastUpdated.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-txt-muted hover:text-txt hover:border-txt-muted transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Обновить
          </button>
        </div>
      </div>

      {/* ── Карточки статистики ────────────────────────────────── */}
      <div className="flex gap-4 mb-8 flex-wrap">
        <StatCard
          label="Всего студентов"
          value={stats.totalStudents}
          icon={Users}
          accent="#7c3aed"
          sub={`${stats.activeStudents} активных`}
          delta={stats.newThisMonth}
        />
        <StatCard
          label="Активных курсов"
          value={stats.activeCourses}
          icon={BookOpen}
          accent="#38bdf8"
          sub="В базе данных"
        />
        <StatCard
          label="Общая выручка"
          value={fmtUZS(stats.totalRevenue) + ' сум'}
          icon={DollarSign}
          accent="#10b981"
          sub={`${stats.paidCount} оплаченных платежей`}
        />
        <StatCard
          label="Посещаемость"
          value={`${stats.attendanceRate}%`}
          icon={TrendingUp}
          accent="#a78bfa"
          sub={`${stats.totalPresent} присутствовало / ${stats.totalAbsent} отсутствовало`}
        />
      </div>

      {/* ── Статус оплат ───────────────────────────────────────── */}
      <div className="card p-4 mb-6 flex items-center gap-6">
        <div className="text-xs font-mono text-txt-dim uppercase tracking-widest whitespace-nowrap">Статус оплат</div>
        <div className="flex-1 h-2 bg-bg-4 rounded-full overflow-hidden">
          <div
            className="h-full bg-success rounded-full transition-all duration-700"
            style={{
              width: `${(stats.paidCount + stats.unpaidCount) > 0
                ? (stats.paidCount / (stats.paidCount + stats.unpaidCount)) * 100
                : 0}%`
            }}
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-mono flex-shrink-0">
          <span className="flex items-center gap-1.5 text-success">
            <CheckCircle size={11} /> {stats.paidCount} оплачено
          </span>
          <span className="flex items-center gap-1.5 text-danger">
            <AlertCircle size={11} /> {stats.unpaidCount} не оплачено
          </span>
          {stats.totalDebt > 0 && (
            <span className="flex items-center gap-1.5 text-warning">
              <Wallet size={11} /> долг: {fmtUZS(stats.totalDebt)} сум
            </span>
          )}
        </div>
      </div>

      {/* ── Графики ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        {/* Бар-чарт: студенты + выручка */}
        <div className="card col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-sm font-semibold">Регистрации и выручка</div>
              <div className="text-xs text-txt-muted mt-0.5">Новые студенты и платежи по месяцам</div>
            </div>
            <Badge>{new Date().getFullYear()}</Badge>
          </div>
          {monthlyData.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-12 text-center">Данных пока нет</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={monthlyData} barSize={16} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fill: '#696874', fontSize: 11, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} />
                <YAxis yAxisId="right" orientation="right" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={48} tickFormatter={v => fmtUZS(v)} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                <Bar yAxisId="left"  dataKey="students" name="Студенты" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="revenue"  name="Выручка"  fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Площадной чарт: посещаемость */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Посещаемость</div>
          <div className="text-xs text-txt-muted mb-5">Присутствие по месяцам</div>
          {attendanceMonthly.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-12 text-center">Данных пока нет</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={attendanceMonthly}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
                <Area type="monotone" dataKey="present" name="Присутствовало" stroke="#10b981" strokeWidth={2} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Нижняя сетка ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Последние студенты */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Последние студенты</span>
            <span className="text-[11px] text-accent font-mono">{stats.newThisMonth} в этом месяце</span>
          </div>
          <div>
            {recentStudents.length === 0 ? (
              <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">Студентов пока нет</div>
            ) : recentStudents.map((s, i, arr) => (
              <div
                key={s.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <Avatar name={s.fullname} color={getCourseColor?.(s.course) || '#7c3aed'} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{s.fullname}</div>
                  <div className="text-xs text-txt-muted truncate">{s.course || 'Курс не указан'}</div>
                </div>
                <Badge type={s.status}>{STATUS_RU[s.status] || s.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Обзор курсов */}
        <div className="card">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold">Обзор курсов</span>
            <span className="text-[11px] text-txt-muted font-mono">{courses.length} курсов</span>
          </div>
          <div>
            {courseStats.length === 0 ? (
              <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">Курсов пока нет</div>
            ) : courseStats.map((c, i, arr) => (
              <div
                key={c.id}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: courseColor(c.id) }} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.title}</div>
                  <div className="text-xs text-txt-muted">{c.studentCount} студ. · собрано {fmtUZS(c.courseRevenue)} сум</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium">{c.attendanceRate}%</div>
                  <div className="text-[10px] text-txt-muted">посещаемость</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Должники ─────────────────────────────────────────────── */}
      {debtors.length > 0 && (
        <div className="card mb-4">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-warning" />
              <span className="text-sm font-semibold">Неоплаченные платежи</span>
            </div>
            <span className="text-[11px] text-warning font-mono">
              {stats.unpaidCount} в ожидании · долг: {fmtUZS(stats.totalDebt)} сум
            </span>
          </div>
          <div>
            {debtors.map((p, i, arr) => (
              <div
                key={p.id ?? i}
                className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <Avatar name={p.student_name || '?'} color="#f59e0b" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{p.student_name || '—'}</div>
                  <div className="text-xs text-txt-muted truncate">{p.course_title || '—'}</div>
                </div>
                <div className="text-right mr-3">
                  <div className="text-sm font-mono font-semibold text-warning">{fmtUZS(p.amount)} сум</div>
                  <div className="text-[10px] text-txt-muted">
                    {p.next_payment_date
                      ? `срок: ${new Date(p.next_payment_date).toLocaleDateString('ru', { day: '2-digit', month: 'short' })}`
                      : ''}
                  </div>
                </div>
                <Badge type="unpaid">{STATUS_RU[p.status] || p.status}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Последние записи посещаемости ────────────────────────── */}
      <div className="card">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold">Последние записи посещаемости</span>
          <span className="text-[11px] text-txt-muted font-mono">{attendance.length} всего записей</span>
        </div>
        <div>
          {recentLogs.length === 0 ? (
            <div className="px-5 py-8 text-xs text-txt-dim font-mono text-center">Записей пока нет</div>
          ) : recentLogs.map((item, i, arr) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-5 py-3 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
            >
              <Avatar
                name={item.student_name || item.studentName || '?'}
                color={getCourseColor?.(item.course_title) || '#7c3aed'}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {item.student_name || item.studentName || '—'}
                </div>
                <div className="text-xs text-txt-muted truncate">
                  {item.course_title || item.course || '—'} · {item.date}
                </div>
              </div>
              <Badge type={item.status === 'present' ? 'paid' : 'unpaid'}>
                {STATUS_RU[item.status] || item.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

function courseColor(id) {
  const COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']
  return COLORS[(id - 1) % COLORS.length]
}
