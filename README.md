
# NECTAR — Cinematic E-Commerce Prototype

NECTAR is a high-performance, cinematic functional beverage brand experience built with Next.js 15, Firebase, and Genkit AI.

## 🚀 How to Push to GitHub

Follow these steps to push this exact version of the project to your GitHub repository:

1. **Initialize Git**:
   Open your terminal in the project root and run:
   ```bash
   git init
   ```

2. **Stage and Commit**:
   Add all files and create your initial commit:
   ```bash
   git add .
   git commit -m "feat: implement butter-smooth NECTAR e-commerce experience"
   ```

3. **Create a GitHub Repository**:
   - Go to [github.com/new](https://github.com/new).
   - Name your repository (e.g., `nectar-juice`).
   - Keep it "Public" or "Private" as preferred.
   - Do **not** initialize with a README, license, or .gitignore.

4. **Connect to Remote**:
   Copy the SSH or HTTPS URL from GitHub and run:
   ```bash
   git remote add origin <https://github.com/ShorifulShanto/NACTER>
   git branch -M main
   ```

5. **Push to GitHub**:
   ```bash
   git push -u origin main
   ```

## ⚠️ Post-Deployment Setup
To ensure Authentication and Firestore work in production:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. **Authentication**: 
   - Enable "Email/Password" sign-in provider.
   - Enable "Google" sign-in provider.
3. **Firestore**: Ensure your security rules are deployed (they are managed in `firestore.rules` within this project).
4. **Environment Variables**: If you use Genkit AI in production, ensure your `GEMINI_API_KEY` is set in your hosting provider's dashboard.

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + ShadCN UI
- **Backend**: Firebase (Auth & Firestore)
- **AI**: Genkit v1.x (Google Gemini)
- **Performance**: GPU-accelerated hardware transitions
