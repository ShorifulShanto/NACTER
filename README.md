# NECTAR — Cinematic E-Commerce Prototype

NECTAR is a high-performance, cinematic functional beverage brand experience built with Next.js 15, Firebase, and Genkit AI.

## 🚀 How to Push to GitHub

Follow these steps in your terminal to push this exact version to your repository:

1. **Initialize Git**:
   ```bash
   git init
   ```

2. **Stage and Commit**:
   ```bash
   git add .
   git commit -m "feat: implement butter-smooth NECTAR experience"
   ```

3. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g., `nectar-juice`).
   - Keep it "Public".

4. **Connect and Push**:
   Copy the URL from GitHub (e.g., `https://github.com/YOUR_USERNAME/nectar-juice.git`) and run:
   ```bash
   git remote add origin YOUR_REPO_URL
   git branch -M main
   git push -u origin main
   ```

## ⚠️ Post-Deployment Setup
1. **Firebase Authentication**: Enable "Email/Password" and "Google" providers in the console.
2. **Security Rules**: Ensure `firestore.rules` are deployed.
3. **Environment Variables**: Set `GEMINI_API_KEY` for Genkit AI features.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase (Auth & Firestore)
- **AI**: Genkit v1.x (Google Gemini)
- **Performance**: GPU-accelerated hardware transitions
