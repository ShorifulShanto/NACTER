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
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
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
    const snap = await getDoc(userRef);
    
    await setDoc(userRef, {
      id: user.uid,
      email: user.email,
      updatedAt: serverTimestamp(),
      ...(snap.exists() ? {} : {
        createdAt: serverTimestamp(),
        firstName: name.split(' ')[0] || user.displayName?.split(' ')[0] || "",
        lastName: name.split(' ').slice(1).join(' ') || user.displayName?.split(' ').slice(1).join(' ') || "",
        phoneNumber: "",
        location: ""
      })
    }, { merge: true });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (view === "login") {
        const userCred = await signInWithEmailAndPassword(auth, email, password);
        await syncUserToFirestore(userCred.user);
        toast({ title: "Welcome back to NECTAR" });
        router.push("/");
      } else if (view === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
        await syncUserToFirestore(userCred.user);
        toast({ title: "Welcome to NECTAR" });
        router.push("/");
      } else if (view === "forgot-password") {
        await sendPasswordResetEmail(auth, email);
        toast({ title: "Reset link sent", description: "Please check your inbox." });
        setView("login");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "Auth Failed", 
        description: error.message 
      });
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
      toast({ title: "Welcome to NECTAR" });
      router.push("/");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-In Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-[100svh] w-full bg-black flex items-center justify-center p-4 min-[720px]:p-10 font-body overflow-y-auto gpu-smooth">
      <div className="relative w-full max-w-[900px] bg-black border-[3px] border-primary shadow-[0_0_60px_rgba(29,205,159,0.15)] rounded-[2rem] min-[720px]:rounded-[3rem] overflow-hidden flex flex-col min-[720px]:flex-row">
        
        {/* Brand Image Header (Stacked mobile, split desktop) */}
        <div className="flex-[0.4] min-[720px]:flex-[0.55] relative overflow-hidden bg-black border-b min-[720px]:border-b-0 min-[720px]:border-r border-primary/30 min-h-[300px] min-[720px]:min-h-0">
          <Image 
            src="https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777057652/334fab87-6bd2-410d-93e5-5a4bc04edda9.png"
            alt="NECTAR Brand Experience"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 min-[720px]:flex-[0.45] bg-black flex flex-col items-center justify-center p-8 min-[720px]:p-10 relative">
          <div className="w-full max-w-[320px] space-y-8">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-2">NECTAR BATCH NO. 25</p>
              <h2 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">
                {view === "login" ? "Login" : view === "signup" ? "Sign Up" : "Reset"}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {view === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Full Name</label>
                  <Input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="h-12 bg-white/5 border-none rounded-xl text-white px-4 focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="h-12 bg-white/5 border-none rounded-xl text-white px-4 focus:ring-2 focus:ring-primary text-sm"
                  required
                />
              </div>

              {view !== "forgot-password" && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-12 bg-white/5 border-none rounded-xl text-white px-4 focus:ring-2 focus:ring-primary text-sm"
                    required
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 bg-primary text-black font-bold rounded-xl text-[12px] uppercase tracking-widest hover:bg-[#7AE2CF] transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(29,205,159,0.3)] mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>{view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"}</span>}
              </button>
            </form>

            {view !== "forgot-password" && (
              <>
                <div className="relative flex items-center gap-4">
                  <div className="flex-1 h-[1px] bg-white/10" />
                  <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">or</span>
                  <div className="flex-1 h-[1px] bg-white/10" />
                </div>

                <AuthSocial onGoogle={handleGoogleSignIn} isLoading={isLoading} />
              </>
            )}

            <div className="text-center pt-2 space-y-3">
              {view === "login" && (
                <button 
                  onClick={() => setView("forgot-password")}
                  className="block w-full text-[10px] font-bold text-white/30 hover:text-primary transition-colors uppercase tracking-widest"
                >
                  Forgot Password?
                </button>
              )}
              
              <button 
                onClick={() => setView(view === "login" ? "signup" : "login")}
                className="text-[11px] font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {view === "login" ? "Need an account? Sign Up" : "Already a member? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Link href="/" className="fixed bottom-6 text-[11px] uppercase tracking-[0.5em] text-white/40 hover:text-primary transition-all font-bold flex items-center gap-2 z-50 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full">
        <ArrowRight size={16} className="rotate-180" /> Back to Home
      </Link>
    </div>
  );
}
