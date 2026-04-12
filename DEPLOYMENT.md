# 🚀 Инструкция по деплою — Vercel + Railway

## Быстрый старт (15 минут)

### 1️⃣ Подготовка репозитория

```bash
git add .
git commit -m "setup: CI/CD for Vercel + Railway"
git push origin main
```

---

### 2️⃣ Деплой Backend + Database на Railway

#### Шаг 1: Создайте аккаунт
1. Перейдите на https://railway.app
2. Нажмите **Login** → войдите через GitHub
3. Перейдите в https://railway.app/dashboard

#### Шаг 2: Создайте проект
1. Нажмите **New Project** → **Deploy from GitHub repo**
2. Выберите репозиторий `pizhams`
3. В настройках проекта укажите:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start:prod`

#### Шаг 3: Добавьте PostgreSQL
1. В проекте нажмите **+** → **Database** → **Add PostgreSQL**
2. Railway автоматически создаст переменную `DATABASE_URL`

#### Шаг 4: Настройте Environment Variables
В настройках Backend сервиса добавьте:

```env
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<сгенерируйте случайную строку 64+ символов>
FRONTEND_URL=https://pizhams.vercel.app  # будет после деплоя frontend
APP_URL=<URL вашего backend от Railway>

# Cloudflare R2 Storage
R2_ACCESS_KEY_ID=<ваш R2 Access Key ID>
R2_SECRET_ACCESS_KEY=<ваш R2 Secret Access Key>
R2_ACCOUNT_ID=<ваш Cloudflare Account ID>
R2_BUCKET=pizhams
# Если настроили R2 Public Access Endpoint:
# R2_PUBLIC_URL=https://pub-xxxx.r2.dev
```

> 💡 **Генерация JWT_SECRET:**
> ```bash
> openssl rand -base64 64
> ```

> 📦 **Настройка Cloudflare R2:**
> 1. Зайдите в Cloudflare Dashboard → R2
> 2. Создайте bucket с именем `pizhams`
> 3. Включите Public Access (если нужен прямой доступ к файлам)
> 4. Создайте API Token: R2 → Manage R2 API Tokens → Create API Token
> 5. Account ID найдите в Cloudflare Dashboard (правый нижний угол)

#### Шаг 5: Получите Railway Token
1. Перейдите в https://railway.app/account/tokens
2. Нажмите **Generate Token**
3. Скопируйте токен — он понадобится для GitHub

#### Шаг 6: Задеплойте
```bash
# Установите Railway CLI
npm i -g @railway/cli

# Авторизуйтесь
railway login

# Задеплойте
cd backend
railway up
```

Или просто запушьте в main — GitHub Actions сделает всё сам!

---

### 3️⃣ Деплой Frontend на Vercel

#### Шаг 1: Создайте аккаунт
1. Перейдите на https://vercel.com
2. Нажмите **Sign Up** → войдите через GitHub

#### Шаг 2: Импортируйте проект
1. Нажмите **Add New...** → **Project**
2. Нажмите **Import** рядом с репозиторием `pizhams`

#### Шаг 3: Настройте проект
В разделе **Configure Project**:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm ci`

#### Шаг 4: Добавьте Environment Variables
Нажмите **Environment Variables** и добавьте:

```env
VITE_API_URL=https://<your-backend>.railway.app/api
```

> 💡 Замените `<your-backend>` на ваш URL от Railway (вида `pizhams-production-xxxx.up.railway.app`)

#### Шаг 5: Деплой
1. Нажмите **Deploy**
2. Подождите 30-60 секунд
3. Готово! 🎉

#### Шаг 6: Получите Vercel Token
1. Перейдите в **Account Settings** → **Tokens**
2. Создайте новый токен
3. Сохраните его для GitHub Actions

---

### 4️⃣ Настройте GitHub Secrets

Перейдите в ваш репозиторий → **Settings** → **Secrets and variables** → **Actions**

Добавьте следующие секреты:

| Secret | Описание | Где взять |
|--------|----------|-----------|
| `RAILWAY_TOKEN` | Токен Railway | https://railway.app/account/tokens |
| `VERCEL_TOKEN` | Токен Vercel | Vercel Account Settings → Tokens |
| `VERCEL_ORG_ID` | ID организации Vercel | Vercel Account Settings → General |
| `VERCEL_PROJECT_ID` | ID проекта Vercel | Vercel Project Settings → General |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | Cloudflare Dashboard → R2 → API Tokens |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | Cloudflare Dashboard → R2 → API Tokens |
| `R2_ACCOUNT_ID` | Cloudflare Account ID | Cloudflare Dashboard (правый нижний угол) |

> ⚠️ **Важно:** R2 секреты нужны для загрузки изображений. Без них приложение будет работать, но файлы не будут сохраняться.

---

### 5️⃣ Авто-деплой через GitHub Actions

Теперь при каждом push в `main`:

1. ✅ Запускаются **тесты backend** (unit + e2e)
2. ✅ Запускаются **тесты frontend** + линтинг
3. ✅ Собираются **Docker-образы** (проверка)
4. ✅ Деплоится **backend** на Railway
5. ✅ Деплоится **frontend** на Vercel

```bash
git add .
git commit -m "feat: your changes"
git push origin main
```

Наблюдайте за процессом: https://github.com/<you>/pizhams/actions

---

## Проверка деплоя

### Backend
```bash
# Проверка здоровья API
curl https://<your-backend>.railway.app/api/health

# Swagger документация
https://<your-backend>.railway.app/api/docs
```

### Frontend
```bash
# Откройте в браузере
https://<your-app>.vercel.app

# Проверьте консоль (F12) — не должно быть CORS ошибок
```

### Database
- Railway Dashboard → ваш проект → PostgreSQL → **Data**
- Можно выполнять SQL запросы прямо в браузере

---

## Настройка CORS

После деплоя frontend обновите переменную в Railway:

```env
FRONTEND_URL=https://<your-app>.vercel.app
```

Иначе получите CORS ошибку!

---

## Решение проблем

### ❌ Backend не запускается

**Проблема:** Ошибка подключения к БД

**Решение:**
1. Проверьте, что PostgreSQL запущен в Railway Dashboard
2. Убедитесь, что `DATABASE_URL` установлена
3. Перезапустите сервис: `railway restart`

---

### ❌ Frontend не подключается к API

**Проблема:** CORS ошибка или 404

**Решение:**
1. Проверьте `VITE_API_URL` в Vercel Environment Variables
2. URL должен быть полным: `https://your-backend.railway.app/api`
3. Проверьте `FRONTEND_URL` в Railway — должен совпадать с Vercel URL

**Пересоберите frontend:**
```bash
# Локально
cd frontend
npm run build

# Или просто запушьте коммит
git commit --allow-empty -m "rebuild frontend"
git push
```

---

### ❌ GitHub Actions падает

**Проблема:** Secrets не найдены

**Решение:**
1. Проверьте названия секретов (регистр важен!)
2. Убедитесь, что секреты добавлены в репозиторий
3. Попробуйте запустить workflow вручную: Actions → Deploy → Run workflow

---

### ❌ Railway не деплоит

**Проблема:** Build failed

**Решение:**
```bash
# Проверьте локально
cd backend
npm ci
npm run build
npm run start:prod
```

Если работает локально — запушьте ещё раз.

---

## Мониторинг

### Railway Dashboard
- **Logs** — логи backend в реальном времени
- **Metrics** — CPU, RAM, Network
- **Deployments** — история деплоев

### Vercel Dashboard
- **Analytics** — посещения, география, устройства
- **Logs** — логи функций
- **Speed Insights** — производительность

---

## Бэкапы

### Database (Railway)
Railway делает автоматические бэкапы:
- Перейдите в PostgreSQL → **Backups**
- Восстановите в один клик

### Ручной бэкап
```bash
# Экспорт
railway run pg_dump --no-owner > backup.sql

# Импорт
railway run psql < backup.sql
```

---

## Обновление проекта

```bash
# Внесите изменения
git add .
git commit -m "update: new feature"
git push origin main

# GitHub Actions автоматически задеплоит!
```

---

## Полезные команды

### Railway CLI
```bash
railway login           # Авторизация
railway status          # Статус проекта
railway logs            # Логи сервиса
railway open            # Открыть dashboard
railway restart         # Перезапуск сервиса
```

### Vercel CLI
```bash
vercel login            # Авторизация
vercel                  # Деплой
vercel logs             # Логи деплоя
vercel env ls           # Список переменных
```

---

## Безопасность ✅

### Чеклист перед деплоем:
- [ ] Изменили `JWT_SECRET` (сильный пароль)
- [ ] Установили сложные пароли для БД
- [ ] Настроили CORS только для вашего домена
- [ ] Включили 2FA на GitHub
- [ ] Проверили, что `.env` в `.gitignore`

---

## Тестовый аккаунт Admin

После деплоя создайте admin аккаунт:

```bash
# Подключитесь к Railway
railway run bash

# Внутри контейнера
npm run set-admin
```

Или через Swagger UI:
1. Откройте `https://your-backend.railway.app/api/docs`
2. Зарегистрируйте пользователя
3. Вручную измените роль в БД на `admin`

---

## Поддержка

- **GitHub Issues**: https://github.com/<you>/pizhams/issues
- **Railway Support**: https://railway.app/support
- **Vercel Support**: https://vercel.com/support

---

## Стоимость

| Сервис | Бесплатный лимит | Ваш проект |
|--------|------------------|------------|
| **Vercel** | Безлимит | ✅ Бесплатно |
| **Railway** | $5/месяц | ✅ Хватит для старта |
| **GitHub Actions** | 2000 минут/месяц | ✅ Хватит с головой |

> 💡 Если лимиты Railway закончатся — проект уснёт до следующего месяца или можно привязать карту ($5 хватит на ~500 часов работы backend)
