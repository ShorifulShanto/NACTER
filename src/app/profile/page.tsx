"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase, useCollection } from "@/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where, limit } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  Loader2, 
  User as UserIcon, 
  Package, 
  Settings, 
  LogOut, 
  Trash2, 
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";

export default function ProfilePage() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const ordersQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "orders"), 
      where("userId", "==", user.uid),
      limit(3)
    );
  }, [db, user]);

  const { data: profile, isLoading: isProfileLoading } = useDoc(userRef);
  const { data: recentOrders } = useCollection(ordersQuery);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phoneNumber: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        location: profile.location || "",
        phoneNumber: profile.phoneNumber || "",
      });
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db) return;
    setIsLoading(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        ...formData,
        email: user.email,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      toast({ title: "Profile Synchronized", description: "Your NECTAR identity records have been updated." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Session Terminated", description: "Signed out successfully." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Termination Failed" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !db) return;
    setIsLoading(true);
    try {
      const uid = user.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
      toast({ title: "Identity Terminated", description: "Account and records purged." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Purge Failed", description: "Please re-authenticate before performing this action." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mb-10">
          <UserIcon className="text-primary" size={40} />
        </div>
        <h1 className="text-5xl font-headline font-bold uppercase tracking-tight mb-4">Identity Protocol</h1>
        <p className="text-white/30 text-[10px] max-w-xs mb-10 uppercase tracking-[0.4em] font-bold">Please authorize access to view your NECTAR profile.</p>
        <Button asChild className="rounded-full px-12 h-16 bg-white text-black hover:bg-neutral-200 uppercase tracking-widest text-[11px] font-black shadow-2xl">
          <Link href="/auth">Sign In Now</Link>
        </Button>
      </main>
    );
  }

  const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user.displayName || user.email?.split('@')[0]);

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-20 pb-16 border-b border-white/5">
            <div>
              <p className="text-primary text-[10px] uppercase tracking-[0.6em] mb-4 font-bold">Member Portal</p>
              <h1 className="text-6xl lg:text-8xl font-headline font-bold uppercase tracking-tighter">My Account</h1>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant="outline" 
                className="rounded-full h-14 px-10 border-white/10 hover:bg-white/5 uppercase tracking-widest text-[11px] font-bold transition-all no-glow"
              >
                <Settings size={16} className="mr-2" />
                {isEditing ? "Dismiss" : "Adjust Profile"}
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                className="rounded-full h-14 px-10 text-white/30 hover:text-red-500 uppercase tracking-widest text-[11px] font-bold no-glow"
              >
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="space-y-12">
              <div className="bg-white/2 border border-white/5 rounded-[2.5rem] p-12 backdrop-blur-3xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:text-primary/10 transition-colors pointer-events-none">
                  <UserIcon size={160} />
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 bg-primary/20 rounded-3xl flex items-center justify-center font-headline font-bold text-4xl text-primary mb-8 shadow-2xl">
                    {displayName[0].toUpperCase()}
                  </div>
                  <h3 className="text-3xl font-headline font-bold uppercase tracking-widest mb-3">{displayName}</h3>
                  <p className="text-[12px] text-white/30 uppercase tracking-[0.3em] flex items-center gap-3 mb-12">
                    <Mail size={14} className="text-primary" />
                    {user.email}
                  </p>
                  
                  <div className="space-y-6">
                    <div className="flex items-center gap-5 text-white/40 hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                        <MapPin size={16} />
                      </div>
                      <p className="text-[12px] uppercase tracking-widest leading-tight">{profile?.location || "Address not defined"}</p>
                    </div>
                    <div className="flex items-center gap-5 text-white/40 hover:text-white transition-colors">
                      <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center">
                        <Phone size={16} />
                      </div>
                      <p className="text-[12px] uppercase tracking-widest font-mono">{profile?.phoneNumber || "No contact listed"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-10 border border-red-500/10 rounded-[2rem] bg-red-500/2 group hover:bg-red-500/5 transition-colors">
                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.5em] mb-4 flex items-center gap-2">
                  <ShieldAlert size={12} /> Restricted Zone
                </h4>
                <p className="text-[11px] text-white/20 font-light leading-relaxed mb-8">Permanently purge your NECTAR records and identity.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start h-12 p-0 text-red-500/40 hover:text-red-500 uppercase tracking-widest text-[10px] font-bold no-glow">
                      <Trash2 size={16} className="mr-3" />
                      Decommission Identity
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black border-white/10 text-white rounded-[3rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-headline tracking-widest uppercase flex items-center gap-3 text-red-500">
                        <ShieldAlert size={24} />
                        End the Cycle?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-white/40 text-sm">
                        This action is non-reversible. All order history and NECTAR status will be lost forever.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full">Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 text-white hover:bg-red-600 rounded-full">Delete Forever</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-12">
              {isEditing ? (
                <div className="bg-white/2 border border-white/10 rounded-[3rem] p-16 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                  <h3 className="text-2xl font-headline font-bold uppercase tracking-[0.4em] mb-16">Adjust Credentials</h3>
                  <form onSubmit={handleUpdate} className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-3">First Name</label>
                        <Input 
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="h-16 bg-black/40 border-white/5 rounded-2xl text-[13px] px-8 focus:ring-primary transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-3">Last Name</label>
                        <Input 
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="h-16 bg-black/40 border-white/5 rounded-2xl text-[13px] px-8 focus:ring-primary transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-3">Physical Location</label>
                      <Input 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="h-16 bg-black/40 border-white/5 rounded-2xl text-[13px] px-8 focus:ring-primary transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-3">Primary Contact</label>
                      <Input 
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="h-16 bg-black/40 border-white/5 rounded-2xl text-[13px] px-8 font-mono tracking-widest focus:ring-primary transition-all"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-full uppercase tracking-[0.4em] text-[12px] font-black shadow-2xl transition-all active:scale-95 no-glow"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={24} /> : "Synchronize Identity"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="space-y-8">
                    <div className="flex justify-between items-center px-4">
                      <h4 className="text-[12px] font-bold uppercase tracking-[0.5em] text-white/20">Recent Harvests</h4>
                      <Link href="/orders" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-3 no-glow">
                        View History <ArrowRight size={14} />
                      </Link>
                    </div>

                    {recentOrders && recentOrders.length > 0 ? (
                      <div className="grid grid-cols-1 gap-6">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="bg-white/2 border border-white/5 rounded-[2rem] p-10 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-8">
                              <div className="w-16 h-16 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center">
                                <Package className="text-white/10 group-hover:text-primary transition-colors" size={32} />
                              </div>
                              <div>
                                <h5 className="text-[15px] font-bold uppercase tracking-widest">{order.items[0].name}</h5>
                                <p className="text-[10px] text-white/20 uppercase tracking-[0.3em] mt-2">
                                  {order.items.length} Units • {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-headline font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
                              <p className="text-[9px] text-white/10 uppercase tracking-[0.2em] font-mono mt-2">{order.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-32 text-center border border-dashed border-white/5 rounded-[3rem] bg-transparent opacity-30">
                        <p className="text-[11px] uppercase tracking-[0.6em] font-bold">Zero harvest history detected</p>
                        <Button asChild variant="ghost" className="mt-10 text-primary uppercase tracking-widest text-[10px] hover:bg-primary/5 no-glow">
                          <Link href="/#product">Explore the Collection</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}