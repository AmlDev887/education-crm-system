import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, CreditCard, Banknote, ArrowLeftRight } from 'lucide-react'
import { api } from '@/api/client'
import { Badge, Button, Modal, Select, PageHeader, FilterTabs, Spinner, Empty, fmtUZS } from '@/components/ui'

const METHOD_ICON = { card: CreditCard, cash: Banknote, transfer: ArrowLeftRight }

function AddPaymentModal({ onClose, onSave }) {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ studentId: '', amount: '', method: 'card' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { api.getStudents().then(s => setStudents(s.filter(x => x.status === 'unpaid'))) }, [])

  const handle = e => { const { name, value } = e.target; setForm(p => ({ ...p, [name]: value })) }
  const selected = students.find(s => s.id === Number(form.studentId))

  const submit = async () => {
    if (!form.studentId) return
    setSaving(true)
    await api.addPayment({
      studentId: Number(form.studentId),
      studentName: selected?.name,
      course: selected?.course,
      amount: form.amount ? Number(form.amount) : selected?.balance,
      method: form.method,
      status: 'paid',
    })
    setSaving(false)
    onSave()
  }

  return (
    <Modal title="Record Payment" onClose={onClose} width="max-w-md">
      <div className="flex flex-col gap-4">
        <Select label="Student (Unpaid)" name="studentId" value={form.studentId} onChange={handle}
          options={students.map(s => ({ value: s.id, label: `${s.name} — ${s.course}` }))} placeholder="Select student..." />
        {selected && (
          <div className="bg-bg-3 border border-border rounded-lg p-3 text-xs font-mono text-txt-muted">
            Outstanding balance: <span className="text-danger font-medium">{fmtUZS(selected.balance)}</span>
          </div>
        )}
        <div className="flex flex-col gap-1">
          <label className="label">Amount (UZS) — leave blank for full balance</label>
          <input name="amount" type="number" value={form.amount} onChange={handle}
            placeholder={selected ? String(selected.balance) : '0'} className="input-field" />
        </div>
        <Select label="Payment Method" name="method" value={form.method} onChange={handle}
          options={[{ value: 'card', label: 'Card' }, { value: 'cash', label: 'Cash' }, { value: 'transfer', label: 'Bank Transfer' }]} />
        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !form.studentId}>
            {saving ? 'Saving…' : 'Record Payment'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('all')
  const [search, setSearch]     = useState('')
  const [modal, setModal]       = useState(false)

  const load = () => api.getPayments().then(d => { setPayments(d); setLoading(false) })
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => payments.filter(p => {
    const q = search.toLowerCase()
    const matchQ = !q || p.studentName.toLowerCase().includes(q) || p.course.toLowerCase().includes(q)
    const matchF = filter === 'all' || p.status === filter
    return matchQ && matchF
  }), [payments, search, filter])

  const total = filtered.filter(p => p.status === 'paid').reduce((a, p) => a + p.amount, 0)

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Finance" title="Payments">
        <Button onClick={() => setModal(true)}><Plus size={14} /> Record Payment</Button>
      </PageHeader>

      {/* Summary */}
      <div className="flex gap-4 mb-6">
        {[
          { label: 'Total Collected', value: fmtUZS(total), color: '#10b981' },
          { label: 'Paid Transactions', value: payments.filter(p => p.status === 'paid').length, color: '#eae8e3' },
          { label: 'Pending', value: payments.filter(p => p.status === 'pending').length, color: '#f43f5e' },
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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search payments..."
            className="input-field pl-8" />
        </div>
        <FilterTabs value={filter} onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'pending', label: 'Pending' }]} />
      </div>

      <div className="card overflow-hidden">
        {loading ? <Spinner /> : (
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
              {filtered.length === 0
                ? <tr><td colSpan={6}><Empty message="No payments found" icon={Search} /></td></tr>
                : filtered.map(p => {
                  const MethodIcon = METHOD_ICON[p.method] || CreditCard
                  return (
                    <tr key={p.id} className="hover:bg-bg-3 transition-colors">
                      <td className="td text-sm font-medium">{p.studentName}</td>
                      <td className="td text-xs text-txt-muted">{p.course}</td>
                      <td className="td text-sm font-mono font-medium">{fmtUZS(p.amount)}</td>
                      <td className="td">
                        <div className="flex items-center gap-1.5 text-xs text-txt-muted">
                          <MethodIcon size={12} />
                          <span className="capitalize">{p.method}</span>
                        </div>
                      </td>
                      <td className="td text-xs font-mono text-txt-muted">{p.date}</td>
                      <td className="td"><Badge type={p.status}>{p.status}</Badge></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        )}
      </div>

      {modal && <AddPaymentModal onClose={() => setModal(false)} onSave={() => { setModal(false); load() }} />}
    </div>
  )
}
