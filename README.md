# MohallaMart - Quick Commerce Platform Guide

A comprehensive educational website showcasing the operational functionalities of quick-commerce platforms Blinkit and Swiggy Instamart. Built with Next.js 15, TypeScript, Tailwind CSS, and Framer Motion.

## 🌟 Features

### Dynamic Functionality
- **Location Detection**: Geolocation API integration with manual city/area selection
- **Search System**: Client-side search with trending suggestions and real-time filtering
- **Shopping Cart**: Persistent cart with Zustand state management
- **Responsive Design**: Mobile-first approach with hamburger menu
- **Smooth Animations**: Framer Motion for delightful user interactions

### Pages
- **Home**: Overview of MohallaMart with key features, services, and customer approach

### Components
- **Navbar**: Sticky navigation with search, location, and cart
- **LocationModal**: Interactive location selector with geolocation
- **SearchBar**: Dynamic search with autocomplete
- **CartSidebar**: Slide-in cart with quantity management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MohallaMart
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.3 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Font**: Inter (Google Fonts)

## 📁 Project Structure

```
MohallaMart/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Home page
│   │   ├── layout.tsx            # Root layout
│   │   └── globals.css           # Global styles
│   ├── components/
│   │   ├── Navbar.tsx            # Navigation component
│   │   ├── LocationModal.tsx     # Location selector
│   │   ├── SearchBar.tsx         # Search component
│   │   └── CartSidebar.tsx       # Shopping cart
│   └── store/
│       └── useStore.ts           # Zustand store
├── public/                        # Static assets
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

## 🎨 Key Implementations

### State Management (Zustand)
Persistent storage for:
- Shopping cart items
- User information
- Location preferences
- Search queries

### Geolocation API
- Auto-detect user location
- Fallback to manual selection
- Mock reverse geocoding for demo

### Search System
- Client-side filtering
- Trending searches
- Category-based results
- Real-time autocomplete

### Animations
- Page transitions
- Card hover effects
- Modal animations
- Button interactions

## 📱 Responsive Design

- **Mobile**: < 768px - Hamburger menu, stacked layouts
- **Tablet**: 768px - 1024px - 2-column grids
- **Desktop**: > 1024px - Full navigation, 3-column grids

## 🔧 Configuration

### Tailwind Theme
Custom MohallaMart brand colors defined in `tailwind.config.ts`:
- Primary: Forest Green (#2E7D32) for main actions
- Secondary: Vibrant Orange (#F97316) for CTAs
- Accent: Sunny Yellow (#FBBF24) for highlights
- Neutral: Gray shades for text and backgrounds

### TypeScript
Strict mode enabled for type safety across all components.

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

This project is for educational purposes.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📧 Contact

For questions or feedback, please reach out through the contact section on the website.

---

Built with ❤️ using Next.js and modern web technologies
