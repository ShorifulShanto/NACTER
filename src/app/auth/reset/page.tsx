
"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/firebase";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  
  const oobCode = searchParams.get('oobCode');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isValidCode, setIsValidCode] = useState<boolean | null>(null);

  useEffect(() => {
    if (oobCode) {
      verifyPasswordResetCode(auth, oobCode)
        .then((email) => {
          setEmail(email);
          setIsValidCode(true);
        })
        .catch(() => {
          setIsValidCode(false);
          toast({ variant: "destructive", title: "Invalid Link", description: "The reset link has expired or is invalid." });
        });
    }
  }, [auth, oobCode, toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oobCode) return;
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Mismatch", description: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      toast({ title: "Password Updated", description: "Security protocol complete. You can now sign in." });
      router.push("/auth");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidCode === false) {
    return (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="text-red-500" size={32} />
        </div>
        <h2 className="text-2xl font-headline font-bold text-red-500 uppercase tracking-widest">Invalid Link</h2>
        <p className="text-white/40 text-[10px] uppercase tracking-widest max-w-[200px] mx-auto">This reset link has expired or has already been used.</p>
        <Button asChild variant="outline" className="rounded-full px-8 border-white/10 uppercase text-[10px] tracking-widest">
          <Link href="/auth">Back to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[320px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bold mb-2">SECURITY PROTOCOL</p>
        <h2 className="text-4xl font-headline font-black text-primary uppercase tracking-tight">New Password</h2>
        {email && <p className="text-[10px] text-white/20 mt-2 font-mono uppercase tracking-widest">For: {email}</p>}
      </div>

      <form onSubmit={handleReset} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">New Password</label>
          <Input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 bg-white/5 border-none rounded-xl text-white px-4 focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Confirm Identity</label>
          <Input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="h-12 bg-white/5 border-none rounded-xl text-white px-4 focus:ring-2 focus:ring-primary text-sm"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading || !isValidCode}
          className="w-full h-12 bg-primary text-black font-bold rounded-xl text-[12px] uppercase tracking-widest hover:bg-[#7AE2CF] transition-all flex items-center justify-center gap-2 mt-4 shadow-[0_0_20px_rgba(29,205,159,0.3)]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Update Password</span>}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <Image 
          src="https://res.cloudinary.com/dhzt5kvoz/image/upload/v1777057652/334fab87-6bd2-410d-93e5-5a4bc04edda9.png"
          alt="Atmosphere"
          fill
          className="object-cover"
        />
      </div>
      <div className="relative z-10 w-full max-w-md bg-black/40 backdrop-blur-3xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
        <Suspense fallback={<div className="flex justify-center"><Loader2 className="animate-spin text-primary" size={32} /></div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
      
      <Link href="/" className="fixed bottom-10 text-[10px] uppercase tracking-[0.5em] text-white/20 hover:text-primary transition-all font-bold flex items-center gap-2">
        <ArrowRight size={14} className="rotate-180" /> Back to Home
      </Link>
    </div>
  );
}
