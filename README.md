# 🛍️ Pizhams - Магазин пижам + 🎮 Игра Мемо

E-commerce платформа для продажи пижам с современной игрой Мемо.

---

## 📋 Оглавление

- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Быстрый старт](#-быстрый-старт)
- [Запуск в Docker](#-запуск-в-docker)
- [Разработка](#-разработка)
- [Тестирование](#-тестирование)
- [Игра Мемо](#-игра-мемо)
- [API Документация](#-api-документация)

---

## ✨ Возможности

### 🛍️ Интернет-магазин
- 📦 Каталог товаров с фильтрами (категория, размер, цвет)
- 🛒 Корзина и оформление заказов
- 👤 Личный кабинет пользователя
- ⭐ Отзывы и рейтинги товаров
- 📊 Админ-панель с дашбордом
- 📱 Полная адаптивность (mobile, tablet, desktop)

### 🎮 Игра Мемо
- 🃏 Классическая игра на память
- 📸 Загрузка своих фотографий для карточек
- 🎯 Настраиваемый размер поля (3×2, 4×3, 4×4, 6×4, 8×4)
- 👥 Мультиплеер (2-6 игроков)
- 🏆 Таблица лидеров
- 📊 Статистика игр

---

## 🛠 Технологический стек

### Frontend
- **React 18+** (TypeScript)
- **Redux Toolkit** + **Redux Toolkit Query**
- **React Router v6**
- **Bootstrap 5** + **Material Design**
- **Vite** (сборка)
- **Vitest** + **React Testing Library** (тесты)

### Backend
- **NestJS** (TypeScript)
- **PostgreSQL** (основная БД)
- **TypeORM**
- **Jest** (тесты)
- **Swagger** (API документация)
- **WebSocket** (мультиплеер)

### Инфраструктура
- **Docker** + **Docker Compose**
- **Nginx** (production frontend)
- **ESLint** + **Prettier**

---

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Клонирование репозитория
git clone <repository-url>
cd pizhams

# Запуск базы данных
docker-compose up -d postgres pgadmin

# Backend
cd backend
cp .env.example .env
npm install
npm run seed
npm run start:dev

# Frontend
cd ../frontend
npm install
npm run dev
```

### Production деплой

Смотрите подробную инструкцию в **[DEPLOYMENT.md](./DEPLOYMENT.md)**

**Рекомендуемый вариант:** Vercel (Frontend) + Railway (Backend + DB)

- ✅ Полностью бесплатно
- ✅ Авто-деплой при push в GitHub
- ✅ SSL сертификаты
- ✅ Настройка за 15 минут

---

## 🐳 Запуск в Docker

### Production сборка

```bash
# Сборка и запуск всех сервисов
docker-compose up -d --build

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Полная очистка (включая volumes)
docker-compose down -v
```

### Сервисы

| Сервис | Порт | Описание |
|--------|------|----------|
| frontend | 80 | React приложение (Nginx) |
| backend | 3000 | NestJS API |
| postgres | 5432 | PostgreSQL БД |
| pgadmin | 5050 | Веб-интерфейс БД |

---

## 👨‍💻 Разработка

### Backend команды

```bash
cd backend

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run start:dev

# Сборка production
npm run build

# Тесты
npm run test          # Unit тесты
npm run test:e2e      # E2E тесты
npm run test:cov      # Покрытие

# Seed данные
npm run seed          # Товары
npm run seed-memo     # Наборы карточек
npm run set-admin     # Admin роль

# Docker
npm run docker:build  # Сборка образа
npm run docker:run    # Запуск контейнера
```

### Frontend команды

```bash
cd frontend

# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка production
npm run build

# Тесты
npm run test          # Vitest
npm run test:ui       # Тесты с UI

# Docker
npm run docker:build  # Сборка образа
npm run docker:run    # Запуск контейнера
```

---

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
npm run test        # 18 Unit тестов
npm run test:e2e    # 21 E2E тестов
```

### Frontend тесты
```bash
cd frontend
npm run test        # 40 тестов
```

---

## 🎮 Игра Мемо

### Как играть

1. Откройте http://localhost:5173/memo
2. Нажмите **"+ Создать новый набор"**
3. Введите название и описание
4. Загрузите **3-8 фото** (каждое фото = 2 карточки)
5. Нажмите **"Play Single"** для одиночной игры
6. Переворачивайте карточки и ищите пары!

### Правила
- Переворот 2 карточек за ход
- При совпадении — карточки исчезают
- Победа — все пары найдены
- Меньше ходов = лучше результат

### API Endpoints

```
GET    /api/memo/card-sets          # Список наборов
POST   /api/memo/card-sets          # Создать набор
GET    /api/memo/card-sets/:id      # Набор с карточками
POST   /api/memo/upload             # Загрузить фото
POST   /api/memo/games              # Создать игру
POST   /api/memo/games/:id/start    # Начать игру
POST   /api/memo/games/:id/moves    # Сделать ход
GET    /api/memo/leaderboard/single # Топ игроков
```

---

## 📚 API Документация

Swagger доступен по адресу: **http://localhost:3000/api/docs**

### Основные endpoints

#### Товары
- `GET /api/products` — список товаров
- `GET /api/products/:id` — детально товар
- `POST /api/products` — создать (admin)

#### Заказы
- `POST /api/orders` — создать заказ
- `GET /api/orders/my` — мои заказы

#### Auth
- `POST /api/auth/login` — логин
- `POST /api/auth/register` — регистрация

#### Мемо
- `GET /api/memo/card-sets` — наборы карточек
- `POST /api/memo/games` — создать игру
- `POST /api/memo/games/:id/moves` — сделать ход

---

## 🔐 Тестовые данные

### Admin аккаунт
- **Email:** admin@pizhams.local
- **Пароль:** admin123

### База данных
- **Host:** localhost:5432
- **User:** pizhams
- **Password:** pizhams_password
- **DB:** pizhams

---

## 📊 Прогресс проекта

| Компонент | Статус |
|-----------|--------|
| **MVP (v1.0)** | 100% ✅ |
| **UI/UX (v1.5)** | 100% ✅ |
| **Мобильная версия (v1.6)** | 100% ✅ |
| **Memo Game (v2.0)** | 100% ✅ |
| **Docker** | 100% ✅ |

**Общая готовность: 100%** 🎉

---

## 📝 Лицензия

MIT

---

## 👥 Контакты

- Email: admin@pizhams.local
- Swagger: http://localhost:3000/api/docs
