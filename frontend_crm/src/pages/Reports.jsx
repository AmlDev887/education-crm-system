import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid,
} from 'recharts'
import { api } from '@/api/client'
import { PageHeader, Spinner } from '@/components/ui'

const PIE_COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

// ─── Форматирование сумм ──────────────────────────────────────────
// Суммы в базе хранятся как есть (500000 = 500 000 сум)
function fmtUZS(v) {
  if (!v && v !== 0) return '0'
  if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + ' млрд'
  if (v >= 1_000_000)     return (v / 1_000_000).toFixed(1) + ' млн'
  if (v >= 1_000)         return (v / 1_000).toFixed(0) + ' тыс'
  return v.toLocaleString('ru')
}

// Короткий формат для осей графиков
function fmtShort(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'М'
  if (v >= 1_000)     return (v / 1_000).toFixed(0) + 'К'
  return String(v)
}

// ─── Русские месяцы ───────────────────────────────────────────────
const RU_MONTHS = {
  Jan: 'Янв', Feb: 'Фев', Mar: 'Мар', Apr: 'Апр',
  May: 'Май', Jun: 'Июн', Jul: 'Июл', Aug: 'Авг',
  Sep: 'Сен', Oct: 'Окт', Nov: 'Ноя', Dec: 'Дек',
}
const toRuMonth = (key) => RU_MONTHS[key] || key

// ─── Тултип ───────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}:{' '}
          {p.dataKey === 'revenue'
            ? fmtUZS(p.value) + ' сум'
            : p.value}
        </div>
      ))}
    </div>
  )
}

// ─── KPI карточка ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, accent }) {
  return (
    <div className="card p-4">
      <div className="text-[11px] font-mono text-txt-dim uppercase tracking-widest mb-2">{label}</div>
      <div className="text-2xl font-bold font-mono" style={{ color: accent || 'var(--txt)' }}>{value}</div>
      {sub && <div className="text-xs text-txt-muted mt-1">{sub}</div>}
    </div>
  )
}

// ─── Основной компонент ───────────────────────────────────────────
export default function Reports() {
  const [students,   setStudents]   = useState([])
  const [courses,    setCourses]    = useState([])
  const [attendance, setAttendance] = useState([])
  const [payments,   setPayments]   = useState([])   // ✅ добавлено
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    // ✅ загружаем 4 эндпоинта, включая payments
    Promise.all([
      api.getStudents(),
      api.getCourses(),
      api.getAttendance(),
      api.getPayments(),
    ])
      .then(([s, c, a, p]) => {
        setStudents(s)
        setCourses(c)
        setAttendance(a)
        setPayments(Array.isArray(p) ? p : [])
      })
      .catch(err => {
        console.error('Ошибка загрузки отчётов:', err)
        setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [])

  // ─── Агрегация ────────────────────────────────────────────────
  const data = useMemo(() => {
    if (!students.length && !courses.length) return null

    const totalStudents = students.length

    // ✅ Выручка из реальных payments (суммы как есть в базе)
    const paidPayments   = payments.filter(p => p.status === 'paid')
    const unpaidPayments = payments.filter(p => p.status !== 'paid')
    const totalRevenue   = paidPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
    const paidCount      = paidPayments.length
    const unpaidCount    = unpaidPayments.length
    const totalDebt      = unpaidPayments.reduce((acc, p) => acc + (p.amount || 0), 0)
    const avgPerPayment  = paidCount > 0 ? Math.round(totalRevenue / paidCount) : 0

    // Процент сбора
    const collectionRate = (paidCount + unpaidCount) > 0
      ? Math.round((paidCount / (paidCount + unpaidCount)) * 100)
      : 0

    // Посещаемость
    const presentCount   = attendance.filter(r => r.status === 'present').length
    const absentCount    = attendance.filter(r => r.status === 'absent').length
    const attendanceRate = attendance.length > 0
      ? Math.round((presentCount / attendance.length) * 100)
      : 0

    // Распределение студентов по курсам
    const coursesDistribution = courses.map(c => ({
      title:    c.title,
      students: students.filter(s => s.course === c.title).length,
      // ✅ Выручка по курсу из реальных payments
      revenue:  paidPayments
        .filter(p => p.course_title === c.title)
        .reduce((acc, p) => acc + (p.amount || 0), 0),
    }))

    // ✅ Помесячная статистика из payments (реальные суммы)
    const monthMap = {}
    students.forEach(s => {
      const d = new Date(s.date_rage)
      if (isNaN(d)) return
      const key = toRuMonth(d.toLocaleString('en', { month: 'short' }))
      if (!monthMap[key]) monthMap[key] = { month: key, students: 0, revenue: 0 }
      monthMap[key].students++
    })
    paidPayments.forEach(p => {
      const d = new Date(p.payment_date)
      if (isNaN(d)) return
      const key = toRuMonth(d.toLocaleString('en', { month: 'short' }))
      if (!monthMap[key]) monthMap[key] = { month: key, students: 0, revenue: 0 }
      monthMap[key].revenue += p.amount || 0
    })
    const monthly_stats = Object.values(monthMap)

    // Посещаемость по месяцам
    const attMap = {}
    attendance.forEach(r => {
      const d   = new Date(r.date)
      const key = toRuMonth(d.toLocaleString('en', { month: 'short' }))
      if (!attMap[key]) attMap[key] = { month: key, present: 0, absent: 0 }
      if (r.status === 'present') attMap[key].present++
      else attMap[key].absent++
    })
    const monthly_attendance = Object.values(attMap)

    return {
      totalStudents, paidCount, unpaidCount,
      totalRevenue, totalDebt, avgPerPayment, collectionRate,
      attendanceRate, presentCount, absentCount,
      coursesDistribution, monthly_stats, monthly_attendance,
      activeCoursesCount: courses.length,
    }
  }, [students, courses, attendance, payments])

  const chartData = useMemo(() => {
    if (!data) return { courses: [], paid: [] }
    return {
      courses: data.coursesDistribution,
      paid: [
        { name: 'Оплачено',    value: data.paidCount },
        { name: 'Не оплачено', value: data.unpaidCount },
      ],
    }
  }, [data])

  // ─── Рендер ───────────────────────────────────────────────────
  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>
  if (error) return (
    <div className="p-8 text-danger font-mono text-center">
      ⚠ Ошибка загрузки отчётов: {error}
    </div>
  )
  if (!data) return (
    <div className="p-8 text-txt-muted font-mono text-center">
      Данных пока нет. Сначала добавьте студентов и курсы.
    </div>
  )

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Аналитика" title="Отчёты" />

      {/* ── KPI ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Общая выручка"
          value={fmtUZS(data.totalRevenue) + ' сум'}
          sub={`${data.paidCount} оплаченных платежей`}
          accent="#10b981"
        />
        <KpiCard
          label="Средний платёж"
          value={fmtUZS(data.avgPerPayment) + ' сум'}
          sub="среднее по оплаченным"
          accent="#7c3aed"
        />
        <KpiCard
          label="Процент сбора"
          value={`${data.collectionRate}%`}
          sub={`${data.paidCount} из ${data.paidCount + data.unpaidCount} платежей`}
          accent="#38bdf8"
        />
        <KpiCard
          label="Посещаемость"
          value={`${data.attendanceRate}%`}
          sub={`${attendance.length} записей в журнале`}
          accent="#a78bfa"
        />
      </div>

      {/* ── Долг (если есть) ────────────────────────────────────── */}
      {data.totalDebt > 0 && (
        <div className="card p-4 mb-6 flex items-center justify-between border border-warning/20 bg-warning/5">
          <div>
            <div className="text-xs font-mono text-warning uppercase tracking-widest mb-1">Общий долг</div>
            <div className="text-xl font-bold font-mono text-warning">{fmtUZS(data.totalDebt)} сум</div>
          </div>
          <div className="text-xs text-txt-muted font-mono text-right">
            <div>{data.unpaidCount} неоплаченных платежей</div>
            <div>Требуют внимания</div>
          </div>
        </div>
      )}

      {/* ── Графики по месяцам ─────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-4">

        {/* Регистрации */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Регистрации по месяцам</div>
          <div className="text-xs text-txt-muted mb-5">Количество новых студентов</div>
          {data.monthly_stats.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-10 text-center">Данных пока нет</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.monthly_stats} barSize={20}>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
                <Bar dataKey="students" name="Студенты" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Выручка */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Выручка по месяцам</div>
          <div className="text-xs text-txt-muted mb-5">Реальные поступления (сум)</div>
          {data.monthly_stats.length === 0 ? (
            <div className="text-xs text-txt-dim font-mono py-10 text-center">Данных пока нет</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data.monthly_stats}>
                <defs>
                  <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                  axisLine={false} tickLine={false} width={40}
                  tickFormatter={fmtShort}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
                <Area type="monotone" dataKey="revenue" name="Выручка" stroke="#10b981" strokeWidth={2} fill="url(#revG)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Посещаемость по месяцам ─────────────────────────────── */}
      {data.monthly_attendance.length > 0 && (
        <div className="card p-5 mb-4">
          <div className="text-sm font-semibold mb-1">Посещаемость по месяцам</div>
          <div className="text-xs text-txt-muted mb-5">Присутствие и отсутствие</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.monthly_attendance} barSize={14} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="present" name="Присутствовало" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="absent"  name="Отсутствовало"  fill="#f43f5e" radius={[3, 3, 0, 0]} opacity={0.7} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Круговые диаграммы ──────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* По курсам */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Студенты по курсам</div>
          <div className="text-xs text-txt-muted mb-4">Распределение по направлениям</div>
          {chartData.courses.every(c => c.students === 0) ? (
            <div className="text-xs text-txt-dim font-mono py-6 text-center">Сначала назначьте студентов на курсы</div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={chartData.courses}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={2}
                    dataKey="students"
                  >
                    {chartData.courses.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v + ' студентов', n]}
                    contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2 flex-1 max-h-[160px] overflow-y-auto pr-1">
                {chartData.courses.map((d, i) => (
                  <div key={d.title} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <div className="text-[11px] text-txt-muted flex-1 truncate">{d.title}</div>
                    <div className="text-[11px] font-mono text-txt font-medium">{d.students} чел.</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Статус оплат */}
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Статус платежей</div>
          <div className="text-xs text-txt-muted mb-4">Оплачено vs не оплачено</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={chartData.paid}
                  cx="50%" cy="50%"
                  innerRadius={45} outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  <Cell fill="#10b981" strokeWidth={0} />
                  <Cell fill="#f43f5e" strokeWidth={0} />
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-txt-muted">Оплачено</span>
                </div>
                <div className="text-xl font-bold text-success font-mono">{data.paidCount}</div>
                <div className="text-[10px] text-txt-dim font-mono">{fmtUZS(data.totalRevenue)} сум</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-danger" />
                  <span className="text-xs text-txt-muted">Не оплачено</span>
                </div>
                <div className="text-xl font-bold text-danger font-mono">{data.unpaidCount}</div>
                <div className="text-[10px] text-txt-dim font-mono">{fmtUZS(data.totalDebt)} сум долг</div>
              </div>
              <div className="text-[11px] font-mono text-txt-dim">
                {data.collectionRate}% сборов
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Выручка по курсам ───────────────────────────────────── */}
      {data.coursesDistribution.some(c => c.revenue > 0) && (
        <div className="card p-5 mt-4">
          <div className="text-sm font-semibold mb-1">Выручка по курсам</div>
          <div className="text-xs text-txt-muted mb-5">Реальные поступления из платежей (сум)</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.coursesDistribution} barSize={28} layout="vertical">
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false}
                tickFormatter={fmtShort}
              />
              <YAxis
                type="category" dataKey="title"
                tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }}
                axisLine={false} tickLine={false} width={100}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="revenue" name="Выручка" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

    </div>
  )
}
