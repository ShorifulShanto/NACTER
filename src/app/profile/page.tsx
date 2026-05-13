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

      toast({ title: "Profile Synchronized", description: "Your harvest records have been updated." });
      setIsEditing(false);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed out successfully" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sign out failed" });
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !db) return;
    setIsLoading(true);
    try {
      const uid = user.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(user);
      toast({ title: "Account Terminated" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Please re-authenticate to perform this action." });
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
        <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-8">
          <UserIcon className="text-primary" size={32} />
        </div>
        <h1 className="text-4xl font-headline font-bold uppercase tracking-tight mb-4">Identity Required</h1>
        <p className="text-white/40 text-sm max-w-xs mb-8 uppercase tracking-[0.3em] font-medium">Please sign in to access your NECTAR profile.</p>
        <Button asChild className="rounded-full px-10 h-14 bg-white text-black hover:bg-neutral-200 uppercase tracking-widest text-[10px] font-bold">
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 pb-12 border-b border-white/5">
            <div>
              <p className="text-primary text-[9px] uppercase tracking-[0.5em] mb-4 font-bold">Member Dashboard</p>
              <h1 className="text-5xl md:text-7xl font-headline font-bold uppercase tracking-tighter">My Account</h1>
            </div>
            <div className="flex gap-4">
              <Button 
                onClick={() => setIsEditing(!isEditing)} 
                variant="outline" 
                className="rounded-full h-12 px-8 border-white/10 hover:bg-white/5 uppercase tracking-widest text-[10px] font-bold transition-all"
              >
                <Settings size={14} className="mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </Button>
              <Button 
                onClick={handleSignOut} 
                variant="ghost" 
                className="rounded-full h-12 px-8 text-white/40 hover:text-red-500 uppercase tracking-widest text-[10px] font-bold"
              >
                <LogOut size={14} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="space-y-8">
              <div className="bg-white/5 border border-white/5 rounded-3xl p-10 backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                  <UserIcon size={120} />
                </div>
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center font-headline font-bold text-3xl text-primary mb-6 shadow-2xl">
                    {displayName[0].toUpperCase()}
                  </div>
                  <h3 className="text-2xl font-headline font-bold uppercase tracking-widest mb-2">{displayName}</h3>
                  <p className="text-[11px] text-white/30 uppercase tracking-[0.2em] flex items-center gap-2 mb-8">
                    <Mail size={12} className="text-primary" />
                    {user.email}
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 text-white/40 hover:text-white transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <MapPin size={14} />
                      </div>
                      <p className="text-[11px] uppercase tracking-widest">{profile?.location || "Address not set"}</p>
                    </div>
                    <div className="flex items-center gap-4 text-white/40 hover:text-white transition-colors">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        <Phone size={14} />
                      </div>
                      <p className="text-[11px] uppercase tracking-widest font-mono">{profile?.phoneNumber || "No phone listed"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 border border-red-500/10 rounded-3xl bg-red-500/5 group hover:bg-red-500/10 transition-colors">
                <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.4em] mb-4">Danger Zone</h4>
                <p className="text-[11px] text-white/30 font-light leading-relaxed mb-6">Permanent deletion of your harvest records and profile data.</p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" className="w-full justify-start h-12 p-0 text-red-500/60 hover:text-red-500 uppercase tracking-widest text-[9px] font-bold">
                      <Trash2 size={14} className="mr-2" />
                      Delete Identity
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-black border-white/10 text-white rounded-[2rem]">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="font-headline tracking-widest uppercase flex items-center gap-2 text-red-500">
                        <ShieldAlert size={20} />
                        End the Harvest?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-white/40 text-sm">
                        This action is irreversible. All order history, profile data, and NECTAR rewards will be lost forever.
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

            <div className="lg:col-span-2 space-y-8">
              {isEditing ? (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-12 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h3 className="text-xl font-headline font-bold uppercase tracking-[0.3em] mb-12">Update Credentials</h3>
                  <form onSubmit={handleUpdate} className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">First Name</label>
                        <Input 
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="h-14 bg-black/40 border-white/5 rounded-2xl text-sm px-6 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Last Name</label>
                        <Input 
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="h-14 bg-black/40 border-white/5 rounded-2xl text-sm px-6 focus:ring-primary"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Physical Location</label>
                      <Input 
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="h-14 bg-black/40 border-white/5 rounded-2xl text-sm px-6 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-white/20 ml-2">Primary Phone</label>
                      <Input 
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        className="h-14 bg-black/40 border-white/5 rounded-2xl text-sm px-6 font-mono focus:ring-primary"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-full uppercase tracking-[0.3em] text-[11px] font-black shadow-2xl transition-all active:scale-95"
                    >
                      {isLoading ? <Loader2 className="animate-spin" size={20} /> : "Synchronize Records"}
                    </Button>
                  </form>
                </div>
              ) : (
                <div className="space-y-12">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center px-2">
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-white/20">Recent Activity</h4>
                      <Link href="/orders" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:text-white transition-colors flex items-center gap-2">
                        View History <ArrowRight size={12} />
                      </Link>
                    </div>

                    {recentOrders && recentOrders.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4">
                        {recentOrders.map((order) => (
                          <div key={order.id} className="bg-white/5 border border-white/5 rounded-3xl p-8 flex items-center justify-between group hover:border-primary/20 transition-all">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-center">
                                <Package className="text-white/20 group-hover:text-primary transition-colors" size={24} />
                              </div>
                              <div>
                                <h5 className="text-[13px] font-bold uppercase tracking-widest">{order.items[0].name}</h5>
                                <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1">
                                  {order.items.length} Bottle{order.items.length > 1 ? 's' : ''} • {order.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-headline font-bold text-primary">${order.totalAmount.toFixed(2)}</p>
                              <p className="text-[9px] text-white/10 uppercase tracking-widest font-mono mt-1">{order.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-20 text-center border border-dashed border-white/10 rounded-[2.5rem] bg-transparent opacity-40">
                        <p className="text-[10px] uppercase tracking-[0.5em] font-bold">No harvest history recorded</p>
                        <Button asChild variant="ghost" className="mt-6 text-primary uppercase tracking-widest text-[9px] hover:bg-primary/5">
                          <Link href="/#product">Start Your Journey</Link>
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