# MERN Stack App Structure

This project is organized into two main folders:

- `client/` - React frontend
- `server/` - Express.js backend

## client/
- `src/`
  - `pages/` - Contains React pages: Login, Signup, Chat
  - `App.js` - Main app component with routing
  - `index.js` - Entry point

## server/
- `routes/` - Express route definitions
- `controllers/` - Route handler logic
- `models/` - Mongoose models
- `middlewares/` - Express middleware functions
- `app.js` - Express app entry point
- `config/` - (Optional) For DB and other configs 