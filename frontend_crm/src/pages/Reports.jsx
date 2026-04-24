import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid, Legend } from 'recharts'
import { MONTHLY_STATS, COURSES, store } from '@/store/data'
import { PageHeader, fmtM, fmtUZS } from '@/components/ui'

const PIE_COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg-3 border border-border-2 rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-txt-muted mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.dataKey === 'revenue' ? fmtM(p.value) + 'M UZS' : p.value}
        </div>
      ))}
    </div>
  )
}

const courseDistribution = COURSES.map(c => ({ name: c.title, value: c.students }))
const stats = store.getStats()
const students = store.getStudents()
const paidData = [{ name: 'Paid', value: stats.paid }, { name: 'Unpaid', value: stats.unpaid }]

export default function Reports() {
  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Analytics" title="Reports" />

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Revenue', value: fmtM(stats.totalRevenue) + 'M', sub: 'UZS collected' },
          { label: 'Avg per Student', value: fmtM(Math.round(stats.totalRevenue / (stats.paid || 1))), sub: 'UZS average' },
          { label: 'Collection Rate', value: `${Math.round((stats.paid / stats.totalStudents) * 100)}%`, sub: 'students paid' },
          { label: 'Course Count', value: COURSES.length, sub: `${stats.activeCourses} active` },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="label">{k.label}</div>
            <div className="text-2xl font-bold text-txt">{k.value}</div>
            <div className="text-xs text-txt-muted mt-1">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Monthly charts */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Monthly Registrations</div>
          <div className="text-xs text-txt-muted mb-5">Students enrolled per month</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={MONTHLY_STATS} barSize={20}>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(124,58,237,0.05)' }} />
              <Bar dataKey="students" name="Students" fill="#7c3aed" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Revenue Trend</div>
          <div className="text-xs text-txt-muted mb-5">Monthly income (UZS)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_STATS}>
              <defs>
                <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="#1e1e28" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#696874', fontSize: 10, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} width={24} tickFormatter={v => fmtM(v)} />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#282835' }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2} fill="url(#revG)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie charts row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Students by Course</div>
          <div className="text-xs text-txt-muted mb-4">Distribution across courses</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={courseDistribution} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                  {courseDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={0} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v + ' students', n]} contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-2 flex-1">
              {courseDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <div className="text-[11px] text-txt-muted flex-1 truncate">{d.name}</div>
                  <div className="text-[11px] font-mono text-txt">{d.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="text-sm font-semibold mb-1">Payment Status</div>
          <div className="text-xs text-txt-muted mb-4">Paid vs unpaid students</div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={paidData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                  <Cell fill="#10b981" strokeWidth={0} />
                  <Cell fill="#f43f5e" strokeWidth={0} />
                </Pie>
                <Tooltip contentStyle={{ background: '#14141a', border: '1px solid #282835', borderRadius: 8, fontSize: 11, fontFamily: 'IBM Plex Mono' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-txt-muted">Paid</span></div>
                <div className="text-xl font-bold text-success font-mono">{stats.paid}</div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5"><div className="w-2 h-2 rounded-full bg-danger" /><span className="text-xs text-txt-muted">Unpaid</span></div>
                <div className="text-xl font-bold text-danger font-mono">{stats.unpaid}</div>
              </div>
              <div className="text-[11px] font-mono text-txt-dim">{Math.round(stats.paid/stats.totalStudents*100)}% collection rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
