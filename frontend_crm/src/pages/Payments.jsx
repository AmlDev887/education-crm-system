import { useState, useEffect, useMemo } from 'react'
import {
  Search, CreditCard, Banknote, ArrowLeftRight,
  RefreshCw, Info, CalendarDays, TrendingUp, Clock, CheckCircle2,
  ChevronUp, ChevronDown, Filter, X
} from 'lucide-react'
import { api } from '@/api/client'
import { Badge, Button, PageHeader, Spinner, Empty, fmtUZS } from '@/components/ui'

// ─── Константы ────────────────────────────────────────────────────────────────

const METHOD_ICON  = { card: CreditCard, cash: Banknote, transfer: ArrowLeftRight }
const METHOD_LABEL = { card: 'Карта', cash: 'Наличные', transfer: 'Перевод' }
const STATUS_LABEL = { paid: 'Оплачено', pending: 'В ожидании', overdue: 'Просрочено' }

// ─── Безопасные хелперы для новых Pydantic-схем ─────────────────────────────

// Вытаскиваем имя студента (поддерживает и объект p.student, и старые плоские поля)
const getStudentName = (p) => {
  if (!p) return '—'
  if (typeof p.student === 'object' && p.student?.fullname) return p.student.fullname
  if (typeof p.student === 'string') return p.student
  return p.studentName || p.student_name || p.fullname || '—'
}

// Вытаскиваем название курса (поддерживает и объект p.course, и старые плоские поля)
const getCourseTitle = (p) => {
  if (!p) return '—'
  if (typeof p.course === 'object' && p.course?.title) return p.course.title
  if (typeof p.course === 'string') return p.course
  return p.course_title || p.courseName || '—'
}

const fmtDate = (val) => {
  if (!val) return '—'
  const d = new Date(val)
  return isNaN(d) ? String(val) : d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// ─── Инфо-баннер ──────────────────────────────────────────────────────────────

function BackendNotice() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null
  return (
    <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-accent/5 border border-accent/20 relative">
      <Info size={14} className="text-accent mt-0.5 flex-shrink-0" />
      <div className="text-xs text-txt-muted pr-6">
        Финансовый модуль работает с обновлёнными Pydantic-схемами бэкенда.
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-txt-muted hover:text-txt transition-colors"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// ─── Карточка статистики ───────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="card flex-1 p-4 flex flex-col gap-2 min-w-[160px]">
      <div className="flex items-center justify-between">
        <span className="label text-xs">{label}</span>
        <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${color}18` }}>
          <Icon size={13} style={{ color }} />
        </div>
      </div>
      <div className="text-xl font-bold font-mono leading-none" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-txt-muted">{sub}</div>}
    </div>
  )
}

// ─── Сортируемый заголовок ────────────────────────────────────────────────────

function SortHeader({ label, field, sort, onSort }) {
  const active = sort.field === field
  return (
    <th
      className="th cursor-pointer select-none group"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className={`transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'}`}>
          {active && sort.dir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </span>
      </div>
    </th>
  )
}

// ─── Основной компонент ───────────────────────────────────────────────────────

export default function Payments() {
  const [payments, setPayments]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [sort, setSort]                 = useState({ field: 'payment_date', dir: 'desc' })
  const [filtersOpen, setFiltersOpen]   = useState(false)

  // ── загрузка ──
  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getPayments()
      setPayments(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  // ── смена статуса ──
  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'paid' ? 'pending' : 'paid'
    try {
      await api.updatePaymentStatus(id, nextStatus)
      // Оптимистичное обновление стейта
      setPayments(prev => prev.map(p =>
        p.id === id ? { ...p, status: nextStatus } : p
      ))
    } catch (err) {
      console.error("Status update failed:", err)
      alert("Не удалось обновить статус: " + err.message)
    }
  }

  // ── сортировка ──
  const handleSort = (field) => {
    setSort(s => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }))
  }

  // ── фильтрация + сортировка ──
  const filtered = useMemo(() => {
    const q    = search.toLowerCase().trim()
    const from = dateFrom ? new Date(dateFrom) : null
    const to   = dateTo   ? new Date(dateTo + 'T23:59:59') : null

    return [...payments]
      .filter(p => {
        const name   = getStudentName(p).toLowerCase()
        const course = getCourseTitle(p).toLowerCase()

        const matchQ = !q || name.includes(q) || course.includes(q)
        const matchS = statusFilter === 'all' || p.status === statusFilter
        const matchM = methodFilter === 'all' || p.method === methodFilter

        let matchD = true
        if (p.payment_date) {
          const d = new Date(p.payment_date)
          if (from && d < from) matchD = false
          if (to   && d > to)   matchD = false
        }
        return matchQ && matchS && matchM && matchD
      })
      .sort((a, b) => {
        let av = a[sort.field]
        let bv = b[sort.field]

        if (sort.field === 'studentName') {
          av = getStudentName(a)
          bv = getStudentName(b)
        } else if (sort.field === 'payment_date') {
          av = new Date(av || 0)
          bv = new Date(bv || 0)
        } else if (sort.field === 'amount') {
          av = +(av || 0)
          bv = +(bv || 0)
        }

        if (av < bv) return sort.dir === 'asc' ? -1 : 1
        if (av > bv) return sort.dir === 'asc' ?  1 : -1
        return 0
      })
  }, [payments, search, statusFilter, methodFilter, dateFrom, dateTo, sort])

  // ── статистика ──
  const totalPaid    = payments.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0)
  const paidCount    = payments.filter(p => p.status === 'paid').length
  const pendingCount = payments.filter(p => p.status === 'pending').length
  const avgAmount    = payments.length
    ? Math.round(payments.reduce((a, p) => a + (p.amount || 0), 0) / payments.length)
    : 0

  const activeFilterCount = [
    statusFilter !== 'all',
    methodFilter !== 'all',
    !!dateFrom,
    !!dateTo,
  ].filter(Boolean).length

  const hasActiveFilters = activeFilterCount > 0

  const resetFilters = () => {
    setStatusFilter('all')
    setMethodFilter('all')
    setDateFrom('')
    setDateTo('')
    setSearch('')
  }

  // ─── Рендер ───────────────────────────────────────────────────────────────

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">

      {/* Шапка */}
      <PageHeader tag="Финансы" title="Платежи">
        <Button variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </PageHeader>

      <BackendNotice />

      {/* Статистика */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <StatCard
          label="Всего собрано"
          value={fmtUZS(totalPaid)}
          icon={TrendingUp}
          color="#10b981"
          sub={`${paidCount} оплаченных транзакций`}
        />
        <StatCard
          label="В ожидании"
          value={pendingCount}
          icon={Clock}
          color="#f59e0b"
          sub="требуют внимания"
        />
        <StatCard
          label="Средний платёж"
          value={fmtUZS(avgAmount)}
          icon={CreditCard}
          color="#6366f1"
          sub="по всем транзакциям"
        />
        <StatCard
          label="Всего транзакций"
          value={payments.length}
          icon={CheckCircle2}
          color="#eae8e3"
        />
      </div>

      {/* Поиск + фильтры */}
      <div className="mb-5 space-y-3">
        <div className="flex gap-3 flex-wrap items-center">

          {/* Поиск */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Поиск по студенту или курсу..."
              className="input-field pl-8 w-full"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Кнопка фильтров */}
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              hasActiveFilters
                ? 'bg-accent/10 border-accent/30 text-accent'
                : 'border-border text-txt-muted hover:text-txt hover:border-txt-muted'
            }`}
          >
            <Filter size={12} />
            Фильтры
            {hasActiveFilters && (
              <span className="w-4 h-4 rounded-full bg-accent text-bg flex items-center justify-center text-[9px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-xs text-txt-muted hover:text-danger transition-colors flex items-center gap-1"
            >
              <X size={11} /> Сбросить всё
            </button>
          )}
        </div>

        {/* Раскрывающаяся панель фильтров */}
        {filtersOpen && (
          <div className="card p-4 flex flex-wrap gap-5 animate-fade-in">

            {/* Статус */}
            <div className="flex flex-col gap-1.5">
              <label className="label text-[10px] uppercase tracking-wider">Статус</label>
              <div className="flex gap-1.5">
                {['all', 'paid', 'pending'].map(v => (
                  <button
                    key={v}
                    onClick={() => setStatusFilter(v)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      statusFilter === v
                        ? 'bg-accent text-bg border-accent'
                        : 'border-border text-txt-muted hover:text-txt'
                    }`}
                  >
                    {v === 'all' ? 'Все' : STATUS_LABEL[v]}
                  </button>
                ))}
              </div>
            </div>

            {/* Метод оплаты */}
            <div className="flex flex-col gap-1.5">
              <label className="label text-[10px] uppercase tracking-wider">Метод оплаты</label>
              <div className="flex gap-1.5">
                {['all', 'card', 'cash', 'transfer'].map(v => {
                  const Icon = METHOD_ICON[v]
                  return (
                    <button
                      key={v}
                      onClick={() => setMethodFilter(v)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                        methodFilter === v
                          ? 'bg-accent text-bg border-accent'
                          : 'border-border text-txt-muted hover:text-txt'
                      }`}
                    >
                      {Icon && <Icon size={11} />}
                      {v === 'all' ? 'Все' : METHOD_LABEL[v]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Диапазон дат */}
            <div className="flex flex-col gap-1.5">
              <label className="label text-[10px] uppercase tracking-wider flex items-center gap-1">
                <CalendarDays size={10} /> Период
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="input-field text-xs py-1.5 w-[140px]"
                />
                <span className="text-txt-muted text-xs">—</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="input-field text-xs py-1.5 w-[140px]"
                />
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Ошибка */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger font-mono flex items-center gap-2">
          <span>⚠</span> Ошибка загрузки: {error}
        </div>
      )}

      {/* Таблица */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <Empty
            icon={Search}
            message={
              payments.length === 0
                ? 'Платежей пока нет.'
                : 'По вашему запросу ничего не найдено. Попробуйте изменить фильтры.'
            }
          />
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-bg-1">
                <tr>
                  <th className="th w-10">#</th>
                  <SortHeader label="Студент" field="studentName" sort={sort} onSort={handleSort} />
                  <th className="th">Курс</th>
                  <SortHeader label="Сумма" field="amount" sort={sort} onSort={handleSort} />
                  <th className="th">Метод</th>
                  <SortHeader label="Дата оплаты" field="payment_date" sort={sort} onSort={handleSort} />
                  <SortHeader label="След. платёж" field="next_payment_date" sort={sort} onSort={handleSort} />
                  <th className="th">Статус</th>
                </tr>
              </thead>
              <tbody>
                  {filtered.map((p, i) => {
                    const MethodIcon  = METHOD_ICON[p.method] || CreditCard
                    const studentName = getStudentName(p)
                    const courseName  = getCourseTitle(p)
                    const dateStr     = fmtDate(p.payment_date)
                    const nextDateStr = fmtDate(p.next_payment_date)

                    return (
                      <tr key={p.id ?? i} className="hover:bg-bg-3 transition-colors border-t border-border/40">
                        <td className="td text-xs text-txt-muted font-mono">{i + 1}</td>

                        <td className="td">
                          <div className="font-medium text-sm leading-tight">{studentName}</div>
                        </td>

                        <td className="td">
                          <div className="text-xs text-txt-muted max-w-[160px] truncate" title={courseName}>
                            {courseName}
                          </div>
                        </td>

                        <td className="td">
                          <span className="text-sm font-mono font-semibold">{fmtUZS(p.amount)}</span>
                        </td>

                        <td className="td">
                          <div className="flex items-center gap-1.5 text-xs text-txt-muted whitespace-nowrap">
                            <MethodIcon size={12} />
                            <span>{METHOD_LABEL[p.method] || p.method || '—'}</span>
                          </div>
                        </td>

                        <td className="td text-xs font-mono text-txt-muted whitespace-nowrap">
                          {dateStr}
                        </td>

                        <td className="td text-xs font-mono whitespace-nowrap">
                          {nextDateStr !== '—' ? (
                            <span className="flex items-center gap-1 text-accent">
                              <CalendarDays size={10} />
                              {nextDateStr}
                            </span>
                          ) : (
                            <span className="text-txt-muted opacity-50">—</span>
                          )}
                        </td>

                        <td className="td">
                          <button
                            onClick={() => toggleStatus(p.id, p.status)}
                            className={`group flex items-center gap-2 px-2.5 py-1.5 rounded-lg border transition-all active:scale-95 ${
                              p.status === 'paid'
                                ? 'bg-success/10 border-success/20 text-success hover:bg-success/20'
                                : 'bg-warning/10 border-warning/20 text-warning hover:bg-warning/20'
                            }`}
                            title="Нажмите, чтобы сменить статус"
                          >
                            <div className="relative w-3.5 h-3.5 flex items-center justify-center">
                               {p.status === 'paid' ? (
                                 <CheckCircle2 size={14} className="text-success" />
                               ) : (
                                 <Clock size={14} className="text-warning" />
                               )}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider">
                              {STATUS_LABEL[p.status] || p.status}
                            </span>
                            <RefreshCw size={10} className="opacity-0 group-hover:opacity-40 transition-opacity ml-0.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
            </table>

            {/* Футер таблицы */}
            <div className="px-4 py-3 bg-bg-1 border-t border-border/60 flex items-center justify-between text-xs text-txt-muted">
              <span>
                Показано{' '}
                <span className="font-mono text-txt">{filtered.length}</span>
                {' '}из{' '}
                <span className="font-mono text-txt">{payments.length}</span>
                {' '}записей
              </span>
              <span className="font-mono">
                Итого по фильтру:{' '}
                <span className="text-success font-semibold">
                  {fmtUZS(filtered.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0))}
                </span>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}