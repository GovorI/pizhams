# 🚀 Инструкция по деплою

## Варианты деплоя

### 1. Vercel + Railway (Рекомендуется) ⭐

**Бесплатно | Авто-деплой | SSL включён**

#### Frontend (Vercel)
1. https://vercel.com → New Project
2. Import GitHub repo: `pizhams`
3. Settings:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   ```
   VITE_API_URL=https://your-app.railway.app/api
   ```

#### Backend + Database (Railway)
1. https://railway.app → New Project
2. Deploy from GitHub repo
3. Add PostgreSQL: `+` → `Database` → `PostgreSQL`
4. Settings:
   - Root Directory: `backend`
   - Start Command: `npm run start:prod`
5. Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-secret-key
   FRONTEND_URL=https://your-app.vercel.app
   APP_URL=https://your-app.railway.app
   ```

---

### 2. Render (Альтернатива)

**Бесплатно | Авто-деплой | 750 часов/месяц**

1. https://render.com
2. New Web Service
3. Connect GitHub repo
4. Build Command: `cd backend && npm install && npm run build`
5. Start Command: `cd backend && npm run start:prod`
6. Add PostgreSQL database
7. Set environment variables

---

### 3. Self-hosted (VPS)

**Платно (~$5/месяц) | Полный контроль**

#### Требования:
- Ubuntu 20.04+
- Docker & Docker Compose
- Домен (опционально)

#### Установка:

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/your-username/pizhams.git
cd pizhams

# 2. Создайте .env
cp .env.production.example .env
nano .env  # Заполните значения

# 3. Запустите Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Проверьте статус
docker-compose ps

# 5. Посмотрите логи
docker-compose logs -f
```

#### Настройка домена и SSL:

```bash
# Установите Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Получите SSL сертификат
sudo certbot --nginx -d your-domain.com

# Автоматическое обновление
sudo certbot renew --dry-run
```

---

## GitHub Actions (Авто-деплой)

### Настройка:

1. Создайте secrets в GitHub:
   - Settings → Secrets and variables → Actions
   - Добавьте:
     - `RAILWAY_TOKEN`: Ваш токен Railway
     - `VERCEL_TOKEN`: Ваш токен Vercel
     - `VERCEL_ORG_ID`: ID организации Vercel
     - `VERCEL_PROJECT_ID`: ID проекта Vercel

2. Запушьте в main/master:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

3. GitHub Actions автоматически задеплоит!

---

## Проверка деплоя

### Backend:
```bash
# Проверка API
curl https://your-backend-url.com/api/health

# Проверка Swagger
https://your-backend-url.com/api/docs
```

### Frontend:
```bash
# Проверка сайта
https://your-frontend-url.com

# Проверка консоли (F12)
# Не должно быть ошибок CORS
```

### Database:
```bash
# Railway: через веб-интерфейс
# VPS: docker-compose exec postgres psql -U pizhams
```

---

## Решение проблем

### Ошибка CORS
```
Solution: Update FRONTEND_URL in backend env variables
```

### Ошибка базы данных
```
Solution: Check DATABASE_URL and restart service
```

### Frontend не подключается к API
```
Solution: Update VITE_API_URL in Vercel env variables
```

---

## Мониторинг

### Railway:
- Логи в реальном времени
- Метрики использования
- Автоматические рестарты

### Vercel:
- Analytics в дашборде
- Function logs
- Performance metrics

### VPS:
```bash
# Логи Docker
docker-compose logs -f

# Использование ресурсов
docker stats

# Системные логи
journalctl -u docker -f
```

---

## Бэкапы

### Database backup (Railway):
```bash
# Через CLI
railway backup create

# Восстановление
railway backup restore <backup-id>
```

### Database backup (VPS):
```bash
# Создать бэкап
docker-compose exec postgres pg_dump -U pizhams pizhams > backup.sql

# Восстановить
docker-compose exec -T postgres psql -U pizhams pizhams < backup.sql
```

---

## Безопасность

### Обязательно измените:
- [ ] JWT_SECRET (минимум 32 символа)
- [ ] DB_PASSWORD (сложный пароль)
- [ ] Admin password (admin@pizhams.local)

### Рекомендуется:
- [ ] Включить 2FA на GitHub
- [ ] Настроить rate limiting
- [ ] Включить HTTPS
- [ ] Настроить firewall
- [ ] Регулярно обновлять зависимости

---

## Поддержка

- GitHub Issues: https://github.com/your-username/pizhams/issues
- Email: support@pizhams.local
