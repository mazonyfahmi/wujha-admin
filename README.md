<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:6366f1&height=220&section=header&text=Wujha%20Admin&fontSize=80&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=Modern%20Admin%20Panel%20for%20Service%20Management&descSize=18&descAlignY=55&descAlign=50" width="100%"/>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel&logoColor=white" alt="Laravel 12"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19"></a>
  <a href="#"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="#"><img src="https://img.shields.io/badge/Inertia.js-2.0-9553E9?style=for-the-badge&logo=inertiajs&logoColor=white" alt="Inertia.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/PHP-8.4-777BB4?style=flat-square&logo=php&logoColor=white" alt="PHP 8.4"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js 20"></a>
  <a href="#"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white" alt="MySQL"></a>
  <a href="#"><img src="https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="#"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
</p>

<p align="center">
  <strong>A powerful, full-featured admin panel built with Laravel 12 + React 19 + Inertia.js</strong><br>
  <sub>Manage services, orders, customers, invoices, chat, and more — all from one beautiful dashboard.</sub>
</p>

---

## ✨ Features

<table>
<tr>
<td width="50%">

### 📊 Dashboard & Analytics
- Real-time statistics and KPIs
- Interactive charts (orders by status, revenue)
- Recent activity feed
- Top services overview

### 🛍️ Service Management
- Full CRUD with categories
- Image gallery support
- Bulk actions (activate, deactivate, delete)
- Advanced filtering and search

### 📦 Order Management
- Kanban board & table views
- Status workflow (pending → processing → completed)
- Order timeline & history
- Invoice generation & printing

</td>
<td width="50%">

### 👥 Customer Management
- Customer profiles & contact info
- Customer groups & segmentation
- Order history per customer
- Reviews & ratings management

### 💬 Live Chat
- Real-time messaging system
- Conversation management
- Support ticket creation
- Agent assignment

### ⚙️ Settings & Configuration
- Store information & branding
- Payment method management
- Notification preferences
- Security settings (password policies, session timeout)

</td>
</tr>
</table>

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 12, PHP 8.4, Sanctum Auth |
| **Frontend** | React 19, TypeScript 5.7, Inertia.js 2.0 |
| **Styling** | Tailwind CSS 4, shadcn/ui, Radix UI |
| **Charts** | Recharts |
| **Build Tool** | Vite 7 |
| **Database** | MySQL 8.0 / SQLite |
| **Queue** | Laravel Queue + Supervisor |
| **Web Server** | Nginx + PHP-FPM |

## 🚀 Quick Start

### One-Line Install (Production Server)

Deploy on a fresh Ubuntu/Debian server with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/mazonyfahmi/wujha-admin/main/setup.sh | sudo bash
```

This will automatically:
- ✅ Clone the repository
- ✅ Install all dependencies (PHP 8.4, Node.js 20, MySQL, Nginx, etc.)
- ✅ Configure the database and environment
- ✅ Build frontend assets
- ✅ Set up Nginx, PHP-FPM, and Supervisor
- ✅ Create an admin account and display credentials

### Manual Installation

<details>
<summary>Click to expand</summary>

#### Prerequisites

- PHP 8.4+
- Composer 2.x
- Node.js 20+
- MySQL 8.0+ or SQLite
- Nginx or Apache

#### Steps

```bash
# 1. Clone the repository
git clone https://github.com/mazonyfahmi/wujha-admin.git
cd wujha-admin

# 2. Install PHP dependencies
composer install

# 3. Install Node.js dependencies
npm install

# 4. Environment setup
cp .env.example .env
php artisan key:generate

# 5. Configure your database in .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_DATABASE=wujha_admin
# DB_USERNAME=your_user
# DB_PASSWORD=your_password

# 6. Run migrations and seed
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder

# 7. Build frontend assets
npm run build

# 8. Link storage
php artisan storage:link

# 9. Start development server
php artisan serve
```

</details>

### Development

```bash
# Start Laravel dev server
php artisan serve

# Start Vite dev server (in another terminal)
npm run dev
```

## 📁 Project Structure

```
wujha-admin/
├── app/
│   ├── Http/Controllers/      # Web & API controllers
│   │   ├── Api/               # Mobile API (v1) controllers
│   │   └── Dashboard/         # Admin panel controllers
│   ├── Models/                # Eloquent models
│   └── Providers/             # Service providers
├── resources/
│   └── js/
│       ├── Components/        # Reusable React components (shadcn/ui)
│       ├── Layouts/           # Dashboard layout
│       └── Pages/
│           └── Dashboard/     # Admin panel pages
│               ├── Orders/    # Order management
│               ├── Services/  # Service management
│               ├── Customers/ # Customer management
│               ├── Chat/      # Live chat
│               ├── Settings/  # App configuration
│               └── ...
├── routes/
│   ├── web.php                # Admin panel routes
│   └── api.php                # Mobile API routes
├── scripts/
│   ├── install.sh             # Dependency installer
│   ├── configure.sh           # Server configuration
│   ├── backup.sh              # Backup utility
│   └── rollback.sh            # Rollback utility
├── deploy.sh                  # Main deployment script
└── setup.sh                   # One-line installer
```

## 🔐 API Documentation

The application provides a RESTful API (v1) with Sanctum authentication for mobile clients:

```
POST   /api/v1/auth/login          # Login
POST   /api/v1/auth/register       # Register
GET    /api/v1/services             # List services
GET    /api/v1/services/{id}        # Service details
GET    /api/v1/categories           # List categories
POST   /api/v1/orders               # Create order
GET    /api/v1/orders               # List user orders
GET    /api/v1/orders/{id}          # Order details
POST   /api/v1/orders/{id}/cancel   # Cancel order
GET    /api/v1/banners              # Active banners
GET    /api/v1/notifications        # User notifications
POST   /api/v1/chat/send            # Send message
GET    /api/v1/chat/messages        # Chat messages
```

## 🖥️ Deployment

### Standard Update

```bash
sudo ./deploy.sh
```

### Available Commands

| Command | Description |
|---------|-------------|
| `sudo ./deploy.sh --install` | First-time installation |
| `sudo ./deploy.sh` | Standard deployment (pull + build + migrate) |
| `sudo ./deploy.sh --configure` | Re-run configuration only |
| `sudo ./deploy.sh --backup` | Create backup |
| `sudo ./deploy.sh --rollback` | Rollback to previous version |

### Supported Operating Systems

- Ubuntu 20.04 / 22.04 / 24.04
- Debian 11 / 12
- CentOS 8 / 9
- Rocky Linux 8 / 9
- AlmaLinux 8 / 9

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/mazonyfahmi">mazonyfahmi</a></sub>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0f172a,100:6366f1&height=100&section=footer" width="100%"/>
</p>