"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
import { useUser, useFirestore, useDoc, useAuth, useMemoFirebase, useCollection } from "@/firebase";
import { doc, setDoc, deleteDoc, serverTimestamp, collection, query, where } from "firebase/firestore";
import { signOut, deleteUser } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User as UserIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useUser();
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
    return query(collection(db, "orders"), where("userId", "==", user.uid));
  }, [db, user]);

  const { data: profile } = useDoc(userRef);
  const { data: orders } = useCollection(ordersQuery);

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

      toast({ title: "Profile saved" });
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
      onClose();
      toast({ title: "Signed out" });
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
      onClose();
      toast({ title: "Account deleted" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Please re-auth before deleting." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const displayName = profile?.firstName ? `${profile.firstName} ${profile.lastName}` : (user.displayName || user.email?.split('@')[0]);
  const avatarLetter = (displayName?.[0] || 'U').toUpperCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 border-none bg-transparent shadow-none sm:max-w-[400px] z-[500]">
        <DialogTitle className="sr-only">User Profile Dashboard</DialogTitle>
        <div className="dash-main w-full">
          {/* Dashboard-style Profile Tab */}
          <div className="flex flex-col gap-[12px] animate-card-in">
            
            {/* Top Bar Mimic */}
            <div className="bg-[rgba(255,235,210,0.26)] backdrop-blur-[16px] border border-[rgba(255,255,255,0.38)] rounded-[16px] p-[12px_18px] flex items-center justify-between">
              <div>
                <div className="font-headline font-extrabold text-[18px] text-[#3d1a5e]">My Profile</div>
                <div className="text-[11px] text-[#5a2d6e]/55">Welcome to NECTAR</div>
              </div>
              <div className="flex gap-2">
                <button className="bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.45)] rounded-[9px] p-[7px_9px] cursor-pointer text-[14px]">🔔</button>
                <button onClick={onClose} className="bg-[rgba(255,255,255,0.45)] border border-[rgba(255,255,255,0.45)] rounded-[9px] p-[7px_9px] cursor-pointer text-[14px]">✕</button>
              </div>
            </div>

            <div className="bg-[rgba(255,235,210,0.3)] backdrop-blur-[14px] border border-[rgba(255,255,255,0.4)] rounded-[18px] p-[18px] space-y-4">
              <div className="flex items-center gap-[13px]">
                <div className="w-[50px] h-[50px] rounded-full bg-gradient-to-br from-[#7030b0] to-[#a03070] flex items-center justify-center font-headline font-extrabold text-[20px] text-white">
                  {avatarLetter}
                </div>
                <div className="profile-info">
                  <h3 className="font-headline font-extrabold text-[15px] text-[#3d1a5e] leading-tight">{displayName}</h3>
                  <p className="text-[11px] text-[#5a2d6e]/55">{user.email}</p>
                  <span className="inline-block bg-[rgba(40,180,90,0.18)] text-[#1a6a38] rounded-[20px] text-[9px] font-semibold p-[2px_9px] mt-1">Active</span>
                </div>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="ml-auto p-[7px_13px] bg-[rgba(255,255,255,0.55)] border border-[rgba(255,255,255,0.55)] rounded-[9px] text-[11px] font-semibold text-[#3d1a5e] cursor-pointer hover:bg-white/70 transition-colors"
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              <div className="flex gap-[10px]">
                <div className="flex-1 bg-white/30 rounded-[12px] p-[12px] text-center">
                  <div className="font-headline font-extrabold text-[18px] text-[#3d1a5e]">{orders?.length || 0}</div>
                  <div className="text-[10px] text-[#5a2d6e]/55 mt-[2px]">Orders</div>
                </div>
                <div className="flex-1 bg-white/30 rounded-[12px] p-[12px] text-center">
                  <div className="font-headline font-extrabold text-[18px] text-[#b03070]">24</div>
                  <div className="text-[10px] text-[#5a2d6e]/55 mt-[2px]">Favorites</div>
                </div>
                <div className="flex-1 bg-white/30 rounded-[12px] p-[12px] text-center">
                  <div className="font-headline font-extrabold text-[18px] text-[#c07020]">4.8⭐</div>
                  <div className="text-[10px] text-[#5a2d6e]/55 mt-[2px]">Ratings</div>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleUpdate} className="bg-[rgba(255,235,210,0.3)] backdrop-blur-[14px] border border-[rgba(255,255,255,0.4)] rounded-[18px] p-[18px] space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="First Name"
                    className="bg-[#fff8ee]/48 border-white/40 h-[40px] text-[13px] rounded-[10px] text-[#3d1a5e]"
                  />
                  <Input 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Last Name"
                    className="bg-[#fff8ee]/48 border-white/40 h-[40px] text-[13px] rounded-[10px] text-[#3d1a5e]"
                  />
                </div>
                <Input 
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="Phone"
                  className="bg-[#fff8ee]/48 border-white/40 h-[40px] text-[13px] rounded-[10px] text-[#3d1a5e]"
                />
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Location"
                  className="bg-[#fff8ee]/48 border-white/40 h-[40px] text-[13px] rounded-[10px] text-[#3d1a5e]"
                />
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-[40px] bg-[#740A03] text-[#FFC193] font-semibold rounded-[50px] text-[14px] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : "Save Profile"}
                </button>
              </form>
            ) : (
              <>
                <div className="flex items-center justify-between px-2">
                  <h4 className="font-headline font-extrabold text-[14px] text-[#3d1a5e]">Recent Order</h4>
                  <Link href="/orders" onClick={onClose} className="text-[11px] text-[#8040c0] font-semibold">View All</Link>
                </div>
                {orders?.[0] ? (
                  <div className="flex items-center gap-[12px] bg-white/30 rounded-[12px] p-[12px]">
                    <div className="text-[28px]">🍊</div>
                    <div className="order-info">
                      <h5 className="text-[13px] font-semibold text-[#3d1a5e]">{orders[0].items[0].name}</h5>
                      <p className="text-[10px] text-[#5a2d6e]/48 mt-[1px]">{orders[0].items.length} Bottles • 10 Apr 2026</p>
                    </div>
                    <div className="ml-auto text-right">
                      <span className="bg-[rgba(40,180,90,0.18)] text-[#1a6a38] rounded-[20px] text-[9px] font-semibold p-[2px_9px] inline-block mb-1">Delivered</span>
                      <div className="font-headline font-extrabold text-[13px] text-[#3d1a5e]">${orders[0].totalAmount.toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center bg-white/20 border border-dashed border-white/10 rounded-[18px]">
                    <p className="text-[11px] text-[#5a2d6e]/55 font-medium">No orders yet</p>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2">
                  <button 
                    onClick={handleSignOut}
                    className="w-full h-[45px] bg-[#8a2020]/10 border border-[#8a2020]/20 text-[#8a2020] font-semibold rounded-[12px] text-[13px] hover:bg-[#8a2020]/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🚪</span> Logout
                  </button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="w-full py-2 text-[10px] uppercase tracking-[0.4em] text-red-500/40 hover:text-red-500 font-bold transition-colors">
                        Delete Account
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-black/90 border-white/10 text-[#FFC193] rounded-[2rem]">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="uppercase tracking-widest font-headline">End the Harvest?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[#FFC193]/40 text-sm">
                          This will permanently delete your selection, order history, and profile.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-white/5 border-white/10 text-[#FFC193] hover:bg-white/10 rounded-full">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-500 text-white hover:bg-red-600 rounded-full">Delete Forever</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}