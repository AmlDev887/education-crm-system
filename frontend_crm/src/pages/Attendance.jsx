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
  const [dateType, setDateType]     = useState('all') // 'all', 'today', 'week', 'month', 'custom'

  const load = () => Promise.all([api.getAttendance(), api.getStudents()]).then(([a, s]) => {
    setAttendance(a); setStudents(s); setLoading(false)
  })

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => attendance.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.studentName.toLowerCase().includes(q) || a.course.toLowerCase().includes(q)
    const matchF = filter === 'all' || a.status === filter

    // Логика фильтрации по датам
    const recordDate = new Date(a.date)
    const now = new Date()
    let matchD = true

    if (dateType === 'today') {
      matchD = a.date === now.toISOString().split('T')[0]
    } else if (dateType === 'week') {
      const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7)
      matchD = recordDate >= weekAgo
    } else if (dateType === 'month') {
      matchD = recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear()
    } else if (dateType === 'custom') {
      matchD = !selectedDate || a.date === selectedDate
    }

    return matchQ && matchF && matchD
  }), [attendance, filter, search, selectedDate, dateType])

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
      <PageHeader tag="Отслеживание" title="Посещаемость" />

      {/* Сводка */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Процент посещаемости', value: `${rate}%`, color: rate > 80 ? '#10b981' : rate > 60 ? '#f59e0b' : '#f43f5e' },
          { label: 'Присутствуют', value: presentCount, color: '#10b981' },
          { label: 'Отсутствуют',  value: absentCount,  color: '#f43f5e' },
        ].map(s => (
          <div key={s.label} className="card flex-1 p-4">
            <div className="label">{s.label}</div>
            <div className="text-2xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск студента или курса..."
            className="input-field pl-8" />
        </div>

        <div className="flex gap-2 items-center">
          <select
            value={dateType}
            onChange={(e) => setDateType(e.target.value)}
            className="input-field w-auto text-xs py-1.5"
          >
            <option value="all">Все даты</option>
            <option value="today">Сегодня</option>
            <option value="week">За неделю</option>
            <option value="month">За месяц</option>
            <option value="custom">Выбрать дату...</option>
          </select>

          {dateType === 'custom' && (
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setDate(e.target.value)}
              className="input-field w-auto text-xs py-1 px-2 animate-fade-in"
            />
          )}
        </div>

        <FilterTabs value={filter} onChange={setFilter}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'present', label: 'Был' },
            { value: 'absent', label: 'Нет' }
          ]} />
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : (
          <table className="w-full">
            <thead className="bg-bg-1">
              <tr>
                <th className="th">Студент</th>
                <th className="th">Курс</th>
                <th className="th">Дата</th>
                <th className="th">Статус</th>
                <th className="th">Действие</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={5}><Empty message="Записей о посещаемости не найдено" icon={CalendarCheck} /></td></tr>
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
                    <td className="td"><Badge type={a.status}>{a.status === 'present' ? 'Был' : 'Нет'}</Badge></td>
                    <td className="td">
                      <button onClick={() => markToggle(a)}
                        className="text-[11px] font-mono text-txt-muted hover:text-txt bg-bg-3 hover:bg-bg-4 border border-border px-2.5 py-1 rounded-lg transition-colors">
                        Отметить как {a.status === 'present' ? 'отсутствующего' : 'присутствующего'}
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        )}
      </div>
      <div className="mt-3 text-[11px] text-txt-dim font-mono">Показано записей: {filtered.length}</div>
    </div>
  )
}