# E-Commerce Frontend

React + Vite frontend application for the AI-Powered E-Commerce Platform.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Server runs on: `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # Reusable components
├── pages/          # Page components
├── services/       # API calls
├── hooks/          # Custom React hooks
├── stores/         # Zustand state management
├── utils/          # Utility functions
├── App.jsx         # Main app component
└── main.jsx        # Entry point
```

## 🎨 Features

- Responsive design with Tailwind CSS
- Routing with React Router
- State management with Zustand
- HTTP client with Axios
- ESLint & Prettier for code quality

## 🔧 Available Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview prod build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier

## 📦 Dependencies

- **react** - UI library
- **react-dom** - React DOM
- **react-router-dom** - Routing
- **axios** - HTTP client
- **zustand** - State management
- **lucide-react** - Icon library

## 🎯 Environment Variables

Create `.env` file:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_AI_SERVICE_URL=http://localhost:8000
```

## 📚 Components to Build

- [ ] Header/Navbar
- [ ] ProductCard
- [ ] ProductGrid
- [ ] SearchBar
- [ ] Cart
- [ ] Wishlist
- [ ] CheckoutForm
- [ ] AIChat
- [ ] AdminDashboard
- [ ] UserProfile

## 🚀 Deployment

### Vercel

```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify

```bash
npm run build
# Connect to Netlify and select dist folder
```

## 📖 Learn More

- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
