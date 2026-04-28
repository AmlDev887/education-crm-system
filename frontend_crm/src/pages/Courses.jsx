import { useState, useEffect } from 'react'
import { Users, Clock, DollarSign, Plus, BookOpen, RefreshCw } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, Button, FilterTabs, PageHeader, Spinner, Empty } from '@/components/ui'

function fmtUZS(val) {
  if (!val) return '0 UZS'
  return new Intl.NumberFormat('uz-UZ').format(val) + ' UZS'
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [error, setError] = useState(null)

  const loadCourses = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getCourses()
      setCourses(data)
    } catch (err) {
      console.error('Ошибка при загрузке курсов:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  // Курс считается active если у него есть студенты, upcoming — если нет
  // Так как бэкенд не возвращает поле status — определяем сами
  const enriched = courses.map(c => ({
    ...c,
    studentCount: c.students?.length ?? 0,
    status: c.status || (c.students?.length > 0 ? 'active' : 'upcoming'),
    color: c.color || courseColor(c.id),
  }))

  const filtered = enriched.filter(c => filter === 'all' || c.status === filter)

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Catalog" title="Courses">
        <Button variant="ghost" onClick={loadCourses} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
      </PageHeader>

      {/* Summary bar */}
      <div className="flex gap-4 mb-6">
        <div className="card flex-1 p-4 flex items-center gap-3">
          <BookOpen size={16} className="text-accent" />
          <div>
            <div className="label">Total Courses</div>
            <div className="text-xl font-bold font-mono">{courses.length}</div>
          </div>
        </div>
        <div className="card flex-1 p-4 flex items-center gap-3">
          <Users size={16} style={{ color: '#10b981' }} />
          <div>
            <div className="label">Total Students</div>
            <div className="text-xl font-bold font-mono" style={{ color: '#10b981' }}>
              {enriched.reduce((a, c) => a + c.studentCount, 0)}
            </div>
          </div>
        </div>
        <div className="card flex-1 p-4 flex items-center gap-3">
          <DollarSign size={16} style={{ color: '#f59e0b' }} />
          <div>
            <div className="label">Avg Price</div>
            <div className="text-xl font-bold font-mono" style={{ color: '#f59e0b' }}>
              {courses.length
                ? ((courses.reduce((a, c) => a + (c.price || 0), 0) / courses.length) / 1_000_000).toFixed(1) + 'M'
                : '0M'}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: `All (${enriched.length})` },
            { value: 'active', label: `Active (${enriched.filter(c => c.status === 'active').length})` },
            { value: 'upcoming', label: `Upcoming (${enriched.filter(c => c.status === 'upcoming').length})` },
          ]}
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger font-mono">
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Empty message="No courses found in database" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <CourseCard key={c.id} course={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function CourseCard({ course: c }) {
  const MAX_CAPACITY = 30
  const pct = Math.min(((c.studentCount) / MAX_CAPACITY) * 100, 100)

  const statusMap = {
    active: 'Активен',
    upcoming: 'В наборе'
  }

  return (
    <div className="card card-hover cursor-pointer overflow-hidden group" style={{ '--hover-border': c.color }}>
      <div className="h-[3px]" style={{ background: c.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-mono text-txt-dim uppercase tracking-widest mb-1.5">
              НАПРАВЛЕНИЕ
            </div>
            <h3 className="font-semibold text-base leading-tight truncate">{c.title}</h3>
            {/* Если в описании кракозябры, мы можем временно выводить заглушку */}
            <div className="text-xs text-txt-muted mt-1 line-clamp-2">
              {c.description && !c.description.includes('') ? c.description : 'Описание курса в разработке...'}
            </div>
            <div className="text-xs text-txt-muted mt-1">Преподаватель: {c.instructor || 'Сотрудник'}</div>
          </div>
          <Badge type={c.status}>{statusMap[c.status] || 'Новый'}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
          <div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-txt-dim uppercase mb-1">
              <Users size={9} /> Студенты
            </div>
            <div className="text-xl font-bold" style={{ color: c.color }}>
              {c.studentCount}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-txt-dim uppercase mb-1">
              <Clock size={9} /> Длительность
            </div>
            <div className="text-xs font-medium text-txt mt-1">
              {c.duration ? `${c.duration} мес.` : '—'}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-[9px] font-mono text-txt-dim uppercase mb-1">
              <DollarSign size={9} /> Цена
            </div>
            <div className="text-[11px] font-mono text-txt-muted mt-1 leading-tight">
              {c.price ? (c.price / 1_000_000).toFixed(1) + 'М' : '0М'} сум
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-[10px] font-mono text-txt-dim mb-1.5">
            <span>Заполненность группы</span>
            <span>
              {c.studentCount}/{MAX_CAPACITY}
              {pct >= 90 && <span className="text-danger ml-1">· Мест нет</span>}
            </span>
          </div>
          <div className="h-1.5 bg-bg-4 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: pct >= 90 ? '#f43f5e' : pct >= 70 ? '#f59e0b' : c.color,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Генерируем цвет по id курса если бэкенд не возвращает color
function courseColor(id) {
  const COLORS = ['#7c3aed', '#38bdf8', '#10b981', '#f59e0b', '#f43f5e', '#6366f1', '#ec4899']
  return COLORS[(id - 1) % COLORS.length]
}
