import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, UserPlus, CheckCircle2, XCircle } from 'lucide-react'
import { api } from '@/api/client'
import toast from 'react-hot-toast' // Импорт уведомлений
import { Avatar, Badge, Button, Modal, Input, Select, FilterTabs, PageHeader, Empty, Spinner, getCourseColor, fmtUZS } from '@/components/ui'

// Расширили начальную форму
const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  age: 18,
  course: '',
  status: 'unpaid',
  is_active: true,
  enrolled: new Date().toISOString().slice(0, 10)
}

function StudentModal({ student, onClose, onSave, courseTitles }) {
  // Если редактируем, подтягиваем данные студента, если нет — пустую форму
  const [form, setForm] = useState(student ? {
    ...student,
    name: student.fullname || student.name,
    enrolled: student.date_rage ? student.date_rage.split('T')[0] : new Date().toISOString().slice(0, 10)
  } : EMPTY_FORM)

  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const isEdit = !!student

  const handle = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({
      ...p,
      [name]: type === 'checkbox' ? checked : value
    }));
    setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())         e.name    = 'Name is required'
    if (!form.email.includes('@')) e.email   = 'Valid email required'
    if (!form.course)              e.course  = 'Select a course'
    if (form.age < 3 || form.age > 110) e.age = 'Age must be 3-110'
    return e
  }

  const submit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSaving(true);

    // СВЯЗЬ С БЭКЕНДОМ: Сопоставляем поля с твоей моделью в FastAPI
    const backendData = {
      fullname: form.name,        // Передаем 'name' из формы в 'fullname' бэкенда
      email: form.email,
      phone: form.phone || '',
      age: parseInt(form.age),
      course: form.course,
      status: form.status,
      is_active: form.is_active,
      last_payment_date: new Date().toISOString(),
      date_rage: new Date(form.enrolled).toISOString() // Превращаем дату в ISO для БД
    };

    try {
      if (isEdit) {
        await api.updateStudent(student.id, backendData);
        toast.success('Student updated successfully'); // Уведомление об обновлении
      } else {
        await api.addStudent(backendData);
        toast.success('New student added!'); // Уведомление о добавлении
      }
      onSave();
    } catch (err) {
      toast.error(err.message || "Operation failed"); // Уведомление об ошибке
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={isEdit ? 'Edit Student' : 'Add New Student'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Full Name" name="name" value={form.name} onChange={handle} placeholder="e.g. Aisha Karimova" required error={errors.name} />
          </div>
          <Input label="Email" name="email" type="email" value={form.email} onChange={handle} placeholder="student@example.com" required error={errors.email} />

          {/* НОВОЕ ПОЛЕ: ВОЗРАСТ */}
          <Input label="Age" name="age" type="number" value={form.age} onChange={handle} min="3" max="110" error={errors.age} />

          <Input label="Phone" name="phone" value={form.phone} onChange={handle} placeholder="+998 90 123 4567" />
          <Input label="Enrollment Date" name="enrolled" type="date" value={form.enrolled} onChange={handle} />

          <Select label="Course" name="course" value={form.course} onChange={handle} options={courseTitles} placeholder="Select course..." required error={errors.course} />
          <Select label="Payment Status" name="status" value={form.status} onChange={handle}
            options={[{ value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} />

          {/* НОВОЕ ПОЛЕ: СТАТУС АКТИВНОСТИ */}
          <div className="col-span-2 flex items-center gap-2 pt-2">
            <input type="checkbox" name="is_active" id="is_active" checked={form.is_active} onChange={handle} className="w-4 h-4 accent-primary" />
            <label htmlFor="is_active" className="text-sm font-medium cursor-pointer">Student is currently active</label>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t border-border">
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
        Remove <span className="text-txt font-medium">{student.fullname || student.name}</span>?
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
  const [courseTitles, setCourseTitles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [courseFilter, setCourse] = useState('all')
  const [modal, setModal]       = useState(null)
  const [selected, setSelected] = useState(null)

  const load = async () => {
    setLoading(true)
    try {
      const [sData, cData] = await Promise.all([api.getStudents(), api.getCourses()])
      setStudents(sData)

      if (Array.isArray(cData)) {
        setCourseTitles(cData.map(c => ({
          value: typeof c === 'object' ? c.title : c,
          label: typeof c === 'object' ? c.title : c
        })))
      }
    } catch (err) {
      console.error(err)
      toast.error("Failed to load data");
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => { load() }, [])

  const filtered = useMemo(() => students.filter(s => {
    const q = search.toLowerCase()
    const name = (s.fullname || s.name || '').toLowerCase()
    const matchQ = !q || name.includes(q) || (s.email || '').toLowerCase().includes(q)
    const matchF = filter === 'all' || s.status === filter
    const matchC = courseFilter === 'all' || s.course === courseFilter
    return matchQ && matchF && matchC
  }), [students, search, filter, courseFilter])

  const handleSave = () => { setModal(null); load() }
  const handleDelete = async () => {
    try {
      await api.deleteStudent(selected.id)
      toast.success('Student deleted');
      setModal(null); load()
    } catch (err) {
      toast.error("Error deleting student")
    }
  }

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
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="input-field pl-8" />
        </div>
        <FilterTabs value={filter} onChange={setFilter} options={[{ value: 'all', label: 'All' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' }]} />
        <select value={courseFilter} onChange={e => setCourse(e.target.value)} className="input-field w-auto text-xs py-1.5">
          <option value="all">All Courses</option>
          {courseTitles.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? <div className="p-10 flex justify-center"><Spinner /></div> : (
          <table className="w-full text-left">
            <thead className="bg-bg-1">
              <tr>
                <th className="th">Student</th>
                <th className="th text-center">Age</th>
                <th className="th">Course</th>
                <th className="th">Phone</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? <tr><td colSpan={6}><Empty /></td></tr> : filtered.map(s => (
                <tr key={s.id} className="hover:bg-bg-3 transition-colors group border-b border-border/50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.fullname || s.name} color={getCourseColor(s.course)} />
                      <div>
                        <div className="text-sm font-medium flex items-center gap-2">
                          {s.fullname || s.name}
                          {s.is_active ? <CheckCircle2 size={12} className="text-success" /> : <XCircle size={12} className="text-txt-muted" />}
                        </div>
                        <div className="text-[11px] text-txt-muted">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="td text-center text-xs">{s.age}</td>
                  <td className="td text-xs text-txt-muted">{s.course}</td>
                  <td className="td text-xs font-mono text-txt-muted">{s.phone}</td>
                  <td className="td"><Badge type={s.status}>{s.status}</Badge></td>
                  <td className="td text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setSelected(s); setModal('edit') }} className="p-1.5 hover:bg-bg-4 rounded-md"><Pencil size={13} /></button>
                      <button onClick={() => { setSelected(s); setModal('delete') }} className="p-1.5 hover:bg-danger-dim text-danger rounded-md"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal === 'add'    && <StudentModal courseTitles={courseTitles} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal === 'edit'   && <StudentModal student={selected} courseTitles={courseTitles} onClose={() => setModal(null)} onSave={handleSave} />}
      {modal === 'delete' && <DeleteConfirm student={selected} onClose={() => setModal(null)} onConfirm={handleDelete} />}
    </div>
  )
}