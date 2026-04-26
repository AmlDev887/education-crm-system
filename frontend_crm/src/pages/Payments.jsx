import { useState, useEffect, useMemo } from 'react'
import { Search, CreditCard, Banknote, ArrowLeftRight, RefreshCw, Info } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, Button, PageHeader, FilterTabs, Spinner, Empty, fmtUZS } from '@/components/ui'

const METHOD_ICON = { card: CreditCard, cash: Banknote, transfer: ArrowLeftRight }

// ─── Info Banner ──────────────────────────────────────────────────
// Показываем баннер что POST /payments ещё не реализован на бэкенде
function BackendNotice() {
  return (
    <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-lg bg-accent/5 border border-accent/20">
      <Info size={14} className="text-accent mt-0.5 flex-shrink-0" />
      <div className="text-xs text-txt-muted">
        <span className="text-accent font-medium font-mono">POST /payments</span> endpoint is not yet implemented in the backend.
        Payment recording will be available once the backend is extended.
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────
export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getPayments()
      setPayments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return payments.filter(p => {
      const sName = (p.studentName || p.fullname || p.student_name || '').toLowerCase()
      const cName = (p.course || p.course_title || '').toLowerCase()
      const matchQ = !q || sName.includes(q) || cName.includes(q)
      const matchF = filter === 'all' || p.status === filter
      return matchQ && matchF
    })
  }, [payments, search, filter])

  const totalPaid = useMemo(
    () => filtered.filter(p => p.status === 'paid').reduce((a, p) => a + (p.amount || 0), 0),
    [filtered]
  )

  const paidCount = payments.filter(p => p.status === 'paid').length
  const pendingCount = payments.filter(p => p.status === 'pending').length

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Finance" title="Payments">
        <Button variant="ghost" onClick={load} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </Button>
        {/* Кнопка "Record Payment" убрана — POST /payments не существует в бэкенде */}
      </PageHeader>

      <BackendNotice />

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Total Collected', value: fmtUZS(totalPaid), color: '#10b981' },
          { label: 'Paid Transactions', value: paidCount, color: '#eae8e3' },
          { label: 'Pending', value: pendingCount, color: '#f43f5e' },
        ].map(s => (
          <div key={s.label} className="card flex-1 p-4">
            <div className="label">{s.label}</div>
            <div className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="input-field pl-8"
          />
        </div>
        <FilterTabs
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'paid', label: 'Paid' },
            { value: 'pending', label: 'Pending' },
          ]}
        />
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger font-mono">
          ⚠ {error}
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 flex justify-center"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <Empty
            message={
              payments.length === 0
                ? 'No payments in database yet. Add POST /payments to your backend to enable recording.'
                : 'No payments match your search.'
            }
            icon={Search}
          />
        ) : (
          <table className="w-full">
            <thead className="bg-bg-1">
              <tr>
                <th className="th">Student</th>
                <th className="th">Course</th>
                <th className="th">Amount</th>
                <th className="th">Method</th>
                <th className="th">Date</th>
                <th className="th">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const MethodIcon = METHOD_ICON[p.method] || CreditCard
                const studentName = p.studentName || p.fullname || p.student_name || '—'
                const courseName = p.course || p.course_title || '—'
                const dateStr = p.payment_date
                  ? new Date(p.payment_date).toLocaleDateString()
                  : p.date || '—'

                return (
                  <tr key={p.id} className="hover:bg-bg-3 transition-colors">
                    <td className="td text-sm font-medium">{studentName}</td>
                    <td className="td text-xs text-txt-muted">{courseName}</td>
                    <td className="td text-sm font-mono font-medium">{fmtUZS(p.amount)}</td>
                    <td className="td">
                      <div className="flex items-center gap-1.5 text-xs text-txt-muted">
                        <MethodIcon size={12} />
                        <span className="capitalize">{p.method || '—'}</span>
                      </div>
                    </td>
                    <td className="td text-xs font-mono text-txt-muted">{dateStr}</td>
                    <td className="td">
                      <Badge type={p.status}>{p.status}</Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
