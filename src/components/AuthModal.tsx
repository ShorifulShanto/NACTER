"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { AuthSocial } from "@/components/auth/AuthSocial";
import { useRouter } from "next/navigation";

type AuthView = "login" | "signup" | "forgot-password";

export function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();

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
        onClose();
        toast({ title: "Welcome back to NECTAR" });
        router.refresh();
      } else if (view === "signup") {
        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCred.user, { displayName: name });
        }
        await syncUserToFirestore(userCred.user);
        onClose();
        toast({ title: "Welcome to NECTAR" });
        router.refresh();
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
      onClose();
      toast({ title: "Welcome to NECTAR" });
      router.refresh();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign-In Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-[3px] border-primary bg-black max-w-[900px] w-[95vw] min-[720px]:w-full h-auto overflow-hidden rounded-[2.5rem] flex flex-col min-[720px]:flex-row sm:min-h-[500px] z-[500]">
        <DialogTitle className="sr-only">Authentication</DialogTitle>
        
        <div className="flex-[0.4] min-[720px]:flex-[0.55] relative overflow-hidden bg-black border-b min-[720px]:border-b-0 min-[720px]:border-r border-primary/20 min-h-[250px] min-[720px]:min-h-0">
          <Image 
            src="https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777057652/334fab87-6bd2-410d-93e5-5a4bc04edda9.png"
            alt="NECTAR Brand Experience"
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex-1 min-[720px]:flex-[0.45] p-8 min-[720px]:p-12 relative flex flex-col justify-center bg-black">
          <div className="max-w-[300px] mx-auto w-full space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-headline font-black text-primary uppercase tracking-tight">
                {view === "login" ? "Login" : view === "signup" ? "Sign Up" : "Reset"}
              </h2>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {view === "signup" && (
                <div className="space-y-1.5">
                  <Input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="h-11 bg-white/5 border-none rounded-xl text-white px-4 text-sm"
                    required
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email Address"
                  className="h-11 bg-white/5 border-none rounded-xl text-white px-4 text-sm"
                  required
                />
              </div>
              {view !== "forgot-password" && (
                <div className="space-y-1.5">
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="h-11 bg-white/5 border-none rounded-xl text-white px-4 text-sm"
                    required
                  />
                </div>
              )}
              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 bg-primary text-black font-bold rounded-xl text-[11px] uppercase tracking-widest hover:bg-[#7AE2CF] transition-all shadow-[0_0_15px_rgba(29,205,159,0.2)] mt-2"
              >
                {isLoading ? <Loader2 className="animate-spin mx-auto" size={16} /> : <span>{view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Reset Password"}</span>}
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

            <div className="text-center pt-2 space-y-2">
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
                className="text-[10px] font-bold text-white/40 hover:text-primary transition-colors uppercase tracking-widest"
              >
                {view === "login" ? "Need an account? Sign Up" : "Already a member? Sign In"}
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
