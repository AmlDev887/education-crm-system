import { useState, useEffect } from 'react'
import { Users, Clock, DollarSign, Plus } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, Button, FilterTabs, PageHeader, Spinner, Empty, fmtUZS } from '@/components/ui'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  // Загрузка данных из твоей БД
  const loadCourses = async () => {
    setLoading(true)
    try {
      const data = await api.getCourses()
      setCourses(data)
    } catch (err) {
      console.error("Ошибка при загрузке курсов:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const filtered = courses.filter(c => filter === 'all' || c.status === filter)

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Catalog" title="Courses">
        <Button><Plus size={14} /> New Course</Button>
      </PageHeader>

      <div className="mb-6">
        <FilterTabs value={filter} onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'upcoming', label: 'Upcoming' }
          ]}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : filtered.length === 0 ? (
        <Empty message="No courses found in database" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id}
              className="card card-hover cursor-pointer overflow-hidden group"
              style={{ '--hover-border': c.color || '#6366f1' }}>
              {/* Color accent top bar */}
              <div className="h-[3px]" style={{ background: c.color || '#6366f1' }} />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-[10px] font-mono text-txt-dim uppercase tracking-widest mb-1.5">{c.tag || 'COURSE'}</div>
                    <h3 className="font-semibold text-base leading-tight">{c.title}</h3>
                    <div className="text-xs text-txt-muted mt-1">{c.instructor || 'Staff'}</div>
                  </div>
                  <Badge type={c.status}>{c.status}</Badge>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-txt-dim uppercase mb-1">
                      <Users size={9} /> Students
                    </div>
                    <div className="text-xl font-bold" style={{ color: c.color || '#6366f1' }}>{c.students || 0}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-txt-dim uppercase mb-1">
                      <Clock size={9} /> Duration
                    </div>
                    <div className="text-xs font-medium text-txt mt-1">{c.duration || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-txt-dim uppercase mb-1">
                      <DollarSign size={9} /> Price
                    </div>
                    <div className="text-[11px] font-mono text-txt-muted mt-1 leading-tight">
                      {c.price ? (c.price / 1_000_000).toFixed(1) : 0}M UZS
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-mono text-txt-dim mb-1.5">
                    <span>Capacity</span>
                    <span>{c.students || 0}/30</span>
                  </div>
                  <div className="h-1 bg-bg-4 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${((c.students || 0) / 30) * 100}%`,
                        background: c.color || '#6366f1'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}