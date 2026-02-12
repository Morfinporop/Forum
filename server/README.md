# LostRP Email Server

Сервер для отправки кодов верификации email на форуме LostRP.

## Деплой на Railway

### 1. Создайте репозиторий GitHub

Скопируйте файлы из папки `server/` в новый репозиторий:
- `server.js`
- `package.json`
- `Procfile`

### 2. Создайте App Password для Gmail

1. Перейдите на https://myaccount.google.com/security
2. Включите **2-Step Verification** (двухфакторную аутентификацию)
3. Перейдите в **App passwords** (Пароли приложений)
4. Создайте новый пароль для приложения "Mail"
5. Скопируйте 16-символьный пароль (без пробелов)

### 3. Деплой на Railway

1. Зайдите на https://railway.app
2. Нажмите **New Project** → **Deploy from GitHub repo**
3. Выберите ваш репозиторий с сервером
4. После деплоя перейдите в **Variables** и добавьте:

```
EMAIL_USER=ваш-email@gmail.com
EMAIL_PASS=ваш-app-password-16-символов
```

5. Перейдите в **Settings** → **Networking** → **Generate Domain**
6. Скопируйте URL (например: `https://lostrp-email.up.railway.app`)

### 4. Обновите фронтенд

В файле `src/App.tsx` замените:

```typescript
const API_URL = 'https://your-railway-app.up.railway.app';
```

На ваш Railway URL:

```typescript
const API_URL = 'https://lostrp-email.up.railway.app';
```

## API Endpoints

### POST /api/send-code
Отправляет код верификации на email.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "Username"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Код отправлен"
}
```

### POST /api/verify-code
Проверяет код верификации.

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email подтверждён"
}
```

## Локальный запуск

```bash
cd server
npm install
EMAIL_USER=your@gmail.com EMAIL_PASS=your-app-password npm start
```

Сервер запустится на http://localhost:3001
