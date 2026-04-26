import { useState, useEffect, useMemo } from 'react'
import { Search, Clock, Calendar, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, PageHeader, Spinner, Avatar, getCourseColor, FilterTabs } from '@/components/ui'

export default function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents]     = useState([])
  const [courseTitles, setCourseTitles] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [search, setSearch]         = useState('')
  const [selectedDate, setDate]     = useState(new Date().toISOString().split('T')[0])

  const [activeMenu, setActiveMenu] = useState(null)
  const [activeHistory, setActiveHistory] = useState(null)
  // Стейт для навигации по месяцам в логе
  const [viewDate, setViewDate] = useState(new Date())

  const load = async () => {
    setLoading(true)
    try {
      const [a, s, c] = await Promise.all([
        api.getAttendance(),
        api.getStudents(),
        api.getCourses()
      ])
      setAttendance(a)
      setStudents(s)
      if (Array.isArray(c)) {
        setCourseTitles(c.map(course => ({
          value: typeof course === 'object' ? course.title : course,
          label: typeof course === 'object' ? course.title : course
        })))
      }
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    const closeAll = () => { setActiveMenu(null); setActiveHistory(null) }
    window.addEventListener('click', closeAll)
    return () => window.removeEventListener('click', closeAll)
  }, [])

  const combinedData = useMemo(() => {
    return students.map(student => {
      const records = attendance.filter(a => a.student_id === student.id)
      const current = records.find(a => a.date.split('T')[0] === selectedDate)
      return {
        ...student,
        student_id: student.id,
        student_name: student.fullname || student.name,
        course_title: student.course || 'Backend',
        status: current ? current.status : 'absent',
        updated_at: current?.updated_at || current?.date || null,
        history: records
      }
    })
  }, [students, attendance, selectedDate])

  const filtered = useMemo(() => combinedData.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.student_name.toLowerCase().includes(q)
    const matchF = filter === 'all' || a.status === filter
    const matchC = courseFilter === 'all' || a.course_title === courseFilter
    return matchQ && matchF && matchC
  }), [combinedData, filter, search, courseFilter])

  const handleSetStatus = async (student, newStatus) => {
    try {
      await api.markAttendance({
        student_id: student.student_id,
        status: newStatus,
        date: selectedDate,
        course_id: student.course_id || 1
      })
      await load()
      setActiveMenu(null)
    } catch (err) { console.error(err) }
  }

  // Логика календаря
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    return Array.from({ length: daysInMonth(year, month) }, (_, i) => i + 1)
  }, [viewDate])

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in relative text-white">
      <PageHeader tag="Журнал" title="Посещаемость" />

      {/* КАРТОЧКИ */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="card p-4 bg-slate-900 border-white/10 text-center">
            <div className="text-[10px] uppercase tracking-tighter text-white/40 font-bold mb-1">Курс</div>
            <div className="text-xl font-black text-primary italic uppercase">Progressive</div>
        </div>
        <div className="card p-4 border-l-4 border-success bg-success/10 shadow-lg shadow-success/5">
          <div className="text-success text-[10px] uppercase font-black">Присутствует</div>
          <div className="text-3xl font-black text-white">{filtered.filter(a => a.status === 'present').length}</div>
        </div>
        <div className="card p-4 border-l-4 border-warning bg-warning/10 shadow-lg shadow-warning/5">
          <div className="text-warning text-[10px] uppercase font-black">Уважительная</div>
          <div className="text-3xl font-black text-white">{filtered.filter(a => a.status === 'excused').length}</div>
        </div>
        <div className="card p-4 border-l-4 border-danger bg-danger/10 shadow-lg shadow-danger/5">
          <div className="text-danger text-[10px] uppercase font-black">Отсутствует</div>
          <div className="text-3xl font-black text-white">{filtered.filter(a => a.status === 'absent').length}</div>
        </div>
      </div>

      {/* ИНСТРУМЕНТЫ */}
      <div className="flex gap-3 mb-6 items-center flex-wrap">
        <div className="relative flex-1 min-w-[250px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск студента..." className="input-field pl-10 w-full bg-slate-900 text-white border-white/10" />
        </div>

        <select value={courseFilter} onChange={e => setCourseFilter(e.target.value)} className="input-field w-auto bg-slate-900 border-white/10 text-white font-bold">
          <option value="all">Все курсы</option>
          {courseTitles.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2">
          <button onClick={(e) => { e.stopPropagation(); const d = new Date(selectedDate); d.setDate(d.getDate()-1); setDate(d.toISOString().split('T')[0]) }} className="text-primary hover:scale-125 transition-transform"><ChevronLeft size={18}/></button>
          <input type="date" value={selectedDate} onChange={e => setDate(e.target.value)} className="bg-transparent text-sm font-black outline-none text-white uppercase" />
          <button onClick={(e) => { e.stopPropagation(); const d = new Date(selectedDate); d.setDate(d.getDate()+1); setDate(d.toISOString().split('T')[0]) }} className="text-primary hover:scale-125 transition-transform"><ChevronRight size={18}/></button>
        </div>

        <FilterTabs value={filter} onChange={setFilter}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'present', label: 'Был' },
            { value: 'absent', label: 'Нет' },
            { value: 'excused', label: 'Причина' }
          ]} />
      </div>

      <div className="card overflow-visible border-white/10 bg-slate-900/50 backdrop-blur-md shadow-2xl">
        {loading ? <div className="p-20 flex justify-center"><Spinner className="w-10 h-10 text-primary" /></div> : (
          <table className="w-full text-left">
            <thead className="bg-white/5 font-black uppercase text-[11px] tracking-widest text-white/60 border-b border-white/10">
              <tr>
                <th className="py-5 pl-8">Студент</th>
                <th>Курс</th>
                <th>Статус</th>
                <th className="text-right pr-8">Активность</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.student_id} className="hover:bg-white/5 transition-all border-b border-white/5 group">
                  <td className="py-4 pl-8">
                    <div className="flex items-center gap-4">
                      <Avatar name={a.student_name} color={getCourseColor(a.course_title)} size="md" className="ring-2 ring-white/5" />
                      <span className="text-sm font-bold text-white">{a.student_name}</span>
                    </div>
                  </td>
                  <td><Badge variant="outline" className="text-[10px] border-white/20 text-white/70">{a.course_title}</Badge></td>
                  <td className="relative">
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === a.student_id ? null : a.student_id) }}
                      className="active:scale-95 transition-all outline-none"
                    >
                      <Badge type={a.status} className="w-44 justify-center py-2 text-[11px] font-black uppercase tracking-tighter shadow-xl text-white">
                        {a.status === 'present' ? 'Присутствует' : a.status === 'absent' ? 'Отсутствует' : 'Уважительная'}
                      </Badge>
                    </button>

                    {activeMenu === a.student_id && (
                      <div className="absolute top-full left-0 mt-2 w-52 bg-slate-800 border border-white/20 rounded-2xl shadow-2xl z-[100] p-2 animate-in zoom-in duration-150">
                        {[
                          { id: 'present', label: 'Присутствует', icon: Check, color: 'text-success' },
                          { id: 'absent', label: 'Отсутствует', icon: X, color: 'text-danger' },
                          { id: 'excused', label: 'Уважительная', icon: AlertCircle, color: 'text-warning' }
                        ].map(opt => (
                          <button key={opt.id} onClick={() => handleSetStatus(a, opt.id)}
                            className="flex items-center gap-3 w-full p-3 hover:bg-white/10 rounded-xl text-[11px] font-black uppercase text-white transition-colors">
                            <opt.icon size={16} className={opt.color} />
                            <span>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </td>

                  <td className="text-right pr-8 relative">
                    <div className="flex items-center justify-end gap-5">
                      <div className="text-xs font-black text-white/40 flex items-center gap-1.5">
                         <Clock size={12} />
                         {a.updated_at ? new Date(a.updated_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : '--:--'}
                      </div>

                      <div className="relative">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveHistory(activeHistory === a.student_id ? null : a.student_id); setViewDate(new Date()) }}
                          className={`p-2.5 rounded-xl transition-all border-2 ${activeHistory === a.student_id ? 'bg-primary border-primary text-white scale-110 shadow-lg shadow-primary/30' : 'hover:bg-white/10 text-white/50 border-white/10'}`}
                        >
                          <Calendar size={18} />
                        </button>

                        {/* ПОЛНОЦЕННЫЙ КАЛЕНДАРЬ */}
                        {activeHistory === a.student_id && (
                          <div className="absolute bottom-full right-0 mb-4 w-72 bg-slate-900 border-2 border-white/10 rounded-[2rem] shadow-2xl z-[100] p-5 animate-in slide-in-from-bottom-4 duration-300 backdrop-blur-xl">
                            <div className="flex justify-between items-center mb-5 border-b border-white/10 pb-3">
                                <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()-1))) }} className="p-1 hover:text-primary text-white"><ChevronLeft size={20}/></button>
                                <span className="text-[12px] font-black uppercase tracking-[0.2em] text-white">
                                    {viewDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}
                                </span>
                                <button onClick={(e) => { e.stopPropagation(); setViewDate(new Date(viewDate.setMonth(viewDate.getMonth()+1))) }} className="p-1 hover:text-primary text-white"><ChevronRight size={20}/></button>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                              {calendarDays.map(day => {
                                const currentViewDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                                const dayStatus = a.history.find(h => new Date(h.date).toDateString() === currentViewDate.toDateString())?.status;

                                return (
                                  <div key={day} className={`w-8 h-8 rounded-xl text-[11px] flex items-center justify-center font-black transition-all border border-white/5
                                    ${dayStatus === 'present' ? 'bg-success text-white shadow-md shadow-success/20' : 
                                      dayStatus === 'excused' ? 'bg-warning text-white shadow-md shadow-warning/20' : 
                                      dayStatus === 'absent' ? 'bg-danger text-white shadow-md shadow-danger/20' : 'bg-white/5 text-white/30'}`}>
                                    {day}
                                  </div>
                                )
                              })}
                            </div>
                            <div className="mt-5 pt-4 border-t border-white/10 flex justify-around text-[12px] font-black italic">
                               <div className="text-success">✔ {a.history.filter(h=>h.status==='present').length}</div>
                               <div className="text-warning">? {a.history.filter(h=>h.status==='excused').length}</div>
                               <div className="text-danger">✖ {a.history.filter(h=>h.status==='absent').length}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-8 flex justify-between items-center text-[11px] text-white/40 uppercase font-black tracking-widest px-6">
        <span>Всего в списке: {filtered.length}</span>
        <div className="flex gap-8">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success"></div> Был</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-warning"></div> Причина</span>
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-danger"></div> Нет</span>
        </div>
      </div>
    </div>
  )
}