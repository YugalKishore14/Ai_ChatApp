# 🤖 YUG-AI ChatApp

A modern, full-stack AI-powered chat application built with the MERN stack, featuring real-time conversations, markdown rendering, syntax highlighting, and professional admin panel.

🔗 **Live App**: [http://34.42.233.32:5000/](http://34.42.233.32:5000/)

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green)

## ✨ Features

### 🎯 Core Features

- **Real-time AI Chat** - Intelligent conversations with AI assistant
- **User Authentication** - Secure JWT-based authentication system
- **Admin Panel** - Comprehensive admin dashboard for user management
- **Chat History** - Persistent chat sessions with browsing capability
- **Responsive Design** - Mobile-first, modern UI/UX

### 🚀 Advanced Features

- **Markdown Rendering** - Full markdown support in AI responses
- **Syntax Highlighting** - Code blocks with Prism.js highlighting
- **Real-time Typing Indicators** - Live typing status during AI responses
- **Custom Notifications** - Beautiful, non-intrusive notification system
- **Session Management** - Multiple chat sessions with easy switching
- **Security Features** - Rate limiting, helmet protection, input validation

### 🎨 UI/UX Features

- **Modern Design** - Glass-morphism and gradient effects
- **Smooth Animations** - Fluid transitions and micro-interactions
- **Custom Scrollbars** - Styled scrollbars for better aesthetics
- **Professional Styling** - Enterprise-grade visual design
- **Dark/Light Themes** - Consistent theming throughout the app

## 🛠️ Tech Stack

### Frontend

- **React 19.1.0** - Modern React with hooks and context
- **Vite** - Fast development and build tool
- **React Router DOM** - Client-side routing
- **React Bootstrap** - UI component library
- **React Icons** - Comprehensive icon library
- **React Markdown** - Markdown parsing and rendering
- **React Syntax Highlighter** - Code syntax highlighting
- **Axios** - HTTP client for API calls

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Bcrypt** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - API protection

## 📁 Project Structure

```
Ai_ChatApp/
├── client/                     # Frontend React application
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── MarkdownRenderer.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/           # React context providers
│   │   │   └── AuthContext.jsx
│   │   ├── pages/             # Page components
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Chat.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Signup.jsx
│   │   ├── services/          # API services
│   │   │   └── api.js
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Main app component
│   │   ├── main.jsx           # Entry point
│   │   ├── index.css          # Global styles
│   │   └── App.css            # Component styles
│   ├── package.json
│   ├── vite.config.js
│   └── eslint.config.js
├── server/                     # Backend Node.js application
│   ├── controllers/           # Route handlers
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── chatController.js
│   ├── middlewares/           # Custom middleware
│   │   ├── validation.js
│   │   └── verifyToken.js
│   ├── models/                # Database models
│   │   ├── ChatHistory.js
│   │   └── User.js
│   ├── routes/                # API routes
│   │   ├── admin.js
│   │   ├── auth.js
│   │   └── chat.js
│   ├── app.js                 # Express server setup
│   ├── createAdmin.js         # Admin creation script
│   └── package.json
└── README.md                   # Project documentation
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16.0.0 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/yugai-chatapp.git
   cd yugai-chatapp
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the `server` directory:

   ```env
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/yugai-chatapp

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # AI API Configuration (if using external AI service)
   AI_API_KEY=your-ai-api-key
   AI_API_URL=https://api.your-ai-service.com
   ```

5. **Database Setup**

   Make sure MongoDB is running, then create an admin user:

   ```bash
   cd server
   npm run create-admin
   ```

6. **Start the application**

   **Option 1: Start both servers with VS Code task**

   - Open the project in VS Code
   - Press `Ctrl+Shift+P` and run "Tasks: Run Task"
   - Select "Start Development"

   **Option 2: Start manually**

   ```bash
   # Terminal 1 - Start backend server
   cd server
   npm run yugal

   # Terminal 2 - Start frontend development server
   cd client
   npm run dev
   ```

7. **Access the application**
   - Frontend: http://localhost:5173 (or the port shown in terminal)
   - Backend API: http://localhost:5000

## 🔐 Default Admin Credentials

After running the admin creation script:

- **Email**: admin@yugai.com
- **Password**: admin123

**⚠️ Important**: Change these credentials immediately after first login!

## 📊 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Chat

- `POST /api/chat/send` - Send message to AI
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/session/:id` - Delete chat session

### Admin

- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get system statistics
- `DELETE /api/admin/users/:id` - Delete user

## 🎨 UI Components

### Key Components

- **MarkdownRenderer** - Renders AI responses with markdown support
- **ProtectedRoute** - Route protection for authenticated users
- **AuthContext** - Global authentication state management
- **Custom Notifications** - Beautiful notification system

### Styling Features

- **CSS Variables** - Consistent theming system
- **Flexbox Layouts** - Responsive grid system
- **Custom Animations** - Smooth transitions and effects
- **Modern Typography** - Professional font choices

## 🔧 Development

### Available Scripts

**Client (Frontend)**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Server (Backend)**

```bash
npm run yugal        # Start with nodemon (development)
npm start            # Start production server
npm run create-admin # Create admin user
```

### Development Tips

1. **Hot Reload**: Both frontend and backend support hot reloading
2. **Debugging**: Use browser dev tools and VS Code debugger
3. **API Testing**: Use Postman or Thunder Client for API testing
4. **Database**: Use MongoDB Compass for database visualization

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build the client: `npm run build`
2. Deploy the `dist` folder
3. Configure environment variables

### Backend (Heroku/Railway)

1. Set environment variables
2. Update MongoDB URI for production
3. Deploy server directory

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your-production-jwt-secret
PORT=5000
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - Bcrypt password protection
- **Rate Limiting** - API endpoint protection
- **CORS Configuration** - Cross-origin request handling
- **Helmet Security** - HTTP security headers
- **Input Validation** - Server-side validation
- **XSS Protection** - Markdown sanitization

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**

```bash
# Kill process on port 5000
taskkill /F /PID <process-id>
# or
npx kill-port 5000
```

**MongoDB Connection Issues**

- Ensure MongoDB is running
- Check connection string in `.env`
- Verify network connectivity

**Build Issues**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**CSS Not Loading**

- Check import paths
- Restart development server
- Clear browser cache

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Development Guidelines

- Follow ESLint configuration
- Write meaningful commit messages
- Test thoroughly before submitting
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Yugal**

- GitHub: [GitHub-profile](https://github.com/YugalKishore14)
- Email: yugaldhiman14@gmail.com

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Prism.js for syntax highlighting
- React Markdown for markdown rendering
- All open-source contributors

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/yugai-chatapp)
![GitHub forks](https://img.shields.io/github/forks/yourusername/yugai-chatapp)
![GitHub issues](https://img.shields.io/github/issues/yourusername/yugai-chatapp)

---

<div align="center">
  <strong>Built with ❤️ by Yugal</strong>
</div>
