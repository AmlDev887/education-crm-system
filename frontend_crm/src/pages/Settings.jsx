import { useState } from 'react'
import { Save, Globe, Bell, Shield, Palette } from 'lucide-react'
import { Button, Input, PageHeader } from '@/components/ui'

const Section = ({ icon: Icon, title, children }) => (
  <div className="card mb-4 overflow-hidden">
    <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border bg-bg-1">
      <Icon size={14} className="text-txt-muted" />
      <span className="text-sm font-semibold">{title}</span>
    </div>
    <div className="p-5">{children}</div>
  </div>
)

export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState({
    centerName: 'EduCenter Pro',
    email: 'admin@educenter.uz',
    phone: '+998 90 000 0000',
    address: 'Tashkent, Uzbekistan',
    apiUrl: 'http://localhost:8000',
    currency: 'UZS',
    timezone: 'Asia/Tashkent',
    notifyPayments: true,
    notifyAbsence: true,
    notifyNew: false,
  })

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-[800px] animate-fade-in">
      <PageHeader tag="System" title="Settings">
        <Button onClick={save}>
          <Save size={14} />
          {saved ? 'Saved ✓' : 'Save Changes'}
        </Button>
      </PageHeader>

      <Section icon={Globe} title="General Information">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Center Name" name="centerName" value={form.centerName} onChange={handle} />
          </div>
          <Input label="Admin Email" name="email" type="email" value={form.email} onChange={handle} />
          <Input label="Phone" name="phone" value={form.phone} onChange={handle} />
          <div className="col-span-2">
            <Input label="Address" name="address" value={form.address} onChange={handle} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Currency</label>
            <select name="currency" value={form.currency} onChange={handle} className="input-field appearance-none">
              <option value="UZS">UZS — Uzbekistan Som</option>
              <option value="USD">USD — US Dollar</option>
              <option value="RUB">RUB — Russian Ruble</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handle} className="input-field appearance-none">
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
              <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </Section>

      <Section icon={Shield} title="API Configuration">
        <div className="flex flex-col gap-4">
          <Input label="FastAPI Backend URL" name="apiUrl" value={form.apiUrl} onChange={handle} />
          <div className="bg-bg-3 border border-border rounded-lg p-3">
            <div className="text-[11px] font-mono text-txt-dim mb-1">Connection Status</div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
              <span className="text-xs text-txt-muted">Backend not reachable — using mock data</span>
            </div>
            <div className="text-[10px] font-mono text-txt-dim mt-2">
              Start your FastAPI server at <span className="text-accent">{form.apiUrl}</span> to connect live data
            </div>
          </div>
        </div>
      </Section>

      <Section icon={Bell} title="Notifications">
        <div className="flex flex-col gap-4">
          {[
            { key: 'notifyPayments', label: 'Payment received', sub: 'Get notified when a student completes payment' },
            { key: 'notifyAbsence',  label: 'Student absence',  sub: 'Alert when a student marks absent 3+ times' },
            { key: 'notifyNew',      label: 'New enrollment',   sub: 'Notify when a new student is added' },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between cursor-pointer group">
              <div>
                <div className="text-sm font-medium">{n.label}</div>
                <div className="text-xs text-txt-muted mt-0.5">{n.sub}</div>
              </div>
              <div className={`relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 ${form[n.key] ? 'bg-accent' : 'bg-bg-4 border border-border-2'}`}>
                <input type="checkbox" name={n.key} checked={form[n.key]} onChange={handle} className="sr-only" />
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${form[n.key] ? 'left-5' : 'left-0.5'}`} />
              </div>
            </label>
          ))}
        </div>
      </Section>

      <Section icon={Palette} title="Appearance">
        <div className="flex items-center gap-3">
          {['Dark', 'Darker', 'OLED'].map(t => (
            <button key={t} onClick={() => {}}
              className={`px-4 py-2 rounded-lg text-sm border transition-all ${t === 'Dark' ? 'bg-accent-dim border-accent-border text-violet-300' : 'bg-bg-3 border-border text-txt-muted hover:text-txt'}`}>
              {t}
            </button>
          ))}
        </div>
        <p className="text-xs text-txt-dim mt-3 font-mono">More themes coming soon.</p>
      </Section>
    </div>
  )
}
