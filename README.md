# 🇮🇳 CleanBharat — Community-Powered Civic Issue Reporting

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003b57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![NextAuth](https://img.shields.io/badge/Next--Auth-v4.24-green?style=for-the-badge&logo=nextauth)](https://next-auth.js.org/)

**CleanBharat** is a modern, responsive, and community-driven web application designed to empower citizens to report local civic issues (such as potholes, street light failures, sanitation issues, and garbage overflows). The platform leverages community upvoting to prioritize issues, making it easier for local authorities and community volunteers to identify and address the most pressing concerns first.

---

## ✨ Features

* 📍 **Spot & Report**: Easily submit an issue with a title, detailed description, exact location/address, and an optional photo.
* 👍 **Community-Driven Prioritization**: Citizens can upvote (support) issues. Posts are automatically sorted dynamically, bringing high-priority issues with the most community support to the top of the feed.
* 🔒 **Secure Authentication**: Built-in user registration and sign-in powered by **NextAuth.js** and **bcryptjs** password hashing.
* 📱 **Modern & Responsive UI**: Designed with **Tailwind CSS v4** featuring an elegant, modern visual layout, subtle hover micro-animations, glassmorphism elements, and fully responsive layouts for all device screens.
* 💾 **Robust SQLite Storage**: Relational data storage utilizing a local SQLite database file, handling users, issues, and junction-table relations for upvotes securely.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js](https://nextjs.org/) 16 (App Router)
* **Frontend Library**: [React 19](https://react.dev/)
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & custom theme properties
* **Authentication**: [NextAuth.js](https://next-auth.js.org/) (JWT Strategy)
* **Database**: [SQLite](https://sqlite.org) (via the `sqlite` & `sqlite3` packages)
* **Security**: [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) for password hashing

---

## 📂 Project Structure

```text
cleanbharat/
├── app/                  # Next.js App Router Pages & API Routes
│   ├── about/            # About page
│   ├── api/              # API Route Handlers
│   │   ├── auth/         # NextAuth configuration endpoints
│   │   ├── classify/     # Image classification routes (placeholder)
│   │   └── posts/        # Issue post APIs (Retrieve, Create, Like, Delete)
│   ├── issues/           # Issues browsing page (with Search & Likes)
│   ├── login/            # Sign In page
│   ├── register/         # Sign Up page
│   ├── report/           # Report a new issue page (Forms & Upload)
│   ├── globals.css       # Core design tokens and custom styles
│   └── layout.tsx        # Base root layout wrapper
├── components/           # Reusable UI React Components
│   ├── Navbar.tsx        # Responsive navigation header
│   ├── Footer.tsx        # Page footer details
│   ├── PostCard.tsx      # Individual issue visual card
│   └── SessionWrapper.tsx # NextAuth provider context wrapper
├── data/                 # Data directory
│   └── posts.db          # Local SQLite Database
├── lib/                  # Shared Utility and Configuration Modules
│   ├── auth.ts           # Authentication Options & Credentials Provider
│   └── database.js       # SQLite connections, migrations, & operations
├── package.json          # Node dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 🗄️ Database Schema

The database consists of three main tables managed via local SQLite migrations inside `lib/database.js`:

### 1. `users`
Stores registered user information.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER` (PK, Auto-increment) | Unique user identifier |
| `name` | `TEXT` | User's full name |
| `email` | `TEXT` (Unique) | User's email (used for login) |
| `password_hash` | `TEXT` | Bcrypt-hashed password |
| `created_at` | `DATETIME` | Account registration timestamp |

### 2. `posts`
Stores civic issues reported by users.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER` (PK, Auto-increment) | Unique issue identifier |
| `title` | `TEXT` | Short summary of the problem |
| `description` | `TEXT` | Detailed description of the issue |
| `address` | `TEXT` | Location or address |
| `image` | `TEXT` | Base64-encoded image string (optional) |
| `likes` | `INTEGER` (Default: `0`) | Upvote counter |
| `user_id` | `INTEGER` (FK) | Reference to `users.id` who reported it |
| `user_name` | `TEXT` | Name of the reporter |
| `created_at` | `DATETIME` | Time of creation |

### 3. `post_likes`
Junction table tracking unique likes per user per post.
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | `INTEGER` (PK, Auto-increment) | Unique like ID |
| `post_id` | `INTEGER` (FK) | Reference to `posts.id` |
| `user_id` | `INTEGER` (FK) | Reference to `users.id` |
| `created_at` | `DATETIME` | Timestamp of when the issue was supported |

*Note: A unique constraint exists on `(post_id, user_id)` to ensure each user can only support an issue once.*

---

## 🚀 Getting Started

### Prerequisites

* **Node.js**: Version 18.x or higher
* **npm**, **yarn**, **pnpm**, or **bun**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ayush-bisht-7/cleanbharat.git
   cd cleanbharat
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the root directory (or edit the existing one):
   ```env
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-nextauth-secret-key-here
   ```

4. **Initialize Database:**
   The SQLite database (`data/posts.db`) and its tables will automatically initialize the first time you run the application. No manual schema import is required.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## 🏗️ Production Build

To build and run the application for production:
```bash
npm run build
npm start
```

---

## 🤝 Contributing

Contributions to improve CleanBharat are welcome! Please follow these steps:
1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information (if applicable).
