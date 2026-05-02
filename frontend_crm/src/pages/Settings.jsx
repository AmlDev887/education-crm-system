import { useState, useEffect, useRef } from 'react'
import {
  Save, Globe, Bell, Shield, Palette, Check, RefreshCw,
  Sun, Moon, Monitor, Zap, Database, AlertTriangle,
  Info, Lock, Eye, EyeOff, LogOut, User, ChevronRight,
  Activity, Server, Cpu
} from 'lucide-react'
import { api } from '@/api/client'
import { Button, PageHeader, Spinner } from '@/components/ui'

const BASE_URL = 'http://localhost:8000'

// ─── Переводы ─────────────────────────────────────────────────────
const T = {
  en: {
    tag: 'System',
    title: 'Settings',
    saveBtn: 'Save Changes',
    saving: 'Saving…',
    saved: 'Saved ✓',
    logout: 'Log Out',
    logoutConfirm: 'Are you sure you want to log out?',

    // Sections
    general: 'General Information',
    generalSub: 'Basic center details',
    backend: 'Backend Connection',
    backendSub: 'FastAPI server configuration',
    security: 'Security',
    securitySub: 'Authentication & access control',
    notifications: 'Notifications',
    notifSub: 'Control what alerts you receive',
    appearance: 'Appearance',
    appearSub: 'Customize the interface theme',
    danger: 'Danger Zone',
    dangerSub: 'Irreversible actions',
    language: 'Language',
    langSub: 'Interface language',

    // Fields
    centerName: 'Center Name',
    adminEmail: 'Admin Email',
    phone: 'Phone',
    address: 'Address',
    currency: 'Currency',
    timezone: 'Timezone',
    apiUrl: 'FastAPI Backend URL',
    apiHint: 'Used for all API requests from the frontend',
    connected: 'Connected — live data active',
    notReachable: 'Not reachable',
    recheck: 'Re-check',
    checking: 'Checking…',
    endpointStatus: 'Endpoint Status',
    students: 'Students',
    courses: 'Courses',
    status: 'Status',
    live: 'Live',
    startServer: 'Start your FastAPI server at',

    // Security
    twoFactor: 'Two-Factor Authentication',
    twoFactorSub: 'Add an extra layer of security to your account',
    recommended: 'Recommended',
    autoBackup: 'Auto Database Backup',
    autoBackupSub: 'Automatically backup PostgreSQL data weekly',
    currentPass: 'Current Password',
    newPass: 'New Password',
    updatePass: 'Update password →',

    // Notifications
    notifPayments: 'Payment received',
    notifPaymentsSub: 'Alert when a student completes payment',
    notifAbsence: 'Student absence',
    notifAbsenceSub: 'Alert when a student is absent 3+ times',
    notifNew: 'New enrollment',
    notifNewSub: 'Notify when a new student is added',
    notifWeekly: 'Weekly summary',
    notifWeeklySub: 'Receive a weekly report every Monday',

    // Themes
    dark: 'Dark',
    darker: 'Darker',
    oled: 'OLED',
    light: 'Light',
    themeNote: 'Theme switching requires full CSS variable integration. More themes coming soon.',

    // Danger
    clearAttend: 'Clear Attendance Records',
    clearAttendSub: 'Delete all attendance logs from the database',
    resetSettings: 'Reset All Settings',
    resetSettingsSub: 'Restore all settings to their default values',
    clear: 'Clear',
    reset: 'Reset',
    confirmDanger: 'Are you sure? This cannot be undone.',
  },
  ru: {
    tag: 'Система',
    title: 'Настройки',
    saveBtn: 'Сохранить изменения',
    saving: 'Сохранение…',
    saved: 'Сохранено ✓',
    logout: 'Выйти из аккаунта',
    logoutConfirm: 'Вы уверены, что хотите выйти?',

    general: 'Общая информация',
    generalSub: 'Основные данные центра',
    backend: 'Подключение к бэкенду',
    backendSub: 'Настройка FastAPI сервера',
    security: 'Безопасность',
    securitySub: 'Аутентификация и управление доступом',
    notifications: 'Уведомления',
    notifSub: 'Управление оповещениями',
    appearance: 'Внешний вид',
    appearSub: 'Настройка темы интерфейса',
    danger: 'Опасная зона',
    dangerSub: 'Необратимые действия',
    language: 'Язык',
    langSub: 'Язык интерфейса',

    centerName: 'Название центра',
    adminEmail: 'Email администратора',
    phone: 'Телефон',
    address: 'Адрес',
    currency: 'Валюта',
    timezone: 'Часовой пояс',
    apiUrl: 'URL FastAPI сервера',
    apiHint: 'Используется для всех запросов к бэкенду',
    connected: 'Подключено — данные активны',
    notReachable: 'Сервер недоступен',
    recheck: 'Проверить',
    checking: 'Проверка…',
    endpointStatus: 'Статус эндпоинтов',
    students: 'Студентов',
    courses: 'Курсов',
    status: 'Статус',
    live: 'Активен',
    startServer: 'Запустите FastAPI сервер по адресу',

    twoFactor: 'Двухфакторная аутентификация',
    twoFactorSub: 'Дополнительный уровень защиты аккаунта',
    recommended: 'Рекомендуется',
    autoBackup: 'Автоматическое резервное копирование',
    autoBackupSub: 'Еженедельный бэкап данных PostgreSQL',
    currentPass: 'Текущий пароль',
    newPass: 'Новый пароль',
    updatePass: 'Обновить пароль →',

    notifPayments: 'Получен платёж',
    notifPaymentsSub: 'Уведомление при оплате студентом',
    notifAbsence: 'Прогул студента',
    notifAbsenceSub: 'Уведомление при 3+ пропусках',
    notifNew: 'Новый студент',
    notifNewSub: 'Уведомление при добавлении студента',
    notifWeekly: 'Еженедельный отчёт',
    notifWeeklySub: 'Отчёт каждый понедельник',

    dark: 'Тёмная',
    darker: 'Темнее',
    oled: 'OLED',
    light: 'Светлая',
    themeNote: 'Смена темы требует интеграции CSS-переменных. Скоро будет больше тем.',

    clearAttend: 'Очистить посещаемость',
    clearAttendSub: 'Удалить все записи посещаемости из базы данных',
    resetSettings: 'Сбросить настройки',
    resetSettingsSub: 'Восстановить все настройки по умолчанию',
    clear: 'Очистить',
    reset: 'Сбросить',
    confirmDanger: 'Вы уверены? Это действие нельзя отменить.',
  },
  uz: {
    tag: "Tizim",
    title: "Sozlamalar",
    saveBtn: "O'zgarishlarni saqlash",
    saving: "Saqlanmoqda…",
    saved: "Saqlandi ✓",
    logout: "Hisobdan chiqish",
    logoutConfirm: "Hisobdan chiqishga ishonchingiz komilmi?",

    general: "Umumiy ma'lumot",
    generalSub: "Markaz asosiy ma'lumotlari",
    backend: "Backend ulanishi",
    backendSub: "FastAPI server sozlamasi",
    security: "Xavfsizlik",
    securitySub: "Autentifikatsiya va kirish nazorati",
    notifications: "Bildirishnomalar",
    notifSub: "Ogohlantirish sozlamalari",
    appearance: "Ko'rinish",
    appearSub: "Interfeys mavzusini sozlash",
    danger: "Xavfli zona",
    dangerSub: "Qaytarib bo'lmaydigan amallar",
    language: "Til",
    langSub: "Interfeys tili",

    centerName: "Markaz nomi",
    adminEmail: "Admin Email",
    phone: "Telefon",
    address: "Manzil",
    currency: "Valyuta",
    timezone: "Vaqt mintaqasi",
    apiUrl: "FastAPI URL manzili",
    apiHint: "Barcha API so'rovlari uchun ishlatiladi",
    connected: "Ulandi — ma'lumotlar faol",
    notReachable: "Server mavjud emas",
    recheck: "Tekshirish",
    checking: "Tekshirilmoqda…",
    endpointStatus: "Endpoint holati",
    students: "Talabalar",
    courses: "Kurslar",
    status: "Holat",
    live: "Faol",
    startServer: "FastAPI serverni ishga tushiring",

    twoFactor: "Ikki faktorli autentifikatsiya",
    twoFactorSub: "Hisobingizga qo'shimcha himoya qo'shish",
    recommended: "Tavsiya etiladi",
    autoBackup: "Avtomatik zaxiralash",
    autoBackupSub: "PostgreSQL ma'lumotlarini haftalik zaxiralash",
    currentPass: "Joriy parol",
    newPass: "Yangi parol",
    updatePass: "Parolni yangilash →",

    notifPayments: "To'lov qabul qilindi",
    notifPaymentsSub: "Talaba to'lov qilganda ogohlantirish",
    notifAbsence: "Talaba davomatsizligi",
    notifAbsenceSub: "3+ qoldirish bo'lsa ogohlantirish",
    notifNew: "Yangi talaba",
    notifNewSub: "Yangi talaba qo'shilganda xabar",
    notifWeekly: "Haftalik hisobot",
    notifWeeklySub: "Har dushanba hisobot yuboriladi",

    dark: "Qorong'u",
    darker: "Qorong'uroq",
    oled: "OLED",
    light: "Yorug'",
    themeNote: "Mavzu almashtirish CSS o'zgaruvchilarini talab qiladi. Tez orada ko'proq mavzular.",

    clearAttend: "Davomat yozuvlarini tozalash",
    clearAttendSub: "Barcha davomat yozuvlarini o'chirish",
    resetSettings: "Sozlamalarni tiklash",
    resetSettingsSub: "Barcha sozlamalarni standart holatga qaytarish",
    clear: "Tozalash",
    reset: "Tiklash",
    confirmDanger: "Ishonchingiz komilmi? Bu amalni bekor qilib bo'lmaydi.",
  }
}

// ─── CSS Theme Variables ──────────────────────────────────────────
const THEME_VARS = {
  dark: {
    '--bg-0': '#0a0a0d', '--bg-1': '#0f0f14', '--bg-2': '#14141a',
    '--bg-3': '#1a1a22', '--bg-4': '#20202a',
    '--border': '#1e1e28', '--border-2': '#282835',
    '--txt': '#eae8e3', '--txt-muted': '#696874', '--txt-dim': '#35353f',
    '--accent': '#7c3aed',
  },
  darker: {
    '--bg-0': '#080809', '--bg-1': '#0b0b0e', '--bg-2': '#0f0f14',
    '--bg-3': '#131318', '--bg-4': '#181820',
    '--border': '#18181f', '--border-2': '#202028',
    '--txt': '#e0dedd', '--txt-muted': '#585764', '--txt-dim': '#28282f',
    '--accent': '#7c3aed',
  },
  oled: {
    '--bg-0': '#000000', '--bg-1': '#050505', '--bg-2': '#0a0a0a',
    '--bg-3': '#0f0f0f', '--bg-4': '#141414',
    '--border': '#141414', '--border-2': '#1c1c1c',
    '--txt': '#ffffff', '--txt-muted': '#606060', '--txt-dim': '#2a2a2a',
    '--accent': '#8b5cf6',
  },
  light: {
    '--bg-0': '#f8f8f5', '--bg-1': '#f0f0ed', '--bg-2': '#e8e8e5',
    '--bg-3': '#e0e0dd', '--bg-4': '#d8d8d5',
    '--border': '#ddddd8', '--border-2': '#ccccc8',
    '--txt': '#1a1a1f', '--txt-muted': '#6b6b74', '--txt-dim': '#a0a0a8',
    '--accent': '#7c3aed',
  },
}

function applyTheme(themeId) {
  const vars = THEME_VARS[themeId]
  if (!vars) return
  const root = document.documentElement
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
  // Also update body bg
  document.body.style.background = vars['--bg-0']
  document.body.style.color = vars['--txt']
}

// ─── Helpers ──────────────────────────────────────────────────────
function SettingInput({ label, name, value, onChange, type = 'text', placeholder, hint, secret }) {
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
          <button type="button" onClick={() => setShow(p => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted hover:text-txt transition-colors">
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
      style={{ background: checked ? '#7c3aed' : 'rgba(255,255,255,0.1)' }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-200 ${checked ? 'left-5' : 'left-0.5'}`} />
    </label>
  )
}

function Section({ icon: Icon, title, subtitle, children, accent = '#7c3aed' }) {
  return (
    <div className="card mb-4 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: accent + '20' }}>
          <Icon size={13} style={{ color: accent }} />
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: '#f0eef9' }}>{title}</div>
          {subtitle && <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{subtitle}</div>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function StatusDot({ live }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      {live && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: '#10b981' }} />}
      <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: live ? '#10b981' : '#ef4444' }} />
    </span>
  )
}

const THEMES = [
  { id: 'dark',   icon: Moon,    previewBg: '#14141a', previewAccent: '#7c3aed' },
  { id: 'darker', icon: Monitor, previewBg: '#0f0f14', previewAccent: '#7c3aed' },
  { id: 'oled',   icon: Zap,     previewBg: '#000000', previewAccent: '#8b5cf6' },
  { id: 'light',  icon: Sun,     previewBg: '#f0f0ed', previewAccent: '#7c3aed' },
]

const LANGS = [
  { id: 'ru', label: 'RU', full: 'Русский' },
  { id: 'en', label: 'EN', full: 'English' },
  { id: 'uz', label: 'UZ', full: "O'zbek" },
]

// ─── Main ─────────────────────────────────────────────────────────
export default function Settings({ onLogout }) {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'ru')
  const t = T[lang]

  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [isBackendLive, setIsBackendLive] = useState(false)
  const [backendInfo, setBackendInfo] = useState(null)
  const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const saveTimer = useRef(null)

  const [form, setForm] = useState({
    centerName: 'EduCenter Pro',
    email: 'admin@educenter.uz',
    phone: '+998 90 000 0000',
    address: 'Tashkent, Uzbekistan',
    apiUrl: BASE_URL,
    currency: 'UZS',
    timezone: 'Asia/Tashkent',
    notifyPayments: true,
    notifyAbsence: true,
    notifyNew: false,
    notifyWeekly: true,
    autoBackup: false,
    twoFactor: false,
    currentPassword: '',
    newPassword: '',
  })

  const checkConnection = async (url = form.apiUrl, quiet = false) => {
    if (!quiet) setChecking(true)
    try {
      const res = await fetch(`${url}/docs`, { signal: AbortSignal.timeout(3000) }).catch(() => null)
      const alive = res?.ok || res?.status === 200
      if (alive) {
        try {
          const [students, courses] = await Promise.all([api.getStudents(), api.getCourses()])
          setBackendInfo({ students: students.length, courses: courses.length })
        } catch { setBackendInfo(null) }
      }
      setIsBackendLive(alive)
    } catch { setIsBackendLive(false) }
    finally { setChecking(false); if (!quiet) setLoading(false) }
  }

  useEffect(() => {
    checkConnection(form.apiUrl, true).finally(() => setLoading(false))
  }, [])

  const handle = e => {
    const { name, value, type, checked } = e.target
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleTheme = (id) => {
    setActiveTheme(id)
    localStorage.setItem('theme', id)
    applyTheme(id)
  }

  const handleLang = (id) => {
    setLang(id)
    localStorage.setItem('lang', id)
  }

  const handleLogout = () => {
    if (window.confirm(t.logoutConfirm)) {
      localStorage.removeItem('user')
      localStorage.removeItem('lang')
      onLogout?.()
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.updateSettings(form)
      setSaved(true)
      clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      alert('Error: ' + err.message)
    } finally { setSaving(false) }
  }

  if (loading) return <div className="p-8 flex justify-center"><Spinner /></div>

  return (
    <div className="p-8 max-w-[820px] animate-fade-in">

      {/* Header with logout */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-px" style={{ background: '#7c3aed' }} />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase" style={{ color: 'rgba(124,58,237,0.6)' }}>{t.tag}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#f0eef9' }}>{t.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              background: 'rgba(244,63,94,0.08)',
              border: '1px solid rgba(244,63,94,0.2)',
              color: '#f87171',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.15)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(244,63,94,0.08)'; e.currentTarget.style.borderColor = 'rgba(244,63,94,0.2)' }}
          >
            <LogOut size={14} />
            {t.logout}
          </button>

          {/* Save button */}
          <button
            onClick={save}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: '1px solid rgba(167,139,250,0.3)',
              color: 'white',
              boxShadow: '0 2px 8px rgba(124,58,237,0.3)',
            }}
          >
            {saving ? <RefreshCw size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
            {saving ? t.saving : saved ? t.saved : t.saveBtn}
          </button>
        </div>
      </div>

      {/* ── Language ──────────────────────────────────────────────── */}
      <Section icon={Globe} title={t.language} subtitle={t.langSub} accent="#38bdf8">
        <div className="flex gap-2">
          {LANGS.map(l => (
            <button
              key={l.id}
              onClick={() => handleLang(l.id)}
              className="flex flex-col items-center gap-1.5 px-5 py-3 rounded-xl transition-all duration-150"
              style={lang === l.id ? {
                background: 'rgba(124,58,237,0.15)',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#c4b5fd',
                boxShadow: '0 0 16px rgba(124,58,237,0.1)',
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              <span className="text-lg font-bold font-mono">{l.label}</span>
              <span className="text-[10px] font-mono">{l.full}</span>
              {lang === l.id && (
                <div className="w-1.5 h-1.5 rounded-full mt-0.5" style={{ background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
              )}
            </button>
          ))}
        </div>
      </Section>

      {/* ── General ──────────────────────────────────────────────── */}
      <Section icon={User} title={t.general} subtitle={t.generalSub} accent="#38bdf8">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <SettingInput label={t.centerName} name="centerName" value={form.centerName} onChange={handle} placeholder="EduCenter Pro" />
          </div>
          <SettingInput label={t.adminEmail} name="email" type="email" value={form.email} onChange={handle} placeholder="admin@educenter.uz" />
          <SettingInput label={t.phone} name="phone" value={form.phone} onChange={handle} placeholder="+998 90 000 0000" />
          <div className="col-span-2">
            <SettingInput label={t.address} name="address" value={form.address} onChange={handle} placeholder="Tashkent, Uzbekistan" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.currency}</label>
            <select name="currency" value={form.currency} onChange={handle} className="input-field appearance-none">
              <option value="UZS">UZS — Uzbekistan Som</option>
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="RUB">RUB — Russian Ruble</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{t.timezone}</label>
            <select name="timezone" value={form.timezone} onChange={handle} className="input-field appearance-none">
              <option value="Asia/Tashkent">Asia/Tashkent (UTC+5)</option>
              <option value="Europe/Moscow">Europe/Moscow (UTC+3)</option>
              <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
      </Section>

      {/* ── Backend ───────────────────────────────────────────────── */}
      <Section icon={Server} title={t.backend} subtitle={t.backendSub} accent="#10b981">
        <div className="flex flex-col gap-4">
          <SettingInput label={t.apiUrl} name="apiUrl" value={form.apiUrl} onChange={handle} hint={t.apiHint} />

          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2.5">
                <StatusDot live={isBackendLive} />
                <span className="text-xs font-semibold" style={{ color: isBackendLive ? '#34d399' : '#f87171' }}>
                  {isBackendLive ? t.connected : t.notReachable}
                </span>
              </div>
              <button onClick={() => checkConnection(form.apiUrl)} disabled={checking}
                className="flex items-center gap-1.5 text-[11px] font-mono transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}>
                <RefreshCw size={11} className={checking ? 'animate-spin' : ''} />
                {checking ? t.checking : t.recheck}
              </button>
            </div>

            {isBackendLive && backendInfo ? (
              <div className="grid grid-cols-3 divide-x" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                {[
                  { label: t.students, value: backendInfo.students },
                  { label: t.courses, value: backendInfo.courses },
                  { label: t.status, value: t.live },
                ].map(item => (
                  <div key={item.label} className="px-4 py-3 text-center">
                    <div className="text-lg font-bold font-mono" style={{ color: '#f0eef9' }}>{item.value}</div>
                    <div className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            ) : !isBackendLive ? (
              <div className="px-4 py-3 flex items-start gap-2 text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <AlertTriangle size={12} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
                {t.startServer} <span style={{ color: '#7c3aed' }}>{form.apiUrl}</span>
              </div>
            ) : null}
          </div>

          {/* Endpoints */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-[11px] font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{t.endpointStatus}</span>
            </div>
            {[
              { path: '/students',   methods: 'GET · POST · DELETE' },
              { path: '/courses',    methods: 'GET' },
              { path: '/attendance', methods: 'GET · POST · PATCH' },
              { path: '/payments',   methods: 'GET · PATCH' },
              { path: '/stats',      methods: 'GET · stub' },
              { path: '/login',      methods: 'POST' },
              { path: '/register',   methods: 'POST' },
            ].map((ep, i, arr) => (
              <div key={ep.path}
                className="flex items-center justify-between px-4 py-2.5 transition-colors"
                style={{
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  background: 'transparent'
                }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: isBackendLive ? '#10b981' : '#ef4444' }} />
                  <span className="text-xs font-mono" style={{ color: '#eae8e3' }}>{ep.path}</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{ep.methods}</span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Security ──────────────────────────────────────────────── */}
      <Section icon={Lock} title={t.security} subtitle={t.securitySub} accent="#f59e0b">
        <div className="flex flex-col gap-4">
          {[
            { key: 'twoFactor', label: t.twoFactor, sub: t.twoFactorSub, badge: t.recommended },
            { key: 'autoBackup', label: t.autoBackup, sub: t.autoBackupSub },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: '#eae8e3' }}>
                  {item.label}
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.sub}</div>
              </div>
              <Toggle name={item.key} checked={form[item.key]} onChange={handle} />
            </div>
          ))}

          <div className="flex flex-col gap-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <SettingInput label={t.currentPass} name="currentPassword" secret value={form.currentPassword} onChange={handle} placeholder="••••••••" />
            <SettingInput label={t.newPass} name="newPassword" secret value={form.newPassword} onChange={handle} placeholder="••••••••" />
            <div>
              <button className="text-xs font-mono transition-colors" style={{ color: '#7c3aed' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a78bfa'}
                onMouseLeave={e => e.currentTarget.style.color = '#7c3aed'}>
                {t.updatePass}
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────── */}
      <Section icon={Bell} title={t.notifications} subtitle={t.notifSub} accent="#a78bfa">
        <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {[
            { key: 'notifyPayments', label: t.notifPayments, sub: t.notifPaymentsSub },
            { key: 'notifyAbsence',  label: t.notifAbsence,  sub: t.notifAbsenceSub },
            { key: 'notifyNew',      label: t.notifNew,      sub: t.notifNewSub },
            { key: 'notifyWeekly',   label: t.notifWeekly,   sub: t.notifWeeklySub },
          ].map(n => (
            <label key={n.key} className="flex items-center justify-between py-3.5 cursor-pointer">
              <div>
                <div className="text-sm font-medium" style={{ color: '#eae8e3' }}>{n.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{n.sub}</div>
              </div>
              <Toggle name={n.key} checked={form[n.key]} onChange={handle} />
            </label>
          ))}
        </div>
      </Section>

      {/* ── Appearance ────────────────────────────────────────────── */}
      <Section icon={Palette} title={t.appearance} subtitle={t.appearSub} accent="#f43f5e">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {THEMES.map(th => {
            const Icon = th.icon
            const active = activeTheme === th.id
            return (
              <button key={th.id} onClick={() => handleTheme(th.id)}
                className="relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-150"
                style={active ? {
                  border: '1px solid rgba(124,58,237,0.5)',
                  background: 'rgba(124,58,237,0.08)',
                } : {
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                <div className="w-full h-10 rounded-lg flex items-center justify-center" style={{ background: th.previewBg, border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Icon size={14} style={{ color: active ? th.previewAccent : '#696874' }} />
                </div>
                <span className="text-[11px] font-mono" style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.4)' }}>
                  {t[th.id]}
                </span>
                {active && (
                  <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: '#7c3aed' }}>
                    <Check size={9} color="white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex items-start gap-2 text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
          <Info size={11} style={{ marginTop: 2, flexShrink: 0 }} />
          {t.themeNote}
        </div>
      </Section>

      {/* ── Danger Zone ───────────────────────────────────────────── */}
      <div className="card overflow-hidden" style={{ borderColor: 'rgba(244,63,94,0.2)' }}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: '1px solid rgba(244,63,94,0.15)', background: 'rgba(244,63,94,0.04)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,63,94,0.15)' }}>
            <AlertTriangle size={13} style={{ color: '#f43f5e' }} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: '#f43f5e' }}>{t.danger}</div>
            <div className="text-[11px]" style={{ color: 'rgba(255,255,255,0.35)' }}>{t.dangerSub}</div>
          </div>
        </div>
        <div className="p-5 flex flex-col gap-3">
          {[
            { label: t.clearAttend, sub: t.clearAttendSub, btn: t.clear },
            { label: t.resetSettings, sub: t.resetSettingsSub, btn: t.reset },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-1">
              <div>
                <div className="text-sm font-medium" style={{ color: '#eae8e3' }}>{item.label}</div>
                <div className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{item.sub}</div>
              </div>
              <button
                onClick={() => window.confirm(t.confirmDanger)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)', color: '#f87171' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}
              >
                {item.btn}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom save */}
      <div className="mt-6 flex justify-between items-center">
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f87171' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(244,63,94,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(244,63,94,0.08)'}>
          <LogOut size={14} />{t.logout}
        </button>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: '1px solid rgba(167,139,250,0.3)', color: 'white', boxShadow: '0 2px 8px rgba(124,58,237,0.3)' }}>
          {saving ? <RefreshCw size={13} className="animate-spin" /> : saved ? <Check size={13} /> : <Save size={13} />}
          {saving ? t.saving : saved ? t.saved : t.saveBtn}
        </button>
      </div>
    </div>
  )
}
