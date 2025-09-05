# Nomas PWA

A Progressive Web App for booking fitness and wellness activities at Nomas.

## 🚀 Features

- **User Authentication**: Secure sign-up/sign-in
- **Event Booking**: Browse and book various activities (Run, Pilates, Padel, Events)
- **PWA Support**: Installable, offline-capable progressive web app
- **Real-time Updates**: Powered by Supabase for real-time data synchronization
- **Responsive Design**: Beautiful UI that works on all devices

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router v6
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **PWA**: Vite PWA Plugin + Workbox
- **Testing**: Vitest + React Testing Library
- **CI/CD**: GitHub Actions + Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## 🔧 Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nomas-pwa
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

4. **Database setup**
   - Go to your Supabase dashboard
   - Run the migration script from `supabase/migrations/001_initial_schema.sql`
   - Run the seed script from `supabase/seed.sql` to add sample data

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage

## 🏗️ Project Structure

```
nomas-pwa/
├── src/
│   ├── components/     # Reusable components
│   ├── pages/         # Page components
│   ├── hooks/         # Custom React hooks
│   ├── store/         # Zustand stores
│   ├── lib/           # External library configs
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   └── styles/        # Global styles
├── supabase/
│   ├── migrations/    # Database migrations
│   └── seed.sql       # Seed data
├── public/            # Static assets
└── .github/           # GitHub Actions workflows
```

## 🔐 Authentication

The app uses Supabase Auth for authentication. New users can sign up directly without any referral code requirement.


## 🚀 Deployment

The app is configured for automatic deployment:
- **Preview deployments**: Automatically deployed to Vercel on pull requests
- **Production**: Deploy to your preferred platform (Vercel, Netlify, etc.)

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the prompts
4. Add environment variables in Vercel dashboard

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm run test:coverage
```

## 📱 PWA Features

- **Installable**: Users can install the app on their devices
- **Offline Support**: Basic offline functionality with service workers
- **Push Notifications**: (Coming in Sprint 3)
- **Background Sync**: Sync data when connection is restored

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📄 License

This project is private and proprietary to Nomas.

## 🆘 Support

For issues or questions, please contact the development team.
# Trigger redeploy
