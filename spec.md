# Spec: Приложение для продажи пижам (Pizhams)

## Описание
E-commerce платформа для продажи пижам с современным дизайном, каталогом товаров, корзиной и оформлением заказов.

---

## Технологический стек

### Frontend
- **React 18+** (TypeScript)
- **Redux Toolkit** + **Redux Toolkit Query**
- **React Router v6**
- **Bootstrap 5** + **Material Design** (через MUI или React Bootstrap)
- **Vite** (сборка)
- **Vitest** + **React Testing Library** (тесты)

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** (основная БД)
- **TypeORM**
- **Jest** (тесты)
- **Swagger** (API документация)

### Инфраструктура
- **Docker** + **Docker Compose**
- **ESLint** + **Prettier**

---

## Архитектура Backend (слоеная)

```
src/
├── common/                 # Общие утилиты, декораторы, фильтры
├── config/                 # Конфигурация приложения
├── modules/
│   ├── products/           # Модуль товаров
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.repository.ts
│   │   ├── dto/
│   │   ├── entities/
│   │   └── products.module.ts
│   ├── orders/             # Модуль заказов
│   ├── users/              # Модуль пользователей
│   └── cart/               # Модуль корзины
├── database/               # Миграции, сидеры
└── main.ts
```

### Слои
1. **Controller** — HTTP endpoints, валидация запросов
2. **Service** — бизнес-логика
3. **Repository** — работа с БД
4. **DTO/Entities** — типы данных

---

## Архитектура Frontend

```
src/
├── app/                    # Redux store, роутер
├── entities/               # Бизнес-сущности (типы, слайсы)
│   ├── products/
│   ├── cart/
│   └── user/
├── features/               # Фичи (взаимодействие с сущностями)
│   ├── product-list/
│   ├── cart-actions/
│   └── checkout/
├── widgets/                # Крупные блоки (слайдеры, каталоги)
├── pages/                  # Страницы
├── shared/                 # Общие компоненты, утилиты, API
└── assets/                 # Изображения, стили
```

### FSD (Feature-Sliced Design) — упрощенно

---

## Функциональные требования

### MVP (v1.0)

#### Каталог товаров
- Список товаров с фильтрами (категория, размер, цвет)
- Карточка товара (фото, название, цена, описание)
- Детальная страница товара

#### Корзина
- Добавление/удаление товаров
- Изменение количества
- Подсчет итоговой суммы

#### Оформление заказа
- Форма заказа (имя, телефон, адрес)
- Отправка заказа на backend
- Страница подтверждения

#### Админ-панель (базовая)
- CRUD товаров
- Просмотр заказов

---

## Модель данных (PostgreSQL)

### Products
```sql
id: UUID (PK)
name: VARCHAR(255)
description: TEXT
price: DECIMAL(10,2)
category: VARCHAR(50)
sizes: VARCHAR[] (S, M, L, XL)
colors: VARCHAR[]
images: VARCHAR[] (URL)
stock: INTEGER
created_at: TIMESTAMP
updated_at: TIMESTAMP
```

### Orders
```sql
id: UUID (PK)
customer_name: VARCHAR(255)
customer_phone: VARCHAR(20)
customer_address: TEXT
items: JSONB (состав заказа)
total: DECIMAL(10,2)
status: VARCHAR(20) (new, processing, shipped, delivered)
created_at: TIMESTAMP
```

### Users (для админки)
```sql
id: UUID (PK)
email: VARCHAR(255) (UNIQUE)
password_hash: VARCHAR(255)
role: VARCHAR(20) (admin, user)
created_at: TIMESTAMP
```

---

## API Endpoints (Backend)

### Products
- `GET /api/products` — список (с пагинацией и фильтрами)
- `GET /api/products/:id` — детально
- `POST /api/products` — создать (admin)
- `PATCH /api/products/:id` — обновить (admin)
- `DELETE /api/products/:id` — удалить (admin)

### Orders
- `POST /api/orders` — создать заказ
- `GET /api/orders` — список заказов (admin)
- `GET /api/orders/:id` — детально (admin)
- `PATCH /api/orders/:id/status` — обновить статус (admin)

### Auth (для админки)
- `POST /api/auth/login` — логин
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — текущий пользователь

---

## План разработки (TDD)

### Этап 1: Настройка проекта
- [ ] Инициализация репозитория
- [ ] Docker Compose (PostgreSQL)
- [ ] Backend: NestJS scaffold
- [ ] Frontend: React + Vite scaffold
- [ ] Настройка ESLint, Prettier

### Этап 2: Backend — модуль Products (TDD)
- [ ] Тесты на ProductsService
- [ ] Тесты на ProductsController (e2e)
- [ ] Реализация ProductsModule
- [ ] Тесты на ProductsRepository
- [ ] Миграции БД

### Этап 3: Backend — модуль Orders (TDD)
- [ ] Тесты на OrdersService
- [ ] Тесты на OrdersController (e2e)
- [ ] Реализация OrdersModule

### Этап 4: Backend — Auth (TDD)
- [ ] Тесты на AuthService
- [ ] JWT guard, декораторы ролей
- [ ] Тесты на AuthController (e2e)

### Этап 5: Frontend — базовая структура
- [ ] Настройка Redux Toolkit
- [ ] Роутинг (React Router)
- [ ] Базовые компоненты (UI Kit)

### Этап 6: Frontend — каталог товаров
- [ ] Тесты на products slice (Redux)
- [ ] Тесты на ProductList компонент
- [ ] Тесты на ProductCard компонент
- [ ] Реализация

### Этап 7: Frontend — корзина
- [ ] Тесты на cart slice
- [ ] Тесты на Cart компонент
- [ ] Реализация

### Этап 8: Frontend — оформление заказа
- [ ] Тесты на checkout форму
- [ ] Тесты на API integration
- [ ] Реализация

### Этап 9: Интеграция и полировка
- [ ] E2E тесты (Playwright или Cypress)
- [ ] Стилизация (Bootstrap + Material)
- [ ] Адаптивная верстка
- [ ] Оптимизация производительности

### Этап 10: Деплой
- [ ] Dockerfile для frontend/backend
- [ ] CI/CD (GitHub Actions)
- [ ] Документация (README)

---

## Критерии приемки

### Backend
- ✅ Все тесты проходят (`npm run test:e2e`)
- ✅ Swagger доступен по `/api/docs`
- ✅ Покрытие тестами > 80%
- ✅ Нет ошибок TypeScript

### Frontend
- ✅ Все тесты проходят (`npm run test`)
- ✅ Адаптивная верстка (mobile, tablet, desktop)
- ✅ Покрытие тестами > 70%
- ✅ Нет ошибок TypeScript

### Общие
- ✅ Docker Compose поднимает всё окружение
- ✅ Код отформатирован (Prettier)
- ✅ Нет линтер-ошибок

---

## Метрики качества

| Метрика | Цель |
|---------|------|
| Backend test coverage | > 80% |
| Frontend test coverage | > 70% |
| Lighthouse Performance | > 90 |
| API response time (p95) | < 200ms |

---

## Риски

1. **Сложность TDD** — может замедлить разработку на старте, но ускорит поддержку
2. **Дизайн** — требуется время на подбор UI-компонентов
3. **Инфраструктура** — настройка Docker и CI/CD может занять время

---

## Следующие шаги

1. Создать структуру проекта
2. Настроить Docker Compose с PostgreSQL
3. Инициализировать NestJS backend
4. Инициализировать React frontend
5. Написать первый тест (TDD цикл)

---

## Статус реализации (на февраль 2026)

### ✅ Реализовано

#### Backend
- [x] ProductsModule — CRUD товаров с пагинацией и фильтрами
- [x] OrdersModule — управление заказами (создание, просмотр, обновление статуса)
- [x] UsersModule — регистрация и хранение пользователей
- [x] AuthModule — JWT аутентификация (login, register, logout, me)
- [x] RolesGuard — защита endpoints по ролям (admin/user)
- [x] Seed данные — 8 тестовых товаров
- [x] Swagger документация — `/api/docs`
- [x] **FilesModule** — загрузка изображений (multer, 5MB лимит)
- [x] **EmailModule** — email уведомления (заказ, приветствие)

#### Frontend
- [x] Страница каталога товаров (HomePage) с фильтрами и пагинацией
- [x] Страница товара (ProductPage) с выбором размера
- [x] Корзина (CartPage) с изменением количества и удалением
- [x] Оформление заказа (CheckoutPage) с формой и валидацией
- [x] Страницы авторизации (LoginPage, RegisterPage)
- [x] Админ-панель (/admin) — управление товарами и заказами
- [x] Header с авторизацией и виджетом корзины
- [x] CartSidebar — боковая панель корзины
- [x] **Загрузка изображений** — в админ-панели с предпросмотром

#### Инфраструктура
- [x] Docker Compose (PostgreSQL + pgAdmin)
- [x] Seed скрипт для тестовых данных
- [x] Скрипт назначения admin роли
- [x] Статическая раздача файлов — `/uploads/*`

---

## ⚠️ Требует доработки

### Тесты
- [ ] **E2E тесты для Auth** — проблема с регистрацией маршрутов в тестовом окружении Jest
  - Требуется отладка конфигурации ts-jest
  - Возможно, использовать изолированные модули для тестов
  - Проверить настройки `tsconfig-paths`

- [ ] **E2E тесты для Products/Orders** — не написаны
- [ ] **Frontend тесты** — не написаны (Vitest + React Testing Library)
- [ ] **Покрытие тестами** — текущее покрытие < 50%

### Функционал
- [ ] **Восстановление пароля** — forgot password flow
- [ ] **Профиль пользователя** — редактирование данных
- [ ] **История заказов** — страница моих заказов для пользователя

### Админ-панель
- [ ] **Редактирование заказов** — расширенное управление (не только статус)
- [ ] **Статистика** — дашборд с метриками продаж
- [ ] **Управление пользователями** — список, блокировка

### Безопасность
- [ ] **Валидация email** — подтверждение при регистрации
- [ ] **Rate limiting** — защита от brute force
- [ ] **CORS настройки** — более строгая политика для production
- [ ] **Helmet** — security headers

### Performance
- [ ] **Кэширование** — Redis для часто запрашиваемых данных
- [ ] **Индексы БД** — оптимизация запросов
- [ ] **Lazy loading** — для frontend роутов

---

## 🚀 Планируется (v2.0)

- [ ] Платежная система (Stripe/CloudPayments)
- [ ] Интеграция со службами доставки
- [ ] SMS уведомления (Twilio/Twilio-like)
- [ ] Система отзывов и рейтингов
- [ ] Промокоды и скидки
- [ ] Экспорт заказов (CSV, Excel)
- [ ] PWA для мобильного доступа
- [ ] Мультиязычность (i18n)

---

## Известные проблемы

| Проблема | Статус | Приоритет |
|----------|--------|-----------|
| E2E тесты Auth не проходят в Jest | 🔴 Требуется фикс | Высокий |
| Нет тестов для frontend компонентов | 🟡 Не начато | Средний |
| Email уведомления требуют SMTP настройку | 🟢 Реализовано | Низкий |
| Загрузка изображений работает | 🟢 Реализовано | Низкий |

---

## Команды для разработки

```bash
# Backend
cd backend
npm run seed         # Seed тестовых товаров
npm run set-admin    # Назначить admin роль пользователю
npm run start:dev    # Запуск dev-сервера
npm run test         # Unit тесты
npm run test:e2e     # E2E тесты (требует доработки)

# Frontend
cd frontend
npm run dev          # Запуск dev-сервера
npm run build        # Production сборка
npm run test         # Тесты (требует реализации)

# Docker
sudo docker-compose up -d    # Запуск БД
sudo docker-compose down     # Остановка

# Файлы
# Загрузки сохраняются в: backend/uploads/products/
# Доступ по URL: http://localhost:3000/uploads/products/*
```

---

## Конфигурация Email (SMTP)

```bash
# .env файл в backend/
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@pizhams.local
```

**Настройка Gmail SMTP:**
1. Включите 2FA в аккаунте Google
2. Создайте App Password: https://myaccount.google.com/apppasswords
3. Используйте App Password вместо обычного пароля

---

## Тестовые данные

**Admin аккаунт:**
- Email: `admin@pizhams.local`
- Password: `admin123`

**База данных:**
- Host: `localhost:5432`
- User: `pizhams`
- Password: `pizhams_password`
- DB: `pizhams`

---

## 📊 Прогресс проекта

### Завершено (14/20 основных задач)
- ✅ Настройка проекта (Docker, NestJS, React)
- ✅ ProductsModule (CRUD, фильтры, пагинация)
- ✅ OrdersModule (создание, просмотр, статусы)
- ✅ AuthModule (JWT, login, register, roles)
- ✅ Frontend каталог товаров
- ✅ Frontend корзина и checkout
- ✅ Админ-панель (товары + заказы)
- ✅ Загрузка изображений (multer)
- ✅ Email уведомления

### В процессе (0/20)
- 

### Осталось (6/20 основных задач)
- ⏳ Дашборд статистики
- ⏳ Профиль пользователя
- ⏳ История заказов пользователя
- ⏳ Frontend тесты (Vitest)
- ⏳ Backend E2E тесты (фикс Jest)
- ⏳ Восстановление пароля

### Готовность проекта: ~70%

qwen --resume c5e24315-2a13-4f33-bb83-a9e4fd0673e6
