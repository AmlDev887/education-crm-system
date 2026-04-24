import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, UserPlus } from 'lucide-react'
import { api } from '@/api/client'
import { Avatar, Badge, Button, Modal, Input, Select, FilterTabs, PageHeader, Empty, Spinner, getCourseColor, fmtUZS } from '@/components/ui'

const COURSE_OPTIONS = [
  { value: 1, label: 'UI/UX Design' },
  { value: 2, label: 'Python Backend' },
  { value: 3, label: 'Data Science' },
  { value: 4, label: 'React Frontend' },
  { value: 5, label: 'Cybersecurity' }
]

// Начальные поля теперь полностью соответствуют твоей БД в PostgreSQL
const EMPTY_FORM = {
  fullname: '',
  email: '',
  phone: '',
  course_id: '',
  status: 'active',
  is_active: true,
  age: '',
  last_payment_date: new Date().toISOString().slice(0, 10),
  enrolled: new Date().toISOString().slice(0, 10)
}

function StudentModal({ student, onClose, onSave }) {
  // Инициализация формы с учетом данных из БД или пустой формы
  const [form, setForm] = useState(student ? {
    ...student,
    fullname: student.fullname || student.name || '',
    age: student.age || '',
    is_active: student.is_active ?? true,
    last_payment_date: student.last_payment_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    enrolled: student.enrolled?.slice(0, 10) || new Date().toISOString().slice(0, 10)
  } : EMPTY_FORM)

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isEdit = !!student

  const handle = e => {
    const { name, value } = e.target;
    // Конвертация строкового значения из Select в Boolean для поля is_active
    const finalValue = name === 'is_active' ? value === 'true' : value;

    setForm(p => ({ ...p, [name]: finalValue }));
    setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.fullname?.trim()) e.fullname = 'Full Name is required'
    if (!form.email?.includes('@')) e.email = 'Valid email required'
    if (!form.course_id) e.course_id = 'Select a course'
    if (!form.age || form.age <= 0) e.age = 'Valid age is required'
    return e
  }

  const submit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    try {
      // Подготовка данных перед отправкой (числа должны быть числами)
      const payload = {
        ...form,
        age: parseInt(form.age),
        course_id: parseInt(form.course_id)
      }

      if (isEdit) await api.updateStudent(student.id, payload)
      else await api.addStudent(payload)
      onSave()
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Student' : 'Add New Student'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input
              label="Full Name"
              name="fullname"
              value={form.fullname}
              onChange={handle}
              placeholder="e.g. Bekzod Karimov"
              required
              error={errors.fullname}
            />
          </div>

          <Input label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="student@example.com" required error={errors.email} />
          <Input label="Phone" name="phone" value={form.phone} onChange={handle} placeholder="+998 90 123 4567" />

          <Input
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handle}
            placeholder="21"
            required
            error={errors.age}
          />

          <Select
            label="Course"
            name="course_id"
            value={form.course_id}
            onChange={handle}
            options={COURSE_OPTIONS}
            placeholder="Select course..."
            required
            error={errors.course_id}
          />

          <Select
            label="Status"
            name="status"
            value={form.status}
            onChange={handle}
            options={[
              { value: 'active', label: 'Active (Paid)' },
              { value: 'inactive', label: 'Inactive (Unpaid)' }
            ]}
          />

          <Select
            label="Account Access"
            name="is_active"
            value={form.is_active.toString()}
            onChange={handle}
            options={[
              { value: 'true', label: 'Enabled (Active)' },
              { value: 'false', label: 'Disabled (Blocked)' }
            ]}
          />

          <Input label="Enrollment Date" name="enrolled" type="date" value={form.enrolled} onChange={handle} />
          <Input label="Last Payment" name="last_payment_date" type="date" value={form.last_payment_date} onChange={handle} />
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>
            <UserPlus size={14} />
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Student'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function DeleteConfirm({ student, onClose, onConfirm }) {
  return (
    <Modal title="Delete Student" onClose={onClose} width="max-w-sm">
      <p className="text-sm text-txt-muted mb-5">
        Remove <span className="text-txt font-medium">{student.fullname || student.name}</span> from the system?
      </p>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm}><Trash2 size={13} /> Delete</Button>
      </div>
    </Modal>
  )
}

export default function Students() {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [courseFilter, setCourse] = useState('all')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true);
    try {
      const data = search.trim().length > 0
        ? await api.searchStudents(search)
        : await api.getStudents();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(load, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    return students.filter(s => {
      const normalizedStatus = s.status === 'active' ? 'paid' : (s.status === 'inactive' ? 'unpaid' : s.status);
      const matchF = filter === 'all' || normalizedStatus === filter;
      const matchC = courseFilter === 'all' || s.course === courseFilter;
      return matchF && matchC;
    })
  }, [students, filter, courseFilter])

  const handleSave = () => { setModal(null); load() }
  const handleDelete = () => { api.deleteStudent(selected.id).then(handleSave) }

  const uniqueCourses = useMemo(() => [...new Set(students.map(s => s.course))], [students])

  return (
    <div className="p-8 max-w-[1200px] animate-fade-in">
      <PageHeader tag="Records" title="Students">
        <Button onClick={() => { setSelected(null); setModal('add') }}>
          <Plus size={14} /> Add Student
        </Button>
      </PageHeader>

      <div className="flex gap-3 mb-5 flex-wrap items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="input-field pl-8"
          />
        </div>
        <FilterTabs value={filter} onChange={setFilter}
          options={[{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} />
        <select value={courseFilter} onChange={e => setCourse(e.target.value)}
          className="input-field w-auto text-xs py-1.5">
          <option value="all">All Courses</option>
          {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden min-h-[200px] relative">
        {loading && <div className="absolute inset-0 flex items-center justify-center bg-bg-0/50 z-10"><Spinner /></div>}

        <table className="w-full">
          <thead className="bg-bg-1">
            <tr>
              <th className="th">Student</th>
              <th className="th">Course</th>
              <th className="th">Age</th>
              <th className="th">Phone</th>
              <th className="th">Status</th>
              <th className="th w-20"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && !loading
              ? <tr><td colSpan={7}><Empty message="No students match your search" icon={Search} /></td></tr>
              : filtered.map(s => (
                <tr key={s.id} className="hover:bg-bg-3 transition-colors group">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.fullname || s.name} color={getCourseColor(s.course)} />
                      <div>
                        <div className="text-sm font-medium">{s.fullname || s.name}</div>
                        <div className="text-[11px] text-txt-muted font-mono">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: getCourseColor(s.course) }} />
                      <span className="text-xs text-txt-muted">{s.course}</span>
                    </div>
                  </td>
                  <td className="td text-xs text-txt-muted">{s.age} y.o.</td>
                  <td className="td text-xs font-mono text-txt-muted">{s.phone}</td>
                  <td className="td">
                    <Badge type={s.status === 'active' ? 'paid' : 'unpaid'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelected(s); setModal('edit') }}
                        className="p-1.5 rounded-lg hover:bg-bg-4 text-txt-muted hover:text-txt transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => { setSelected(s); setModal('delete') }}
                        className="p-1.5 rounded-lg hover:bg-danger-dim text-txt-muted hover:text-danger transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-txt-dim font-mono">
        Showing {filtered.length} of {students.length} students
      </div>

      {modal === 'add'    && <StudentModal onClose={() => setModal(null)} onSave={handleSave} />}
      {modal === 'edit'   && <StudentModal student={selected} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal === 'delete' && <DeleteConfirm student={selected} onClose={() => setModal(null)} onConfirm={handleDelete} />}
    </div>
  )
}