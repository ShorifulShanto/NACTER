"use client";

import { useState, useEffect } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider,
  signInWithPopup,
  User,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { AuthSocial } from "@/components/auth/AuthSocial";
import { useRouter } from "next/navigation";

type AuthView = "login" | "signup" | "forgot-password";

export default function NectarAuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const syncUserToFirestore = async (user: User) => {
    if (!db) return;
    const userRef = doc(db, "users", user.uid);
    try {
      await setDoc(userRef, {
        id: user.uid,
        email: user.email,
        updatedAt: serverTimestamp(),
        firstName: name.split(' ')[0] || user.displayName?.split(' ')[0] || "",
        lastName: name.split(' ').slice(1).join(' ') || user.displayName?.split(' ').slice(1).join(' ') || "",
        createdAt: serverTimestamp(),
      }, { merge: true });
    } catch (e: any) {
      console.warn("Firestore sync delayed:", e.message);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === "login") {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(userCred.user);
        toast({ title: "Identity Confirmed", description: "Welcome back to the NECTAR grove." });
        router.push("/");
      } else if (view === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
        await syncUserToFirestore(userCred.user);
        toast({ title: "Welcome to NECTAR", description: "Your journey into pure cold-pressed essence begins." });
        router.push("/");
      } else if (view === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Recovery Pulse Sent", description: "Security protocol initiated. Check your inbox for the reset link." });
        setView("login");
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Authentication Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const userCred = await signInWithPopup(auth, provider);
      await syncUserToFirestore(userCred.user);
      toast({ title: "Identity Verified", description: "Connected via Google Secure Access." });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-In Error", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-6 lg:p-12 font-body gpu-smooth">
      <div className="relative w-full max-w-[950px] bg-black border-[3px] border-primary/40 shadow-[0_0_80px_rgba(29,205,159,0.1)] rounded-[3rem] overflow-hidden flex flex-col lg:flex-row">
        
        <div className="flex-[0.55] relative overflow-hidden bg-black border-r border-white/5 min-h-[350px] lg:min-h-[600px]">
          <Image 
            src="https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777057652/334fab87-6bd2-410d-93e5-5a4bc04edda9.png"
            alt="NECTAR Cinematic Branding"
            fill
            className="object-cover opacity-80"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent opacity-60" />
        </div>

        <div className="flex-1 p-10 lg:p-16 relative flex flex-col items-center justify-center bg-[#050505]">
          <div className="w-full max-w-[340px] space-y-10">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.5em] text-white/20 font-bold mb-3">BATCH NO. 25 SECURITY</p>
              <h2 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">
                {view === "login" ? "Login" : view === "signup" ? "Sign Up" : "Recovery"}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {view === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Member Name</label>
                  <Input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white px-6 focus:ring-1 focus:ring-primary text-sm transition-all"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Email Protocol</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-12 bg-white/5 border-white/5 rounded-2xl text-white px-6 focus:ring-1 focus:ring-primary text-sm transition-all"
                  required
                />
              </div>

              {view !== "forgot-password" && (
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/30 ml-1">Access Token</label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-white/5 border-white/5 rounded-2xl text-white px-6 focus:ring-1 focus:ring-primary text-sm transition-all"
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 bg-primary text-black font-bold rounded-full text-[11px] uppercase tracking-[0.3em] hover:bg-[#7AE2CF] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 mt-6 shadow-[0_10px_30px_rgba(29,205,159,0.2)] no-glow"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <span>{view === "login" ? "Authorize Entry" : view === "signup" ? "Create Identity" : "Transmit Link"}</span>}
              </button>
            </form>

            {view !== "forgot-password" && (
              <>
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-white/5" />
                  <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1px] bg-white/5" />
                </div>

                <AuthSocial onGoogle={handleGoogleSignIn} isLoading={isLoading} />
              </>
            )}

            <div className="text-center pt-4 space-y-4">
              {view === "login" && (
                <button 
                  onClick={() => setView("forgot-password")}
                  className="block w-full text-[9px] font-bold text-white/20 hover:text-primary transition-colors uppercase tracking-[0.3em] no-glow"
                >
                  Forgot Password?
                </button>
              )}
              
              <button 
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-[10px] font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-[0.3em] no-glow"
              >
                {view === "login" ? "Need an account? Sign Up" : "Already a member? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link href="/" className="fixed bottom-10 text-[10px] uppercase tracking-[0.6em] text-white/20 hover:text-primary transition-all font-bold flex items-center gap-3 z-50 bg-black/40 backdrop-blur-xl px-8 py-3 rounded-full border border-white/5">
        <ArrowRight size={14} className="rotate-180" /> Back to Grove
      </Link>
    </div>
  );
}