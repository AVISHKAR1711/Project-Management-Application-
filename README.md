# 🚀 Project Management Platform

> A full-stack project management application built with modern technologies to manage teams, workspaces, projects, and tasks efficiently.

---

## 🧷 GitHub Badges

     

---

## 🌐 Live Demo

👉 [https://project-mgt-platform.vercel.app](https://project-mgt-platform.vercel.app)

---

## ✨ Features

* 🔐 Authentication with Clerk
* 🏢 Organization & Workspace Management
* 📊 Project Management System
* 📌 Task Creation & Assignment
* 🗂 Task Status Tracking
* 👥 Team Member Invitations
* 💬 Real-time Comments System
* 📧 Email Notifications using Inngest + Nodemailer
* 📈 Analytics Dashboard
* 📅 Calendar View

---

## 🛠 Tech Stack

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Clerk Authentication

### Backend

* Node.js
* Express.js
* Prisma ORM

### Database

* Neon (PostgreSQL)

### Background Jobs

* Inngest

### Deployment

* Vercel

---

## 📂 Project Structure

```
client/
  ├── components/
  ├── pages/
  ├── redux/
  └── configs/

server/
  ├── controllers/
  ├── routes/
  ├── inngest/
  ├── middlewares/
  └── prisma/
```

---

## ⚙️ Installation

### 1. Clone the repository

```
git clone https://github.com/your-username/project-mgt-platform.git
cd project-mgt-platform
```

### 2. Install dependencies

Frontend

```
cd client
npm install
```

Backend

```
cd server
npm install
```

---

## 🔑 Environment Variables

### Backend (.env)

```
DATABASE_URL=
CLERK_SECRET_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
EMAIL_USER=
EMAIL_PASS=
```

### Frontend (.env)

```
VITE_CLERK_PUBLISHABLE_KEY=
VITE_API_URL=
```

---

## ▶️ Running the App

Frontend

```
npm run dev
```

Backend

```
npm run server
```

---

## 📌 API Endpoints

| Method | Endpoint              | Description        |
| ------ | --------------------- | ------------------ |
| POST   | /api/workspaces       | Create workspace   |
| GET    | /api/workspaces       | Get all workspaces |
| POST   | /api/projects         | Create project     |
| POST   | /api/tasks            | Create task        |
| PUT    | /api/tasks/:id        | Update task        |
| POST   | /api/comments         | Add comment        |
| GET    | /api/comments/:taskId | Get comments       |

---

## 🧠 Learnings

* Implemented full authentication flow using Clerk
* Managed relational data with Prisma
* Built background jobs using Inngest
* Debugged real-world production issues (Auth, DB sync, webhooks)

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit changes
4. Push and open PR

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Avishkar Pawar**

---

## ⭐ Support

If you like this project, please ⭐ the repo!
