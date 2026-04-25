# Olipop Odyssey — Project Brief

Olipop Odyssey is a high-performance, cinematic e-commerce prototype for a modern functional beverage brand.

## 🛠 Technical Stack
- **Frontend Framework**: Next.js 15 (App Router) with React 19.
- **Language**: TypeScript (Strict Mode).
- **Styling**: Tailwind CSS with ShadCN UI components.
- **Backend/Database**: Firebase Firestore (Real-time NoSQL).
- **Authentication**: Firebase Auth (Email/Password & Google Sign-In) with Session Persistence.
- **Generative AI**: Genkit v1.x (Google Gemini) for dynamic flavor storytelling.
- **Image Hosting**: Cloudinary (Optimized WebP Image Sequences).

## 🎨 Design & Palette
- **Primary/Accent Color**: Sage Green (`#A1BC98`) — HSL(105, 21%, 67%).
- **Background**: Pure Black (`#000000`) for a premium dark-mode cinematic feel.
- **Typography**: 
  - *Space Grotesk*: Bold, impactful headlines.
  - *Inter*: Clean, legible body text.
  - *Playfair Display*: Elegant italic subtitles.
- **Aesthetic**: Frosted glass (Glassmorphism), dynamic radial glows, and hardware-accelerated transitions.

## ⚡ Core Features & APIs
1. **Cinematic Hero API**: Automated 10-second rotation cycle (8s WebP animation + 2s pause) with intelligent asset preloading.
2. **Real-Time Catalog API**: Firestore listener-based product grid with 1x1 aspect ratio and flavor-responsive glow effects.
3. **Real-Time Cart API**: Non-blocking Firestore mutations for instant local updates and background sync.
4. **AI Narrative Flow**: Genkit-powered server action to generate unique flavor descriptions.
5. **Admin Dashboard**: Centralized hub for inventory management and activity logging.

## 🚀 Deployment
- **Hosting**: Prepared for Firebase App Hosting or Netlify/Vercel.
- **CI/CD**: Configured for GitHub Actions automated deployments from the `main` branch.