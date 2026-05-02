import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  Plus, Search, Pencil, Trash2, UserPlus,
  CheckCircle2, XCircle, X, Users, TrendingUp,
  GraduationCap, AlertCircle, Download, Filter,
  ChevronUp, ChevronDown, Mail, Phone
} from 'lucide-react'
import { api } from '@/api/client'
import toast from 'react-hot-toast'
import {
  Avatar, Badge, Button, Modal, Input, Select,
  FilterTabs, PageHeader, Empty, Spinner,
  getCourseColor
} from '@/components/ui'

// ─── Константы ────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  age: 18,
  course: '',
  status: 'unpaid',
  is_active: true,
  enrolled: new Date().toISOString().slice(0, 10),
}

const STATUS_LABELS = { paid: 'Оплачено', unpaid: 'Не оплачено' }

// ─── Валидация ────────────────────────────────────────────────────────────────
function validate(form) {
  const e = {}
  if (!form.name.trim())              e.name   = 'Введите имя'
  if (!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email  = 'Неверный email'
  if (!form.course)                   e.course = 'Выберите курс'
  if (form.age < 3 || form.age > 110) e.age   = 'Возраст: 3–110'
  return e
}

// ─── Модалка добавления/редактирования ───────────────────────────────────────
function StudentModal({ student, onClose, onSave, courseTitles }) {
  const isEdit = !!student
  const [form, setForm] = useState(() => student ? {
    name:     student.fullname || student.name || '',
    email:    student.email    || '',
    phone:    student.phone    || '',
    age:      student.age      || 18,
    course:   student.course   || '',
    status:   student.status   || 'unpaid',
    is_active: student.is_active ?? true,
    enrolled: student.date_rage
      ? student.date_rage.split('T')[0]
      : new Date().toISOString().slice(0, 10),
  } : { ...EMPTY_FORM })

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  const handle = useCallback(e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    setErrors(p => ({ ...p, [name]: '' }))
  }, [])

  const submit = async () => {
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setSaving(true)
    const payload = {
      fullname:           form.name.trim(),
      email:              form.email.trim(),
      phone:              form.phone  || '',
      age:                parseInt(form.age, 10),
      course:             form.course,
      status:             form.status,
      is_active:          form.is_active,
      last_payment_date:  new Date().toISOString(),
      date_rage:          new Date(form.enrolled).toISOString(),
    }
    try {
      if (isEdit) {
        await api.updateStudent(student.id, payload)
        toast.success('Студент обновлён')
      } else {
        await api.addStudent(payload)
        toast.success('Студент добавлен')
      }
      onSave()
    } catch (err) {
      toast.error(err?.message || 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  // Закрытие по Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <Modal
      title={isEdit ? 'Редактировать студента' : 'Добавить студента'}
      onClose={onClose}
    >
      <div className="flex flex-col gap-5">

        {/* Аватар-превью */}
        {form.name && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
            <Avatar name={form.name} color={getCourseColor(form.course)} size="md" />
            <div>
              <div className="text-sm font-semibold text-white">{form.name}</div>
              <div className="text-xs text-white/40">{form.course || 'Курс не выбран'}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              ref={firstRef}
              label="Полное имя"
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="напр. Айша Каримова"
              required
              error={errors.name}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handle}
            placeholder="student@example.com"
            required
            error={errors.email}
          />

          <Input
            label="Возраст"
            name="age"
            type="number"
            value={form.age}
            onChange={handle}
            min="3"
            max="110"
            error={errors.age}
          />

          <Input
            label="Телефон"
            name="phone"
            value={form.phone}
            onChange={handle}
            placeholder="+998 90 123 4567"
          />

          <Input
            label="Дата зачисления"
            name="enrolled"
            type="date"
            value={form.enrolled}
            onChange={handle}
          />

          <Select
            label="Курс"
            name="course"
            value={form.course}
            onChange={handle}
            options={courseTitles}
            placeholder="Выберите курс..."
            required
            error={errors.course}
          />

          <Select
            label="Оплата"
            name="status"
            value={form.status}
            onChange={handle}
            options={[
              { value: 'paid',   label: 'Оплачено' },
              { value: 'unpaid', label: 'Не оплачено' },
            ]}
          />

          {/* Активность */}
          <div className="col-span-2">
            <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition-colors">
              <input
                type="checkbox"
                name="is_active"
                checked={form.is_active}
                onChange={handle}
                className="w-4 h-4 accent-primary"
              />
              <div>
                <div className="text-sm font-medium text-white">Студент активен</div>
                <div className="text-xs text-white/40">Отображается в журнале посещаемости</div>
              </div>
              <span className={`ml-auto text-xs font-semibold px-2 py-1 rounded-lg ${form.is_active ? 'bg-success/20 text-success' : 'bg-white/10 text-white/40'}`}>
                {form.is_active ? 'Активен' : 'Неактивен'}
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>Отмена</Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Spinner size="sm" /> : <UserPlus size={14} />}
            {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

// ─── Модалка удаления ────────────────────────────────────────────────────────
function DeleteConfirm({ student, onClose, onConfirm, loading }) {
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <Modal title="Удалить студента" onClose={onClose} width="max-w-sm">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-xl bg-danger/10 text-danger flex-shrink-0">
          <AlertCircle size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white mb-1">
            Удалить{' '}
            <span className="text-danger">{student.fullname || student.name}</span>?
          </p>
          <p className="text-xs text-white/40">
            Это действие необратимо. Все записи посещаемости и платежей студента будут удалены.
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>Отмена</Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? <Spinner size="sm" /> : <Trash2 size={13} />}
          Удалить
        </Button>
      </div>
    </Modal>
  )
}

// ─── Строка таблицы ───────────────────────────────────────────────────────────
function StudentRow({ student: s, onEdit, onDelete }) {
  return (
    <tr className="border-b border-white/5 hover:bg-white/[0.03] transition-colors group">

      {/* Студент */}
      <td className="py-3.5 pl-6">
        <div className="flex items-center gap-3">
          <Avatar
            name={s.fullname || s.name}
            color={getCourseColor(s.course)}
            size="md"
            className="ring-2 ring-white/5 flex-shrink-0"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              {s.fullname || s.name}
              {s.is_active
                ? <CheckCircle2 size={12} className="text-success" />
                : <XCircle    size={12} className="text-white/25" />}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-[11px] text-white/35 flex items-center gap-1">
                <Mail size={9} />{s.email}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Возраст */}
      <td className="px-4 text-sm text-white/50 tabular-nums text-center">
        {s.age || '—'}
      </td>

      {/* Курс */}
      <td className="px-4">
        <Badge variant="outline" className="text-xs border-white/15 text-white/60">
          {s.course || '—'}
        </Badge>
      </td>

      {/* Телефон */}
      <td className="px-4">
        <span className="text-xs font-mono text-white/40 flex items-center gap-1.5">
          {s.phone
            ? <><Phone size={10} />{s.phone}</>
            : <span className="text-white/20">—</span>}
        </span>
      </td>

      {/* Статус оплаты */}
      <td className="px-4">
        <Badge type={s.status} className="text-xs font-semibold">
          {STATUS_LABELS[s.status] || s.status}
        </Badge>
      </td>

      {/* Действия */}
      <td className="pr-6 text-right">
        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(s)}
            className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
            title="Редактировать"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(s)}
            className="p-2 rounded-lg hover:bg-danger/15 text-white/40 hover:text-danger transition-colors"
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function Students() {
  const [students,     setStudents]     = useState([])
  const [courseTitles, setCourseTitles] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [deleting,     setDeleting]     = useState(false)

  const [search,       setSearch]       = useState('')
  const [filter,       setFilter]       = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all') // all | active | inactive

  const [sortKey,      setSortKey]      = useState('name')
  const [sortDir,      setSortDir]      = useState('asc')

  const [modal,        setModal]        = useState(null) // null | 'add' | 'edit' | 'delete'
  const [selected,     setSelected]     = useState(null)

  // ─── Загрузка ───────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sData, cData] = await Promise.all([api.getStudents(), api.getCourses()])
      setStudents(sData)
      if (Array.isArray(cData)) {
        setCourseTitles(cData.map(c => ({
          value: typeof c === 'object' ? c.title : c,
          label: typeof c === 'object' ? c.title : c,
        })))
      }
    } catch (err) {
      console.error(err)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // ─── Статистика ─────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = students.length
    const paid     = students.filter(s => s.status === 'paid').length
    const active   = students.filter(s => s.is_active).length
    const unpaid   = students.filter(s => s.status === 'unpaid').length
    return { total, paid, active, unpaid }
  }, [students])

  // ─── Фильтрация + сортировка ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = students.filter(s => {
      const q    = search.toLowerCase()
      const name = (s.fullname || s.name || '').toLowerCase()
      const matchQ = !q || name.includes(q) || (s.email || '').toLowerCase().includes(q) || (s.phone || '').includes(q)
      const matchF = filter       === 'all' || s.status   === filter
      const matchC = courseFilter === 'all' || s.course   === courseFilter
      const matchA = activeFilter === 'all'
        || (activeFilter === 'active'   &&  s.is_active)
        || (activeFilter === 'inactive' && !s.is_active)
      return matchQ && matchF && matchC && matchA
    })

    list = [...list].sort((a, b) => {
      let va = '', vb = ''
      if (sortKey === 'name')   { va = (a.fullname || a.name || '').toLowerCase(); vb = (b.fullname || b.name || '').toLowerCase() }
      if (sortKey === 'age')    { va = a.age || 0; vb = b.age || 0 }
      if (sortKey === 'course') { va = a.course || ''; vb = b.course || '' }
      if (va < vb) return sortDir === 'asc' ? -1 :  1
      if (va > vb) return sortDir === 'asc' ?  1 : -1
      return 0
    })

    return list
  }, [students, search, filter, courseFilter, activeFilter, sortKey, sortDir])

  // ─── Сортировка по клику на заголовок ───────────────────────────────────────
  const handleSort = useCallback(key => {
    setSortKey(prev => {
      if (prev === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return key }
      setSortDir('asc'); return key
    })
  }, [])

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="opacity-20" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-primary" /> : <ChevronDown size={12} className="text-primary" />
  }

  // ─── Экшены ─────────────────────────────────────────────────────────────────
  const openAdd    = ()  => { setSelected(null); setModal('add') }
  const openEdit   = s   => { setSelected(s);    setModal('edit') }
  const openDelete = s   => { setSelected(s);    setModal('delete') }
  const closeModal = ()  => { setModal(null); setSelected(null) }
  const handleSave = ()  => { closeModal(); load() }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.deleteStudent(selected.id)
      toast.success('Студент удалён')
      closeModal()
      load()
    } catch (err) {
      toast.error('Ошибка удаления')
    } finally {
      setDeleting(false)
    }
  }

  // ─── Экспорт CSV ────────────────────────────────────────────────────────────
  const handleExport = useCallback(() => {
    const rows = [['Имя', 'Email', 'Телефон', 'Возраст', 'Курс', 'Статус', 'Активен']]
    filtered.forEach(s => rows.push([
      s.fullname || s.name, s.email, s.phone, s.age,
      s.course, s.status, s.is_active ? 'Да' : 'Нет'
    ]))
    const csv  = rows.map(r => r.map(v => `"${v ?? ''}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = `students_${new Date().toISOString().slice(0,10)}.csv`
    a.click(); URL.revokeObjectURL(url)
    toast.success('Экспорт завершён')
  }, [filtered])

  const hasFilters = filter !== 'all' || courseFilter !== 'all' || search || activeFilter !== 'all'

  // ─── Рендер ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 md:p-8 max-w-[1200px] animate-fade-in text-white">

      {/* Заголовок */}
      <PageHeader tag="Записи" title="Студенты">
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 hover:text-white"
          >
            <Download size={14} /> Экспорт
          </button>
          <Button onClick={openAdd}>
            <Plus size={14} /> Добавить студента
          </Button>
        </div>
      </PageHeader>

      {/* Статистика — кликабельная */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Всего студентов', value: stats.total,  icon: Users,         color: '',        key: null },
          { label: 'Активных',        value: stats.active, icon: CheckCircle2,  color: 'success', key: 'active' },
          { label: 'Оплатили',        value: stats.paid,   icon: GraduationCap, color: 'success', key: 'paid' },
          { label: 'Не оплатили',     value: stats.unpaid, icon: AlertCircle,   color: 'danger',  key: 'unpaid' },
        ].map(({ label, value, icon: Icon, color, key }) => (
          <div
            key={label}
            onClick={() => {
              if (!key) return
              if (key === 'active') setActiveFilter(p => p === 'active' ? 'all' : 'active')
              else setFilter(p => p === key ? 'all' : key)
            }}
            className={`card p-5 bg-slate-900 border border-white/10 transition-all
              ${key ? 'cursor-pointer hover:border-white/20 hover:scale-[1.02]' : ''}
              ${(key === 'active' && activeFilter === 'active') || (key && filter === key) ? 'border-primary/50 bg-primary/5' : ''}
            `}
          >
            <div className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-2 ${color ? `text-${color}` : 'text-white/40'}`}>
              <Icon size={12} /> {label}
            </div>
            <div className="text-3xl font-black text-white tabular-nums">{value}</div>
            {stats.total > 0 && key && (
              <div className="text-xs text-white/30 mt-1">
                {Math.round((value / stats.total) * 100)}% от всех
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Фильтры */}
      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по имени, email, телефону..."
            className="input-field pl-9 w-full bg-slate-900 text-white border-white/10 text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all',    label: 'Все' },
            { value: 'paid',   label: 'Оплачено' },
            { value: 'unpaid', label: 'Долг' },
          ]}
        />

        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="input-field w-auto bg-slate-900 border-white/10 text-white text-sm font-semibold cursor-pointer outline-none focus:border-primary/50"
        >
          <option value="all" className="bg-slate-900 text-white">Все курсы</option>
          {courseTitles.map(c => (
            <option
              key={c.value}
              value={c.value}
              className="bg-slate-900 text-white" // Явно задаем фон для выпадающего списка
            >
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={activeFilter}
          onChange={e => setActiveFilter(e.target.value)}
          className="input-field w-auto bg-slate-900 border-white/10 text-white text-sm font-semibold cursor-pointer outline-none focus:border-primary/50"
        >
          <option value="all" className="bg-slate-900 text-white">Все статусы</option>
          <option value="active" className="bg-slate-900 text-white">Активные</option>
          <option value="inactive" className="bg-slate-900 text-white">Неактивные</option>
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(''); setFilter('all'); setCourseFilter('all'); setActiveFilter('all') }}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors px-3 py-2 rounded-xl border border-white/10 hover:bg-white/5"
          >
            <X size={12} /> Сбросить
          </button>
        )}

        {filtered.length !== students.length && (
          <span className="text-xs text-white/30">
            Показано: <span className="text-white font-semibold">{filtered.length}</span> из {students.length}
          </span>
        )}
      </div>

      {/* Таблица */}
      <div className="card overflow-visible border-white/10 bg-slate-900/50 backdrop-blur-md shadow-2xl">
        {loading ? (
          <div className="p-16 flex justify-center">
            <Spinner className="w-10 h-10 text-primary" />
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr className="text-xs font-semibold uppercase tracking-widest text-white/40">
                <th
                  className="py-4 pl-6 cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-1.5">
                    Студент <SortIcon col="name" />
                  </div>
                </th>
                <th
                  className="px-4 text-center cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    Возраст <SortIcon col="age" />
                  </div>
                </th>
                <th
                  className="px-4 cursor-pointer hover:text-white transition-colors select-none"
                  onClick={() => handleSort('course')}
                >
                  <div className="flex items-center gap-1.5">
                    Курс <SortIcon col="course" />
                  </div>
                </th>
                <th className="px-4">Телефон</th>
                <th className="px-4">Оплата</th>
                <th className="pr-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="py-16 flex flex-col items-center gap-3 text-white/30">
                      <Filter size={28} className="opacity-40" />
                      <span className="text-sm">
                        {search || hasFilters ? 'Студенты не найдены' : 'Нет студентов'}
                      </span>
                      {hasFilters && (
                        <button
                          onClick={() => { setSearch(''); setFilter('all'); setCourseFilter('all'); setActiveFilter('all') }}
                          className="text-xs text-primary hover:underline"
                        >
                          Сбросить фильтры
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(s => (
                  <StudentRow
                    key={s.id}
                    student={s}
                    onEdit={openEdit}
                    onDelete={openDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Модалки */}
      {modal === 'add' && (
        <StudentModal
          courseTitles={courseTitles}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {modal === 'edit' && selected && (
        <StudentModal
          student={selected}
          courseTitles={courseTitles}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
      {modal === 'delete' && selected && (
        <DeleteConfirm
          student={selected}
          onClose={closeModal}
          onConfirm={handleDelete}
          loading={deleting}
        />
      )}
    </div>
  )
}
