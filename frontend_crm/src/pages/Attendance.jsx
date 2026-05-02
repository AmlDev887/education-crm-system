import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Search, Clock, Calendar, ChevronLeft, ChevronRight,
  Check, X, AlertCircle, Save, Target, Download,
  CheckSquare, Users, TrendingUp, Zap
} from 'lucide-react'
import { api } from '@/api/client'
import { Badge, PageHeader, Spinner, Avatar, getCourseColor, FilterTabs } from '@/components/ui'

// ─── Тост-уведомления ────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([])
  const show = useCallback((msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3200)
  }, [])
  return { toasts, show }
}

function ToastContainer({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`
          flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold shadow-2xl
          animate-in slide-in-from-right-4 duration-300
          ${t.type === 'success' ? 'bg-success text-white' :
            t.type === 'error' ? 'bg-danger text-white' :
            'bg-slate-700 text-white'}
        `}>
          {t.type === 'success' ? <Check size={16} /> : <X size={16} />}
          {t.msg}
        </div>
      ))}
    </div>
  )
}

// ─── Утилиты дат ─────────────────────────────────────────────────────────────
const toISO = (d) => d.toISOString().split('T')[0]
const isSameDay = (dateStr, d) => dateStr?.split('T')[0] === toISO(d)

// ─── Главный компонент ───────────────────────────────────────────────────────
export default function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [students, setStudents] = useState([])
  const [courseTitles, setCourseTitles] = useState([])
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [filter, setFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [search, setSearch] = useState('')

  const todayStr = useMemo(() => toISO(new Date()), [])
  const [selectedDate, setSelectedDate] = useState(todayStr)

  const [activeMenu, setActiveMenu] = useState(null)
  const [activeHistory, setActiveHistory] = useState(null)
  const [viewDate, setViewDate] = useState(new Date())
  const [localChanges, setLocalChanges] = useState({})
  const [selectAll, setSelectAll] = useState(null) // null | 'present' | 'absent'

  const { toasts, show: showToast } = useToast()
  const saveRef = useRef(null)

  // ─── Загрузка данных ──────────────────────────────────────────────────────
  const load = useCallback(async () => {
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
      setLocalChanges({})
    } catch (err) {
      console.error(err)
      showToast('Ошибка загрузки данных', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  // ─── Закрытие попапов ─────────────────────────────────────────────────────
  useEffect(() => {
    const close = () => { setActiveMenu(null); setActiveHistory(null) }
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ─── Предупреждение при смене даты с несохранёнными изменениями ───────────
  const handleDateChange = useCallback((newDate) => {
    if (Object.keys(localChanges).length > 0) {
      if (!window.confirm('Есть несохранённые изменения. Перейти без сохранения?')) return
    }
    setSelectedDate(newDate)
    setLocalChanges({})
    setFilter('all')
  }, [localChanges])

  const shiftDate = useCallback((delta) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    handleDateChange(toISO(d))
  }, [selectedDate, handleDateChange])

  // ─── Объединение данных ───────────────────────────────────────────────────
  const combinedData = useMemo(() => students.map(student => {
    const records = attendance.filter(a => a.student_id === student.id)
    const current = records.find(a => a.date?.split('T')[0] === selectedDate)
    const status = localChanges[student.id] ?? (current?.status ?? 'absent')
    return {
      ...student,
      student_id: student.id,
      student_name: student.fullname || student.name,
      course_title: student.course || 'Backend',
      status,
      isEdited: localChanges[student.id] != null,
      updated_at: current?.updated_at || current?.date || null,
      history: records,
    }
  }), [students, attendance, selectedDate, localChanges])

  const filtered = useMemo(() => combinedData.filter(a => {
    const q = search.toLowerCase()
    const matchQ = !q || a.student_name.toLowerCase().includes(q)
    const matchF = filter === 'all' || a.status === filter
    const matchC = courseFilter === 'all' || a.course_title === courseFilter
    return matchQ && matchF && matchC
  }), [combinedData, filter, search, courseFilter])

  // ─── Статистика — считается от всей группы (с учётом курса) ──────────────
  const stats = useMemo(() => {
    const base = combinedData.filter(a =>
      courseFilter === 'all' || a.course_title === courseFilter
    )
    const total = base.length
    const present = base.filter(a => a.status === 'present').length
    const excused = base.filter(a => a.status === 'excused').length
    const absent = base.filter(a => a.status === 'absent').length
    const efficiency = total > 0 ? Math.round(((present + excused) / total) * 100) : 0
    return { total, present, excused, absent, efficiency }
  }, [combinedData, courseFilter])

  // ─── Сохранение ───────────────────────────────────────────────────────────
const handleSaveAll = async () => {
  if (isSaving) return;
  setIsSaving(true);
  try {
    const promises = Object.entries(localChanges).map(([studentId, stat]) => {
      const sid = parseInt(studentId, 10);

      // Находим студента, чтобы вытащить его course_id
      const student = students.find(s => s.id === sid);

      // ВНИМАНИЕ: Если у тебя в student.id_course или student.course_id
      // лежит ID, используй его. Если там строка "Python", это может быть причиной 422.
      const payload = {
        student_id: sid,
        course_id: student?.course_id || 1, // Поставь 1 для теста
        status: stat,
        date: selectedDate
      };

      console.log("Отправка в API:", payload);
      return api.markAttendance(payload);
    });

    await Promise.all(promises);
    showToast("Данные успешно созданы!");
    setLocalChanges({});
    await load();
  } catch (err) {
    console.error("Детали ошибки:", err);
    showToast("Ошибка 422: проверь типы данных", "error");
  } finally {
    setIsSaving(false);
  }
};

  // ─── Массовое выделение ───────────────────────────────────────────────────
  const handleMarkAll = useCallback((status) => {
    const changes = {}
    filtered.forEach(a => { changes[a.student_id] = status })
    setLocalChanges(prev => ({ ...prev, ...changes }))
    setSelectAll(status)
    setTimeout(() => setSelectAll(null), 1200)
  }, [filtered])

  // ─── Изменение статуса одного ─────────────────────────────────────────────
  const handleStatusChange = useCallback((studentId, status) => {
    setLocalChanges(p => ({ ...p, [studentId]: status }))
    setActiveMenu(null)
  }, [])

  // ─── Навигация по календарю ───────────────────────────────────────────────
  const shiftMonth = useCallback((delta) => {
    setViewDate(prev => {
      const d = new Date(prev)
      d.setMonth(d.getMonth() + delta)
      return d
    })
  }, [])

  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()
    return Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) => i + 1)
  }, [viewDate])

  // ─── Экспорт CSV ──────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rows = [['Студент', 'Курс', 'Статус', 'Дата']]
    combinedData.forEach(a => {
      rows.push([a.student_name, a.course_title, a.status, selectedDate])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `attendance_${selectedDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showToast('Экспорт завершён')
  }, [combinedData, selectedDate, showToast])

  // ─── Форматирование даты заголовка ────────────────────────────────────────
  const dateLabel = useMemo(() => {
    const d = new Date(selectedDate + 'T00:00:00')
    if (selectedDate === todayStr) return 'Сегодня'
    return d.toLocaleDateString('ru', { weekday: 'long', day: 'numeric', month: 'long' })
  }, [selectedDate, todayStr])

  const hasChanges = Object.keys(localChanges).length > 0

  // ─── Рендер ───────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-[1200px] animate-fade-in relative text-white pb-28">
      <ToastContainer toasts={toasts} />

      {/* Заголовок + дата + быстрые действия */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <PageHeader tag="Журнал" title="Посещаемость" />
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={e => handleDateChange(e.target.value)}
              className="bg-transparent text-sm font-semibold outline-none text-white/70 cursor-pointer hover:text-white transition-colors"
            />
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            {selectedDate !== todayStr && (
              <button
                onClick={() => handleDateChange(todayStr)}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <Target size={12} /> Сегодня
              </button>
            )}
            <span className="text-white/30 text-sm capitalize">{dateLabel}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/70 hover:text-white"
          >
            <Download size={15} /> Экспорт
          </button>
          <button
            onClick={() => handleMarkAll('present')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
              selectAll === 'present'
                ? 'bg-success border-success text-white'
                : 'bg-success/10 border-success/30 text-success hover:bg-success/20'
            }`}
          >
            <CheckSquare size={15} /> Все присутствуют
          </button>
        </div>
      </div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="relative overflow-hidden card p-5 bg-slate-900 border border-white/10 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-widest">
            <TrendingUp size={12} /> Посещаемость
          </div>
          <div className={`text-3xl font-black tabular-nums ${stats.efficiency >= 80 ? 'text-success' : stats.efficiency >= 60 ? 'text-warning' : 'text-danger'}`}>
            {stats.efficiency}<span className="text-lg">%</span>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div
              className={`h-full transition-all duration-700 ${stats.efficiency >= 80 ? 'bg-success' : stats.efficiency >= 60 ? 'bg-warning' : 'bg-danger'}`}
              style={{ width: `${stats.efficiency}%` }}
            />
          </div>
        </div>

        {[
          { label: 'Присутствует', value: stats.present, color: 'success', icon: Check },
          { label: 'Уважительная', value: stats.excused, color: 'warning', icon: AlertCircle },
          { label: 'Отсутствует', value: stats.absent, color: 'danger', icon: X },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            onClick={() => setFilter(prev => prev === label.toLowerCase() ? 'all' :
              color === 'success' ? 'present' : color === 'warning' ? 'excused' : 'absent')}
            className={`card p-5 border-l-4 cursor-pointer transition-all hover:scale-[1.02] border-${color} bg-${color}/10`}
          >
            <div className={`flex items-center gap-1.5 text-${color} text-xs font-semibold uppercase mb-2`}>
              <Icon size={12} /> {label}
            </div>
            <div className="text-3xl font-black text-white tabular-nums">{value}</div>
            <div className="text-xs text-white/30 mt-1">
              {stats.total > 0 ? Math.round((value / stats.total) * 100) : 0}% от группы
            </div>
          </div>
        ))}
      </div>

      {/* Панель фильтров */}
      <div className="flex gap-3 mb-5 items-center flex-wrap">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск студента..."
            className="input-field pl-9 w-full bg-slate-900 text-white border-white/10 text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="input-field w-auto bg-slate-900 border-white/10 text-white text-sm font-semibold outline-none focus:border-primary/50"
        >
          <option value="all" className="bg-slate-900 text-white">Все курсы</option>
          {courseTitles.map(c => (
            <option 
              key={c.value}
              value={c.value}
              className="bg-slate-900 text-white" // Фикс для выпадающего списка
            >
              {c.label}
            </option>
          ))}
        </select>
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Все' },
            { value: 'present', label: 'Присутствует' },
            { value: 'absent', label: 'Отсутствует' },
            { value: 'excused', label: 'Уважительная' },
          ]}
        />

        {(filter !== 'all' || courseFilter !== 'all' || search) && (
          <button
            onClick={() => { setFilter('all'); setCourseFilter('all'); setSearch('') }}
            className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
          >
            <X size={12} /> Сбросить
          </button>
        )}
      </div>

      {/* Таблица */}
      <div className="card overflow-visible border-white/10 bg-slate-900/50 backdrop-blur-md shadow-2xl">
        {loading ? (
          <div className="p-20 flex justify-center">
            <Spinner className="w-10 h-10 text-primary" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-xs font-semibold uppercase tracking-widest text-white/40">
                <th className="py-4 pl-6">
                  <div className="flex items-center gap-2">
                    <Users size={12} /> Студент
                    {filtered.length !== combinedData.length && (
                      <span className="text-primary font-bold">({filtered.length})</span>
                    )}
                  </div>
                </th>
                <th>Курс</th>
                <th>Статус</th>
                <th className="text-right pr-6">Время / История</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 text-center text-white/30 text-sm">
                    <Search size={28} className="mx-auto mb-3 opacity-30" />
                    Студенты не найдены
                  </td>
                </tr>
              ) : (
                filtered.map(a => (
                  <StudentRow
                    key={a.student_id}
                    student={a}
                    activeMenu={activeMenu}
                    activeHistory={activeHistory}
                    viewDate={viewDate}
                    calendarDays={calendarDays}
                    selectedDate={selectedDate}
                    onMenuToggle={id => setActiveMenu(prev => prev === id ? null : id)}
                    onHistoryToggle={id => {
                      setActiveHistory(prev => prev === id ? null : id)
                      setViewDate(new Date())
                    }}
                    onStatusChange={handleStatusChange}
                    onMonthShift={shiftMonth}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Floating save bar */}
      {hasChanges && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[50] flex items-center gap-4 bg-slate-800 border border-white/20 px-6 py-3 rounded-2xl shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-4 duration-300">
          <div className="text-sm text-white/60">
            Изменено: <span className="text-white font-bold">{Object.keys(localChanges).length}</span> студентов
          </div>
          <div className="w-px h-5 bg-white/10" />
          <button
            onClick={() => { setLocalChanges({}); showToast('Изменения отменены', 'error') }}
            className="text-sm text-white/40 hover:text-white transition-colors"
          >
            Отмена
          </button>
          <button
            ref={saveRef}
            onClick={handleSaveAll}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold disabled:opacity-50 transition-all hover:bg-primary/90 active:scale-95"
          >
            {isSaving ? <Spinner size="sm" /> : <Save size={16} />}
            Сохранить
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Строка студента (вынесена для чистоты) ───────────────────────────────────
function StudentRow({
  student: a,
  activeMenu, activeHistory, viewDate, calendarDays, selectedDate,
  onMenuToggle, onHistoryToggle, onStatusChange, onMonthShift
}) {
  const STATUS_OPTIONS = [
    { id: 'present', label: 'Присутствует', icon: Check, color: 'text-success' },
    { id: 'absent', label: 'Отсутствует', icon: X, color: 'text-danger' },
    { id: 'excused', label: 'Уважительная', icon: AlertCircle, color: 'text-warning' },
  ]

  return (
    <tr className="hover:bg-white/[0.03] transition-colors border-b border-white/5 group">
      {/* Студент */}
      <td className="py-3.5 pl-6">
        <div className="flex items-center gap-3">
          <Avatar
            name={a.student_name}
            color={getCourseColor(a.course_title)}
            size="md"
            className="ring-2 ring-white/5 flex-shrink-0"
          />
          <div>
            <div className={`text-sm font-semibold ${a.isEdited ? 'text-primary' : 'text-white'}`}>
              {a.student_name}
              {a.isEdited && (
                <span className="ml-2 inline-flex items-center gap-1 text-[10px] text-primary/70 font-normal">
                  <Zap size={9} /> изменено
                </span>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Курс */}
      <td>
        <Badge variant="outline" className="text-xs border-white/20 text-white/60">
          {a.course_title}
        </Badge>
      </td>

      {/* Статус */}
      <td className="relative py-2">
        <button
          onClick={e => { e.stopPropagation(); onMenuToggle(a.student_id) }}
          className="active:scale-95 transition-transform outline-none"
        >
          <Badge
            type={a.status}
            className="w-40 justify-center py-1.5 text-xs font-semibold text-white"
          >
            {a.status === 'present' ? 'Присутствует' : a.status === 'absent' ? 'Отсутствует' : 'Уважительная'}
          </Badge>
        </button>

        {activeMenu === a.student_id && (
          <div
            className="absolute top-full left-0 mt-2 w-48 bg-slate-800 border border-white/20 rounded-2xl shadow-2xl z-[100] p-1.5 animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {STATUS_OPTIONS.map(opt => (
              <button
                key={opt.id}
                onClick={() => onStatusChange(a.student_id, opt.id)}
                className={`flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white/10 rounded-xl text-sm font-medium text-white transition-colors ${a.status === opt.id ? 'bg-white/10' : ''}`}
              >
                <opt.icon size={15} className={opt.color} />
                {opt.label}
                {a.status === opt.id && <Check size={12} className="ml-auto text-white/40" />}
              </button>
            ))}
          </div>
        )}
      </td>

      {/* Время + История */}
      <td className="text-right pr-6 relative">
        <div className="flex items-center justify-end gap-4">
          <div className="text-xs text-white/30 flex items-center gap-1.5 tabular-nums">
            <Clock size={11} />
            {a.updated_at
              ? new Date(a.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '--:--'}
          </div>

          <div className="relative">
            <button
              onClick={e => { e.stopPropagation(); onHistoryToggle(a.student_id) }}
              className={`p-2 rounded-xl transition-all border ${
                activeHistory === a.student_id
                  ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30'
                  : 'hover:bg-white/10 text-white/40 border-white/10 hover:text-white'
              }`}
            >
              <Calendar size={16} />
            </button>

            {activeHistory === a.student_id && (
              <div
                className="absolute bottom-full right-0 mb-3 w-68 bg-slate-900 border border-white/15 rounded-2xl shadow-2xl z-[100] p-4 animate-in slide-in-from-bottom-3 duration-200"
                style={{ width: '280px' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Навигация по месяцу */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    onClick={() => onMonthShift(-1)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-semibold uppercase tracking-widest text-white capitalize">
                    {viewDate.toLocaleString('ru', { month: 'long', year: 'numeric' })}
                  </span>
                  <button
                    onClick={() => onMonthShift(1)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* Дни недели */}
                <div className="grid grid-cols-7 gap-1 mb-1">
                  {['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => (
                    <div key={d} className="text-center text-[10px] font-semibold text-white/25 py-1">{d}</div>
                  ))}
                </div>

                {/* Дни */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map(day => {
                    const dayDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                    const dayStr = toISO(dayDate)
                    const rec = a.history.find(h => h.date?.split('T')[0] === dayStr)
                    const isToday = dayStr === toISO(new Date())
                    const isSelected = dayStr === selectedDate

                    return (
                      <div
                        key={day}
                        className={`
                          h-8 w-full rounded-lg text-[11px] flex items-center justify-center font-semibold transition-all
                          ${rec?.status === 'present' ? 'bg-success/80 text-white' :
                            rec?.status === 'excused' ? 'bg-warning/80 text-white' :
                            rec?.status === 'absent' ? 'bg-danger/20 text-danger/80' :
                            'bg-white/[0.04] text-white/20'}
                          ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-slate-900' : ''}
                          ${isToday && !isSelected ? 'ring-1 ring-white/30' : ''}
                        `}
                        title={rec ? `${day}: ${rec.status}` : undefined}
                      >
                        {day}
                      </div>
                    )
                  })}
                </div>

                {/* Легенда */}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                  {[
                    { color: 'bg-success/80', label: 'Был' },
                    { color: 'bg-warning/80', label: 'Причина' },
                    { color: 'bg-danger/20', label: 'Нет' },
                  ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-[10px] text-white/40">
                      <span className={`w-2.5 h-2.5 rounded-sm ${color}`} />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}
