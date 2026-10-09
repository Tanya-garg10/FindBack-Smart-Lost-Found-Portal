<div align="center">

# FindBack - Smart Lost & Found Portal

**"Lost something? Find it back."**

A campus-wide lost and found platform with intelligent matching and verification system

</div>

## 🎯 Features

- **Report Lost/Found Items**: Easy form to report lost items or found items on campus
- **Smart Matching**: Intelligent matching algorithm that pairs lost and found items based on:
  - Category matching
  - Description similarity
  - Location proximity
  - Date proximity
- **Claim Verification**: Structured claim process with unique feature verification
- **Admin Dashboard**: Admin panel for approving claims, verifying items, and managing reports
- **Real-time Updates**: Live notifications for matches, claims, and status updates
- **Role-based Access**: Student and Admin roles with appropriate permissions
- **User Authentication**: Google OAuth integration for secure sign-in

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animations**: Motion
- **Backend**: Firebase (Authentication & Firestore)
- **State Management**: React Hooks

## 📋 Prerequisites

- Node.js (v18 or higher)
- A Firebase project with:
  - Authentication enabled (Google provider)
  - Firestore Database
  - Google Cloud credentials configured

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/Tanya-garg10/FindBack-Smart-Lost-Found-Portal.git
cd FindBack-Smart-Lost-Found-Portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Google Authentication
   - Create a Firestore Database
   - Copy your Firebase config and update `src/firebase.ts` with your credentials

4. Run the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── AdminDashboardView.tsx
│   ├── DashboardView.tsx
│   ├── ItemDetailView.tsx
│   ├── Navbar.tsx
│   ├── ReportFormView.tsx
│   └── ...
├── firebase.ts          # Firebase configuration
├── matchingEngine.ts    # Item matching algorithm
├── types.ts             # TypeScript type definitions
├── demoData.ts          # Demo data for testing
└── App.tsx              # Main application component
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run TypeScript type checking
- `npm run deploy` - Build and deploy to Firebase Hosting

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Update `.firebaserc` with your Firebase project ID:
```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

4. Deploy:
```bash
npm run deploy
```

### Alternative Deployment Options

- **Vercel**: Import repository on vercel.com and add environment variables
- **Netlify**: Connect GitHub repo with build command `npm run build` and publish directory `dist`
- **GitHub Pages**: Configure base path in `vite.config.ts` and use gh-pages

## 👥 User Roles

### Student
- Report lost items
- Report found items
- Search and browse items
- Submit claims for found items
- View own reports and claims

### Admin
- View all reported items
- Approve or reject claims
- Verify item ownership
- Mark items as returned
- Remove duplicate reports

## 🔐 Firebase Setup

1. Enable Google Sign-In in Firebase Authentication
2. Create Firestore Database in Test Mode (or configure proper rules)
3. Download Firebase config and update `src/firebase.ts`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

Copyright (c) 2026 Tanya Garg

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
