<div align="center">

# 🚀 Full Stack FastAPI Template

  <p><b>Современный полноценный шаблон веб-приложения на базе FastAPI и React с готовой инфраструктурой</b></p>

  <p>
    <img src="https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
    <img src="https://img.shields.io/badge/FastAPI-0.100%2B-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI">
    <img src="https://img.shields.io/badge/React-18%2B-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/Docker-24.0%2B-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  </p>

</div>

---

## 💡 О проекте

**Full Stack FastAPI Template** — это готовый к производству шаблон для быстрой разработки масштабируемых веб-приложений. Фронтенд на React интегрирован прямо в бэкенд-образ и обслуживается FastAPI на одном домене, что упрощает деплой и настройку CORS. Проект включает в себя полную экосистему: от строгой валидации и работы с базой данных до автоматического тестирования и деплоя через Docker.

---

## 🛠 Technology Stack and Features

### Backend
* ⚡ **FastAPI** для быстрого и асинхронного Python бэкенд API.
* 🧰 **SQLModel** для удобного взаимодействия с базой данных через Python ORM.
* 🔍 **Pydantic** (используется FastAPI) для строгой валидации данных и управления конфигурациями.
* 💾 **PostgreSQL** в качестве надежной реляционной базы данных.
* 🔒 Безопасное хэширование паролей по умолчанию.
* 🔑 **JWT (JSON Web Token)** аутентификация.
* 📫 Система восстановления пароля по электронной почте.
* 📬 **Mailcatcher** для локального тестирования отправки писем в процессе разработки.
* ✅ Автоматизированное тестирование с помощью **Pytest**.

### Frontend & UI
* 🚀 **React** для построения пользовательского интерфейса.
* 🧩 Фронтенд встроен в бэкенд-образ и раздается силами FastAPI на том же домене.
* 💃 Современный стек: TypeScript, хуки, Vite и инструменты сборки.
* 🎨 **Tailwind CSS** и **shadcn/ui** для стилизации и готовых компонентов интерфейса.
* 🤖 Автоматически сгенерированный клиент для работы с API.
* 🦇 Полноценная поддержка темной темы (Dark Mode).

### Infrastructure & DevOps
* 🐋 **Docker Compose** для локального запуска сервисов и деплоя.
* 📞 **Traefik** в роли обратного прокси-сервера (reverse proxy) и балансировщика нагрузки.
* 🚢 Инструкции по развертыванию через Docker Compose с автоматическим HTTPS от Traefik.
* 🏭 **CI/CD** (Continuous Integration & Continuous Deployment) на базе GitHub Actions.
* 🧪 **Playwright** для сквозного (End-to-End) тестирования интерфейса.

---

## ⚙️ How to Use It

Вы можете просто сделать форк или клонировать этот репозиторий и использовать его как основу для своего проекта.

### Клонирование репозитория
```bash
git clone [https://github.com/AmlDev887/full-stack-fastapi-template.git](https://github.com/AmlDev887/full-stack-fastapi-template.git)
cd full-stack-fastapi-template
