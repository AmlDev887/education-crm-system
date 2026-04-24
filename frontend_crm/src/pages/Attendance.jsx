import { useState, useEffect, useMemo } from 'react'
import { CalendarCheck, Search } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, FilterTabs, PageHeader, Spinner, Empty, Avatar, getCourseColor } from '@/components/ui'

export default function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents]     = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')
  const [selectedDate, setDate]     = useState('')

  const load = () => Promise.all([api.getAttendance(), api.getStudents()]).then(([a, s]) => {
    setAttendance(a); setStudents(s); setLoading(false)
  })

  useEffect(() => { load() }, [])

  const dates = [...new Set(attendance.map(a => a.date))].sort().reverse()

  const filtered = useMemo(() => attendance.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.studentName.toLowerCase().includes(q) || a.course.toLowerCase().includes(q)
    const matchF = filter === 'all' || a.status === filter
    const matchD = !selectedDate || a.date === selectedDate
    return matchQ && matchF && matchD
  }), [attendance, filter, search, selectedDate])

  const presentCount = filtered.filter(a => a.status === 'present').length
  const absentCount  = filtered.filter(a => a.status === 'absent').length
  const rate = filtered.length > 0 ? Math.round((presentCount / filtered.length) * 100) : 0

  const markToggle = async (record) => {
    const newStatus = record.status === 'present' ? 'absent' : 'present'
    await api.markAttendance({ ...record, status: newStatus })
    load()
  }

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Tracking" title="Attendance" />

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Attendance Rate', value: `${rate}%`, color: rate > 80 ? '#10b981' : rate > 60 ? '#f59e0b' : '#f43f5e' },
          { label: 'Present', value: presentCount, color: '#10b981' },
          { label: 'Absent',  value: absentCount,  color: '#f43f5e' },
        ].map(s => (
          <div key={s.label} className="card flex-1 p-4">
            <div className="label">{s.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or course..."
            className="input-field pl-8" />
        </div>
        <select value={selectedDate} onChange={e => setDate(e.target.value)} className="input-field w-auto text-xs py-1.5">
          <option value="">All Dates</option>
          {dates.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <FilterTabs value={filter} onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'present', label: 'Present' }, { value: 'absent', label: 'Absent' }]} />
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full">
            <thead className="bg-bg-1">
              <tr>
                <th className="th">Student</th>
                <th className="th">Course</th>
                <th className="th">Date</th>
                <th className="th">Status</th>
                <th className="th">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5}><Empty message="No attendance records found" icon={CalendarCheck} /></td></tr>
                : filtered.map(a => (
                  <tr key={a.id} className="hover:bg-bg-3 transition-colors">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <Avatar name={a.studentName} color={getCourseColor(a.course)} size="sm" />
                        <span className="text-sm font-medium">{a.studentName}</span>
                      </div>
                    </td>
                    <td className="td text-xs text-txt-muted">{a.course}</td>
                    <td className="td text-xs font-mono text-txt-muted">{a.date}</td>
                    <td className="td"><Badge type={a.status}>{a.status}</Badge></td>
                    <td className="td">
                      <button onClick={() => markToggle(a)}
                        className="text-[11px] font-mono text-txt-muted hover:text-txt bg-bg-3 hover:bg-bg-4 border border-border px-2.5 py-1 rounded-lg transition-colors">
                        Mark {a.status === 'present' ? 'absent' : 'present'}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-3 text-[11px] text-txt-dim font-mono">Showing {filtered.length} records</div>
    </div>
  )
}
