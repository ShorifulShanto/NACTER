# 🌿 NECTAR — Cinematic Functional Beverage Experience

NECTAR is a high-performance, luxury e-commerce prototype built for the next generation of functional beverages. It features a "butter-smooth" interaction layer, hardware-accelerated cinematic visuals, and AI-driven sensory storytelling.

## 🎨 Brand Specification

### Color Palette
- **Nectar Teal (Primary)**: `#1DCD9F` — Used for high-impact accents and interactive glows.
- **Electric Mint (Hover)**: `#7AE2CF` — The silky-smooth glow state for text and buttons.
- **Obsidian Black (Background)**: `#000000` — The core cinematic canvas.
- **Silver Dark (Sections)**: `#0D0D0D` — Used for subtle contrast in the catalog and FAQ sections.
- **Champagne Cream (Typography)**: `#FFFDD0` (at 91% lightness) — Soft, readable foreground text.

### Visual Atmosphere
- **Typographic Glow**: Every title and small text line pulses with a light teal aura on hover.
- **Border-Style Counter**: Hero flavor numbers (01-07) feature a transparent stroke that "fills" with color and a dense radiant glow when hovered.
- **GPU-Accelerated**: 60fps transitions driven by hardware acceleration (`gpu-smooth`).
- **Transparency Architecture**: A sleek, clean UI where all buttons (except "ORDER NOW") feature transparent backgrounds.

## 🛠 Tech Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [ShadCN UI](https://ui.shadcn.com/)
- **Backend**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI Engine**: [Genkit v1.x](https://firebase.google.com/docs/genkit) (Google Gemini 2.5 Flash)
- **Performance**: hardware-accelerated WebP sequences and custom CSS animations.

## 🚀 Step-by-Step GitHub Push Guide

Follow these exact steps in your terminal to host this version on your GitHub:

### 1. Initialize Your Local Repository
```bash
git init
```

### 2. Stage and Commit the "Butter-Smooth" Build
```bash
git add .
git commit -m "feat: implement cinematic NECTAR experience with universal text glow"
```

### 3. Create a Remote Repository
- Go to [github.com/new](https://github.com/new).
- Name your repository (e.g., `nectar-juice-app`).
- Keep it "Public" or "Private" and click **Create repository**.

### 4. Connect and Push
Copy the URL of your new repository and run:
```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 🔐 Post-Deployment Checklist
1. **Firebase Console**: Enable "Email/Password" and "Google" providers under Authentication.
2. **Security Rules**: Ensure `firestore.rules` are deployed via the Firebase CLI or Console.
3. **API Keys**: Add `GEMINI_API_KEY` to your environment variables for AI-generated reviews.

---
*Created with Precision for NECTAR BATCH NO. 25*