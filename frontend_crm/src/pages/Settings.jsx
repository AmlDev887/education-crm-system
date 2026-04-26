import { useState, useEffect, useRef } from 'react'
import {
  Save, Globe, Bell, Shield, Palette, Check, RefreshCw,
  Sun, Moon, Monitor, Zap, Database, Activity, AlertTriangle,
  ChevronRight, Info, Lock, Eye, EyeOff
} from 'lucide-react'
import { api } from '@/api/client'
import { Button, PageHeader, Spinner } from '@/components/ui'

const BASE_URL = 'http://localhost:8000'

// ─── Helpers ──────────────────────────────────────────────────────
function Input({ label, name, value, onChange, type = 'text', placeholder, hint, secret }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">{label}</label>
      <div className="relative">
        <input
          name={name}
          type={secret && !show ? 'password' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="input-field w-full pr-9"
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShow(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt transition-colors"
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
      </div>
      {hint && <div className="text-[10px] text-txt-dim font-mono">{hint}</div>}
    </div>
  )
}

function Toggle({ name, checked, onChange }) {
  return (
    <label className="relative w-10 h-5 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer"
      style={{ background: checked ? 'var(--accent, #7c3aed)' : 'var(--bg-4, #27272a)' }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
    </label>
  )
}

function Section({ icon: Icon, title, subtitle, children, accent }) {
  return (
    <div className="card mb-4 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-bg-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: (accent || '#7c3aed') + '20' }}>
          <Icon size={13} style={{ color: accent || '#7c3aed' }} />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          {subtitle && <div className="text-[11px] text-txt-muted">{subtitle}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatusDot({ live }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      {live && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />}
      <span className={`relative inline-flex rounded-full h-2 w-2 ${live ? 'bg-success' : 'bg-danger'}`} />
    </span>
  )
}

// ─── Themes ───────────────────────────────────────────────────────
const THEMES = [
  { id: 'dark',    label: 'Dark',   icon: Moon,    preview: '#14141a' },
  { id: 'darker',  label: 'Darker', icon: Monitor, preview: '#0d0d12' },
  { id: 'oled',    label: 'OLED',   icon: Zap,     preview: '#000000' },
  { id: 'light',   label: 'Light',  icon: Sun,     preview: '#f8f8f5' },
]

// ─── Main ─────────────────────────────────────────────────────────
export default function Settings() {
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [isBackendLive, setIsBackendLive] = useState(false)
  const [backendInfo, setBackendInfo] = useState(null)
  const [activeTheme, setActiveTheme] = useState('dark')
  const saveTimer = useRef(null)

  const [form, setForm] = useState({
    centerName: 'EduCenter Pro',
    email: 'admin@educenter.uz',
    phone: '+998 90 000 0000',
    address: 'Tashkent, Uzbekistan',
    apiUrl: BASE_URL,
    currency: 'UZS',
    timezone: 'Asia/Tashkent',
    language: 'en',
    notifyPayments: true,
    notifyAbsence: true,
    notifyNew: false,
    notifyWeekly: true,
    autoBackup: false,
    twoFactor: false,
  })

  // ─── Check backend connection ──────────────────────────────────
  const checkConnection = async (url = form.apiUrl, quiet = false) => {
    if (!quiet) setChecking(true)
    try {
      // Пробуем /docs — FastAPI всегда его имеет
      const res = await fetch(`${url}/docs`, { signal: AbortSignal.timeout(3000) })
        .catch(() => null)
      const alive = res?.ok || res?.status === 200

      // Дополнительно грузим реальные данные для инфо-блока
      if (alive) {
        try {
          const [students, courses] = await Promise.all([
            api.getStudents(),
            api.getCourses(),
          ])
          setBackendInfo({
            students: students.length,
            courses: courses.length,
          })
        } catch {
          setBackendInfo(null)
        }
      }

      setIsBackendLive(alive)
    } catch {
      setIsBackendLive(false)
    } finally {
      setChecking(false)
      if (!quiet) setLoading(false)
    }
  }

  useEffect(() => {
    checkConnection(form.apiUrl, true).finally(() => setLoading(false))
  }, [])

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.updateSettings(form) // graceful — не падает если нет эндпоинта
      setSaved(true)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-[820px] animate-fade-in">
      <PageHeader tag="System" title="Settings">
        <Button onClick={save} disabled={saving}>
          {saving ? (
            <RefreshCw size={13} className="animate-spin" />
          ) : saved ? (
            <><Check size={13} /> Saved</>
          ) : (
            <><Save size={13} /> Save Changes</>
          )}
        </Button>
      </PageHeader>

      {/* ── General ──────────────────────────────────────────────── */}
      <Section icon={Globe} title="General Information" subtitle="Basic center details" accent="#38bdf8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Center Name" name="centerName" value={form.centerName} onChange={handle}
              placeholder="EduCenter Pro" />
          </div>
          <Input label="Admin Email" name="email" type="email" value={form.email} onChange={handle}
            placeholder="admin@educenter.uz" />
          <Input label="Phone" name="phone" value={form.phone} onChange={handle}
            placeholder="+998 90 000 0000" />
          <div className="col-span-2">
            <Input label="Address" name="address" value={form.address} onChange={handle}
              placeholder="Tashkent, Uzbekistan" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">Currency</label>
            <select name="currency" value={form.currency} onChange={handle} className="input-field appearance-none">
              <option value="UZS">UZS — Uzbekistan Som</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="RUB">RUB — Russian Ruble</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">Timezone</label>
            <select name="timezone" value={form.timezone} onChange={handle} className="input-field appearance-none">
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
              <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">Language</label>
            <select name="language" value={form.language} onChange={handle} className="input-field appearance-none">
              <option value="en">English</option>
              <option value="ru">Русский</option>
              <option value="uz">O'zbek</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── API / Backend ─────────────────────────────────────────── */}
      <Section icon={Database} title="Backend Connection" subtitle="FastAPI server configuration" accent="#10b981">
        <div className="flex flex-col gap-4">
          <Input
            label="FastAPI Backend URL"
            name="apiUrl"
            value={form.apiUrl}
            onChange={handle}
            hint="Used for all API requests from the frontend"
          />

          {/* Connection status card */}
          <div className="rounded-xl border border-border bg-bg-1 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <StatusDot live={isBackendLive} />
                <span className="text-xs font-semibold">
                  {isBackendLive ? 'Connected — live data active' : 'Not reachable'}
                </span>
              </div>
              <button
                onClick={() => checkConnection(form.apiUrl)}
                disabled={checking}
                className="flex items-center gap-1.5 text-[11px] text-txt-muted hover:text-txt font-mono transition-colors"
              >
                <RefreshCw size={11} className={checking ? 'animate-spin' : ''} />
                {checking ? 'Checking…' : 'Re-check'}
              </button>
            </div>

            {isBackendLive && backendInfo ? (
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { label: 'Students', value: backendInfo.students },
                  { label: 'Courses', value: backendInfo.courses },
                  { label: 'Status', value: 'Live' },
                ].map(item => (
                  <div key={item.label} className="px-4 py-3 text-center">
                    <div className="text-lg font-bold font-mono text-txt">{item.value}</div>
                    <div className="text-[10px] text-txt-muted font-mono">{item.label}</div>
                  </div>
                ))}
              </div>
            ) : !isBackendLive ? (
              <div className="px-4 py-3 flex items-start gap-2 text-[11px] text-txt-muted font-mono">
                <AlertTriangle size={12} className="text-warning mt-0.5 flex-shrink-0" />
                Start your FastAPI server at{' '}
                <span className="text-accent">{form.apiUrl}</span>
              </div>
            ) : null}
          </div>

          {/* Endpoints status */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-bg-1">
              <span className="text-[11px] font-mono text-txt-dim uppercase tracking-widest">Endpoint Status</span>
            </div>
            {[
              { path: '/students', label: 'Students', methods: 'GET POST DELETE' },
              { path: '/courses',  label: 'Courses',  methods: 'GET' },
              { path: '/attendance', label: 'Attendance', methods: 'GET POST' },
              { path: '/payments', label: 'Payments', methods: 'GET · POST pending' },
              { path: '/stats',    label: 'Stats',    methods: 'GET · stub only' },
            ].map((ep, i, arr) => (
              <div
                key={ep.path}
                className={`flex items-center justify-between px-4 py-2.5 hover:bg-bg-3 transition-colors ${i < arr.length - 1 ? 'border-b border-border/60' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isBackendLive ? 'bg-success' : 'bg-danger'}`} />
                  <span className="text-xs font-mono text-txt">{ep.path}</span>
                </div>
                <span className="text-[10px] font-mono text-txt-muted">{ep.methods}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Security ──────────────────────────────────────────────── */}
      <Section icon={Lock} title="Security" subtitle="Authentication & access control" accent="#f59e0b">
        <div className="flex flex-col gap-4">
          {[
            {
              key: 'twoFactor',
              label: 'Two-Factor Authentication',
              sub: 'Add an extra layer of security to your account',
              badge: 'Recommended',
            },
            {
              key: 'autoBackup',
              label: 'Auto Database Backup',
              sub: 'Automatically backup PostgreSQL data weekly',
            },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-success/10 text-success border border-success/20">
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs text-txt-muted mt-0.5">{item.sub}</div>
              </div>
              <Toggle name={item.key} checked={form[item.key]} onChange={handle} />
            </div>
          ))}

          <div className="flex flex-col gap-1.5 pt-2 border-t border-border">
            <Input
              label="Current Password"
              name="currentPassword"
              secret
              value={form.currentPassword || ''}
              onChange={handle}
              placeholder="Enter current password"
            />
            <Input
              label="New Password"
              name="newPassword"
              secret
              value={form.newPassword || ''}
              onChange={handle}
              placeholder="Enter new password"
            />
            <div className="mt-1">
              <button className="text-xs text-accent hover:text-violet-300 font-mono transition-colors">
                Update password →
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────── */}
      <Section icon={Bell} title="Notifications" subtitle="Control what alerts you receive" accent="#a78bfa">
        <div className="flex flex-col gap-0 divide-y divide-border/60">
          {[
            { key: 'notifyPayments', label: 'Payment received',  sub: 'Alert when a student completes payment' },
            { key: 'notifyAbsence',  label: 'Student absence',   sub: 'Alert when a student is absent 3+ times' },
            { key: 'notifyNew',      label: 'New enrollment',    sub: 'Notify when a new student is added' },
            { key: 'notifyWeekly',   label: 'Weekly summary',    sub: 'Receive a weekly report every Monday' },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between py-3.5 cursor-pointer group">
              <div>
                <div className="text-sm font-medium group-hover:text-txt transition-colors">{n.label}</div>
                <div className="text-xs text-txt-muted mt-0.5">{n.sub}</div>
              </div>
              <Toggle name={n.key} checked={form[n.key]} onChange={handle} />
            </label>
          ))}
        </div>
      </Section>

      {/* ── Appearance ────────────────────────────────────────────── */}
      <Section icon={Palette} title="Appearance" subtitle="Customize the interface theme" accent="#f43f5e">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {THEMES.map(t => {
            const Icon = t.icon
            const active = activeTheme === t.id
            return (
              <button
                key={t.id}
                onClick={() => setActiveTheme(t.id)}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  active
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-border-2 bg-bg-3'
                }`}
              >
                {/* Preview swatch */}
                <div
                  className="w-full h-10 rounded-lg border border-white/10 flex items-center justify-center"
                  style={{ background: t.preview }}
                >
                  <Icon size={14} style={{ color: active ? '#7c3aed' : '#696874' }} />
                </div>
                <span className="text-[11px] font-mono text-txt-muted">{t.label}</span>
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <Check size={9} className="text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-start gap-2 text-[11px] text-txt-dim font-mono">
          <Info size={11} className="mt-0.5 flex-shrink-0" />
          Theme switching requires full CSS variable integration. More themes coming soon.
        </div>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div className="card overflow-hidden border-danger/20">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-danger/20 bg-danger/5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-danger/20">
            <AlertTriangle size={13} className="text-danger" />
          </div>
          <div>
            <div className="text-sm font-semibold text-danger">Danger Zone</div>
            <div className="text-[11px] text-txt-muted">Irreversible actions</div>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {[
            { label: 'Clear Attendance Records', sub: 'Delete all attendance logs from the database', btn: 'Clear' },
            { label: 'Reset All Settings',        sub: 'Restore all settings to their default values',  btn: 'Reset' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-txt-muted mt-0.5">{item.sub}</div>
              </div>
              <button
                onClick={() => window.confirm(`Are you sure? This cannot be undone.`)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-danger/30 text-danger hover:bg-danger/10 transition-colors"
              >
                {item.btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom save bar */}
      <div className="mt-6 flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? <RefreshCw size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  )
}
