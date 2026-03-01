# Pizhams — Магазин пижам

E-commerce платформа для продажи пижам с современным дизайном.

## 📋 Технологический стек

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** (БД)
- **TypeORM** (ORM)
- **Swagger** (API документация)
- **Jest** (тесты)

### Frontend
- **React 19** (TypeScript)
- **Redux Toolkit** + **RTK Query**
- **React Router v7**
- **Bootstrap 5** + **Material UI**
- **Vite** (сборка)
- **Vitest** + **React Testing Library** (тесты)

## 🚀 Быстрый старт

### Требования
- Node.js >= 20
- npm >= 10
- Docker (опционально, для PostgreSQL)

### 1. Установка и запуск Backend

```bash
cd backend

# Установить зависимости
npm install

# Скопировать .env.example в .env
cp .env.example .env

# Запустить PostgreSQL (если установлен Docker)
docker compose up -d

# Или использовать локальную БД PostgreSQL

# Запустить тесты
npm run test

# Запустить сборку
npm run build

# Запустить сервер
npm run start:dev
```

Backend доступен по адресу: http://localhost:3000  
Swagger документация: http://localhost:3000/api/docs

### 2. Установка и запуск Frontend

```bash
cd frontend

# Установить зависимости
npm install

# Запустить тесты
npm run test

# Запустить сборку
npm run build

# Запустить dev-сервер
npm run dev
```

Frontend доступен по адресу: http://localhost:5173

## 📁 Структура проекта

```
pizhams/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── common/          # Общие утилиты
│   │   ├── config/          # Конфигурация
│   │   ├── modules/         # Модули приложения
│   │   │   ├── products/    # Товары
│   │   │   ├── orders/      # Заказы
│   │   │   └── users/       # Пользователи
│   │   └── main.ts
│   ├── test/                # E2E тесты
│   └── package.json
│
├── frontend/                # React frontend
│   ├── src/
│   │   ├── app/             # Redux store, роутер
│   │   ├── entities/        # Бизнес-сущности
│   │   ├── features/        # Фичи
│   │   ├── pages/           # Страницы
│   │   ├── shared/          # Общие компоненты
│   │   └── main.tsx
│   └── package.json
│
├── docker-compose.yml       # Docker конфигурация
└── spec.md                  # Спецификация проекта
```

## 🧪 Тестирование

### Backend тесты

```bash
cd backend
npm run test          # Unit тесты
npm run test:e2e      # E2E тесты
npm run test:cov      # Покрытие тестами
```

### Frontend тесты

```bash
cd frontend
npm run test          # Unit тесты
npm run test:ui       # Тесты с UI
```

## 📡 API Endpoints

### Products
- `GET /api/products` — список товаров (с фильтрами и пагинацией)
- `GET /api/products/:id` — товар по ID
- `POST /api/products` — создать товар (admin)
- `PATCH /api/products/:id` — обновить товар (admin)
- `DELETE /api/products/:id` — удалить товар (admin)

### Orders
- `POST /api/orders` — создать заказ
- `GET /api/orders` — список заказов (admin)
- `GET /api/orders/:id` — заказ по ID (admin)

Полная документация API: http://localhost:3000/api/docs

## 🎨 Архитектура Frontend (FSD)

Проект использует упрощенную версию **Feature-Sliced Design**:

- **app** — глобальная конфигурация (store, роутер)
- **entities** — бизнес-сущности (products, cart, user)
- **features** — взаимодействие с сущностями
- **widgets** — крупные блоки
- **pages** — страницы приложения
- **shared** — переиспользуемые компоненты и утилиты

## 🏗 Архитектура Backend (слоеная)

- **Controller** — HTTP endpoints, валидация
- **Service** — бизнес-логика
- **Repository** — работа с БД
- **DTO/Entities** — типы данных

## 📝 Следующие шаги (Roadmap)

- [ ] Модуль Orders (создание и просмотр заказов)
- [ ] Модуль Auth (JWT аутентификация для админки)
- [ ] Модуль Cart (корзина на backend)
- [ ] Страница товара (ProductPage)
- [ ] Страница корзины (CartPage)
- [ ] Оформление заказа (CheckoutPage)
- [ ] Админ-панель
- [ ] E2E тесты (Playwright)
- [ ] CI/CD pipeline

## 📄 Лицензия

MIT
