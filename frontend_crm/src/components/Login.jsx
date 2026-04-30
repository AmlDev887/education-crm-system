import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Zap, Shield, Lock, User, ChevronRight, Code2, X, Github, Globe, Mail, Star } from 'lucide-react'

// ─── Частицы на фоне ──────────────────────────────────────────────
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(24)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 3 + 1 + 'px',
            height: Math.random() * 3 + 1 + 'px',
            left: Math.random() * 100 + '%',
            top: Math.random() * 100 + '%',
            background: i % 3 === 0 ? '#7c3aed' : i % 3 === 1 ? '#06b6d4' : '#ffffff',
            opacity: Math.random() * 0.4 + 0.05,
            animation: `float-particle ${Math.random() * 8 + 6}s ease-in-out infinite`,
            animationDelay: Math.random() * 5 + 's',
          }}
        />
      ))}
    </div>
  )
}

// ─── Модалка разработчика ─────────────────────────────────────────
function DevModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #131320, #0d0d18)',
          border: '1px solid rgba(124,58,237,0.2)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.1), 0 0 60px rgba(124,58,237,0.06)',
          animation: 'slide-up 0.25s ease both',
        }}
      >
        {/* Top gradient bar */}
        <div className="h-[2px]" style={{ background: 'linear-gradient(90deg, #7c3aed, #06b6d4, #7c3aed)' }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }}
        >
          <X size={13} />
        </button>

        <div className="p-6">
          {/* Avatar area */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative w-20 h-20 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.1))',
                border: '1px solid rgba(124,58,237,0.3)',
                boxShadow: '0 0 30px rgba(124,58,237,0.15)',
              }}
            >
              {/* Placeholder avatar */}
              <User size={32} style={{ color: 'rgba(124,58,237,0.6)' }} />
              {/* Online dot */}
              <div
                className="absolute bottom-1 right-1 w-3 h-3 rounded-full"
                style={{ background: '#10b981', border: '2px solid #0d0d18', boxShadow: '0 0 6px #10b981' }}
              />
            </div>

            {/* Name placeholder */}
            <div className="text-center">
              <div className="font-bold text-lg mb-0.5" style={{ color: '#f0eef9' }}>
                — Разработчик —
              </div>
              <div className="text-[11px] font-mono" style={{ color: 'rgba(124,58,237,0.7)' }}>
                Full-stack Developer
              </div>
            </div>
          </div>

          {/* Info cards */}
          <div className="space-y-2 mb-5">
            {[
              { icon: Globe, label: 'Сайт',    value: '— скоро —',   color: '#06b6d4' },
              { icon: Github, label: 'GitHub',  value: '— скоро —',   color: '#a78bfa' },
              { icon: Mail,  label: 'Email',    value: '— скоро —',   color: '#34d399' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {label}
                  </div>
                  <div className="text-[12px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Stack badges */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Стек
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['React', 'Node.js', 'PostgreSQL', 'Python', 'Tailwind'].map(tech => (
                <span key={tech} className="text-[10px] font-mono px-2 py-1 rounded-md"
                  style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: '#c4b5fd' }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-5 pt-4 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              ✦ Информация будет добавлена позже ✦
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Экран приветствия ────────────────────────────────────────────
function GreetingScreen({ onDone }) {
  const [phase, setPhase] = useState(0)
  // phase 0: поклон  phase 1: текст  phase 2: fade out

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800)
    const t2 = setTimeout(() => setPhase(2), 3200)
    const t3 = setTimeout(() => onDone(), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at center, #12091f 0%, #09090d 70%)',
        opacity: phase === 2 ? 0 : 1,
        transition: 'opacity 0.8s ease',
      }}
    >
      <Particles />

      {/* Glow rings */}
      <div className="absolute" style={{
        width: 320, height: 320,
        borderRadius: '50%',
        border: '1px solid rgba(124,58,237,0.1)',
        animation: 'ping-slow 3s ease-in-out infinite',
      }} />
      <div className="absolute" style={{
        width: 240, height: 240,
        borderRadius: '50%',
        border: '1px solid rgba(124,58,237,0.15)',
        animation: 'ping-slow 3s ease-in-out infinite 0.5s',
      }} />

      <div className="relative flex flex-col items-center gap-6 text-center px-8">
        {/* Bow emoji — анимированный поклон */}
        <div
          style={{
            fontSize: 72,
            animation: phase >= 0 ? 'bow 1s ease-in-out' : 'none',
            transformOrigin: 'bottom center',
          }}
        >
          🫅
        </div>

        {/* Приветствие */}
        <div
          style={{
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.6s ease',
          }}
        >
          <div className="text-[11px] font-mono tracking-[0.3em] uppercase mb-3"
            style={{ color: 'rgba(124,58,237,0.6)' }}>
            Добро пожаловать
          </div>
          <div
            className="font-bold"
            style={{
              fontSize: 42,
              letterSpacing: '-0.03em',
              color: '#f0eef9',
              textShadow: '0 0 40px rgba(124,58,237,0.4)',
              lineHeight: 1.1,
            }}
          >
            Прибыл Господин
          </div>
          <div
            className="font-bold mt-1"
            style={{
              fontSize: 42,
              letterSpacing: '-0.03em',
              background: 'linear-gradient(135deg, #a78bfa, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1,
            }}
          >
            Амалбек
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="#7c3aed" style={{ color: '#7c3aed', opacity: 0.7 + i * 0.06 }} />
            ))}
          </div>
          <div className="text-sm mt-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Система готова к работе
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Основной Login ────────────────────────────────────────────────
export default function Login({ onLogin }) {
  const [login, setLogin]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)
  const [greeting, setGreeting] = useState(false)
  const [devOpen, setDevOpen]   = useState(false)
  const [focused, setFocused]   = useState(null)
  const [successMsg, setSuccessMsg] = useState(false)

  const CREDS = { login: 'Amalbek', password: '85932302817#' }

  const handleSubmit = async () => {
    setError('')
    if (!login || !password) {
      setError('Введите логин и пароль')
      triggerShake()
      return
    }

    setLoading(true)
    await new Promise(r => setTimeout(r, 900)) // имитация запроса

    if (login === CREDS.login && password === CREDS.password) {
      setSuccessMsg(true)
      await new Promise(r => setTimeout(r, 700))
      setGreeting(true)
    } else {
      setLoading(false)
      setError('Неверный логин или пароль')
      triggerShake()
    }
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  if (greeting) {
    return <GreetingScreen onDone={onLogin} />
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 30% 50%, #0f0a1e 0%, #09090d 60%)' }}>

      <Particles />

      {/* Декоративные фигуры */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)' }} />

      {/* Сетка */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 40px)',
        }} />

      {/* Карточка входа */}
      <div
        className="relative w-full max-w-[400px] mx-4"
        style={{ animation: 'slide-up 0.4s ease both' }}
      >
        {/* Glow за карточкой */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.15) 0%, transparent 70%)',
            filter: 'blur(20px)',
            transform: 'translateY(-10px)',
          }} />

        <div
          className={`relative rounded-2xl overflow-hidden ${shake ? 'shake' : ''}`}
          style={{
            background: 'linear-gradient(160deg, #131320 0%, #0d0d18 100%)',
            border: '1px solid rgba(124,58,237,0.2)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* Top accent bar */}
          <div className="h-[2px]"
            style={{ background: 'linear-gradient(90deg, transparent, #7c3aed, #06b6d4, #7c3aed, transparent)' }} />

          {/* Scan line decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div style={{
              position: 'absolute', top: 0, left: '-100%', right: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(124,58,237,0.4), transparent)',
              animation: 'scan-line 4s linear infinite',
            }} />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              {/* Logo icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 relative"
                style={{
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(6,182,212,0.08))',
                  border: '1px solid rgba(124,58,237,0.3)',
                  boxShadow: '0 0 30px rgba(124,58,237,0.2)',
                }}
              >
                <Zap size={28} style={{ color: '#a78bfa' }} />
                {/* Corner pixel */}
                <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-md rounded-tr-xl"
                  style={{ background: '#7c3aed' }} />
                <div className="absolute bottom-0 left-0 w-1.5 h-1.5 rounded-tr-md rounded-bl-xl"
                  style={{ background: 'rgba(6,182,212,0.5)' }} />
              </div>

              <div className="text-[10px] font-mono tracking-[0.3em] uppercase mb-1.5"
                style={{ color: 'rgba(124,58,237,0.6)' }}>
                Educational
              </div>
              <div className="font-bold text-2xl tracking-tight" style={{ color: '#f0eef9', letterSpacing: '-0.02em' }}>
                CRM Studio
              </div>
              <div className="text-xs mt-2 flex items-center gap-1.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
                <Shield size={10} />
                Защищённый вход
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4">
              {/* Login */}
              <div>
                <label className="block text-[10px] font-mono tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Логин
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: focused === 'login' ? '#a78bfa' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
                    <User size={14} />
                  </div>
                  <input
                    value={login}
                    onChange={e => { setLogin(e.target.value); setError('') }}
                    onFocus={() => setFocused('login')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={handleKey}
                    placeholder="Введите логин"
                    autoComplete="username"
                    style={{
                      width: '100%',
                      background: focused === 'login' ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${focused === 'login' ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      padding: '11px 12px 11px 38px',
                      color: '#eae8e3',
                      fontSize: 13,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: focused === 'login' ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
                      fontFamily: 'Syne, sans-serif',
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-mono tracking-[0.15em] uppercase mb-2"
                  style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Пароль
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: focused === 'pass' ? '#a78bfa' : 'rgba(255,255,255,0.2)', transition: 'color 0.2s' }}>
                    <Lock size={14} />
                  </div>
                  <input
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused(null)}
                    onKeyDown={handleKey}
                    type={showPass ? 'text' : 'password'}
                    placeholder="Введите пароль"
                    autoComplete="current-password"
                    style={{
                      width: '100%',
                      background: focused === 'pass' ? 'rgba(124,58,237,0.06)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${focused === 'pass' ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: 10,
                      padding: '11px 38px 11px 38px',
                      color: '#eae8e3',
                      fontSize: 13,
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxShadow: focused === 'pass' ? '0 0 0 3px rgba(124,58,237,0.08)' : 'none',
                      fontFamily: 'Syne, sans-serif',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)', cursor: 'pointer' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    color: '#f87171',
                    animation: 'fade-in 0.2s ease',
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#ef4444' }} />
                  {error}
                </div>
              )}

              {/* Success flash */}
              {successMsg && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                  style={{
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.2)',
                    color: '#34d399',
                    animation: 'fade-in 0.2s ease',
                  }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
                  Успешный вход! Добро пожаловать...
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 font-semibold text-sm py-3 rounded-xl transition-all duration-200 mt-2"
                style={{
                  background: loading
                    ? 'rgba(124,58,237,0.3)'
                    : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  border: '1px solid rgba(167,139,250,0.3)',
                  color: loading ? 'rgba(255,255,255,0.5)' : 'white',
                  boxShadow: loading ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transform: loading ? 'none' : undefined,
                }}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
                    Проверяем...
                  </>
                ) : (
                  <>
                    Войти
                    <ChevronRight size={15} />
                  </>
                )}
              </button>
            </div>

            {/* Footer hint */}
            <div className="mt-6 pt-5 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 4px #ef4444' }} />
                <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  offline · mock
                </span>
              </div>

              {/* Dev button */}
              <button
                onClick={() => setDevOpen(true)}
                className="flex items-center gap-1.5 transition-all duration-150"
                style={{ color: 'rgba(255,255,255,0.2)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(124,58,237,0.7)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
              >
                <Code2 size={11} />
                <span className="text-[10px] font-mono">о разработчике</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dev modal */}
      {devOpen && <DevModal onClose={() => setDevOpen(false)} />}

      {/* Встроенные стили для анимаций */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.1; }
          33%       { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
          66%       { transform: translateY(10px) translateX(-8px); opacity: 0.15; }
        }
        @keyframes bow {
          0%   { transform: rotate(0deg); }
          30%  { transform: rotate(20deg); }
          60%  { transform: rotate(-5deg); }
          80%  { transform: rotate(10deg); }
          100% { transform: rotate(0deg); }
        }
        @keyframes ping-slow {
          0%   { transform: scale(0.95); opacity: 0.4; }
          50%  { transform: scale(1.05); opacity: 0.1; }
          100% { transform: scale(0.95); opacity: 0.4; }
        }
        @keyframes scan-line {
          0%   { left: -100%; }
          100% { left: 100%; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .shake {
          animation: shake 0.4s ease !important;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }
        .animate-spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  )
}
