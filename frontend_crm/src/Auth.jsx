import React, { useState } from 'react';

// Добавляем { onLoginSuccess } в аргументы
const Auth = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRuler, setIsRuler] = useState(false);
  const [error, setError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Отправляем запрос на твой работающий FastAPI
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Если бэкенд сказал "Success"
        setIsRuler(true);
        setError(false);

        // Сохраняем данные, чтобы CRM знала, кто вошел
        localStorage.setItem('user', JSON.stringify(data));

        setTimeout(() => {
          onLoginSuccess();
        }, 3000);
      } else {
        // Если пароль неверный или юзера нет
        setError(true);
        setTimeout(() => setError(false), 500);
      }
    } catch (err) {
      // Если забыл запустить main.py или упала сеть
      console.error("Ошибка связи с сервером:", err);
      setError(true);
      alert("Сервер не отвечает. Проверь, запущен ли бэкенд!");
    }
  };

// Внутри компонента Auth, там где блок (isRuler)
if (isRuler) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-bg-0 animate-fade-in">
      <div className="relative group">
        <div className="absolute -inset-20 bg-success-dim blur-[80px] rounded-full border border-success-border animate-pulse"></div>
        <div className="relative z-10 text-[140px] animate-bounce-slow cursor-default">
           {/* Если это ты — поклон, если нет — обычный вход */}
           {username === "Amalbek" ? "🙇‍♂️" : "🔑"}
        </div>
      </div>
      <div className="mt-16 text-center z-10">
        <p className="page-tag">System access granted</p>

        <h1 className="text-txt text-4xl font-sans font-black tracking-[0.6em] uppercase">
          {username === "Amalbek"
            ? "Наш правитель Amalbek прибыл"
            : "Вход в систему выполнен"}
        </h1>

        <div className="h-[2px] w-32 bg-success mx-auto mt-6 shadow-[0_0_15px_#10b981]"></div>
      </div>
    </div>
  );
}

  // СТАНДАРТНОЕ ОКНО ВХОДА (без изменений)
  return (
    <div className="flex items-center justify-center h-screen bg-bg-0 font-mono">
      <div className={`w-full max-w-sm transition-transform ${error ? 'animate-shake' : ''}`}>
        <form onSubmit={handleLogin} className="card p-10 shadow-2xl relative">
          <div className="mb-10 text-center">
            <span className="page-tag">Terminal v1.0</span>
            <h2 className="text-3xl font-sans font-bold tracking-tighter italic text-txt">
              AMAL<span className="text-accent">.</span>EDUCRM
            </h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="ENTER LOGIN..."
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full justify-center py-4 text-base tracking-widest uppercase">
               Вход
            </button>
          </div>
          {error && (
            <div className="mt-6 p-2 bg-danger-dim border border-danger-border rounded text-danger text-[10px] text-center tracking-tighter uppercase">
              Критическая ошибка: неверные учетные данные
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Auth;