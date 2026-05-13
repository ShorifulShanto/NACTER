"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch, setDoc, serverTimestamp } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { 
  ShoppingBag, 
  ArrowLeft, 
  MapPin, 
  Loader2,
  Trash2,
  Plus,
  Minus,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "cart");
  }, [db, user]);

  const userRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, "users", user.uid);
  }, [db, user]);

  const { data: items, isLoading: isCartLoading } = useCollection(cartQuery);
  const { data: profile } = useDoc(userRef);

  const updateQty = (productId: string, newQty: number) => {
    if (!user || !db) return;
    const itemRef = doc(db, "users", user.uid, "cart", productId);
    if (newQty < 1) {
      deleteDocumentNonBlocking(itemRef);
      return;
    }
    updateDocumentNonBlocking(itemRef, { quantity: newQty });
  };

  const removeItem = (productId: string) => {
    if (!user || !db) return;
    const itemRef = doc(db, "users", user.uid, "cart", productId);
    deleteDocumentNonBlocking(itemRef);
    toast({ title: "Flavor removed from selection" });
  };

  const handlePlaceOrder = async () => {
    if (!user || !db || !items || items.length === 0) return;

    if (!profile?.location || !profile?.firstName) {
      toast({
        title: "Protocol Interrupted",
        description: "Please update your delivery coordinates in your profile before confirming the harvest.",
        variant: "destructive"
      });
      router.push("/profile?edit=true");
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `ORD_${Date.now()}`;
      const orderRef = doc(db, "orders", orderId);

      const orderItems = items.map(item => ({
        productId: item.productId,
        name: item.name || "NECTAR Flavor",
        quantity: item.quantity,
        price: item.priceAtAddToCart || 12.00,
        image: item.image || "https://picsum.photos/seed/juice/400/600"
      }));

      const subtotal = orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const SHIPPING_FEE = 5.00;
      const totalAmount = subtotal + SHIPPING_FEE;

      await setDoc(orderRef, {
        id: orderId,
        userId: user.uid,
        items: orderItems,
        totalAmount,
        status: "pending",
        shippingAddress: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          location: profile.location,
          phoneNumber: profile.phoneNumber || ""
        },
        createdAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });

      const batch = writeBatch(db);
      items.forEach((item) => {
        const itemRef = doc(db, "users", user.uid, "cart", item.id);
        batch.delete(itemRef);
      });
      await batch.commit();

      toast({ title: "Order Transmitted", description: "Your NECTAR harvest is being prepared for dispatch." });
      router.push("/checkout/success");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Transmission Failed", description: e.message });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading || isCartLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  const subtotal = items?.reduce((acc, item) => {
    const itemPrice = item.priceAtAddToCart || 12.00;
    const qty = Number(item.quantity) || 0;
    return acc + (itemPrice * qty);
  }, 0) || 0;
  const SHIPPING_FEE = subtotal > 0 ? 5.00 : 0;
  const total = subtotal + SHIPPING_FEE;

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-32">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16">
            <Link href="/" className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.5em] text-white/30 hover:text-white transition-all mb-8 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Return to Selection
            </Link>
            <h1 className="text-6xl font-headline font-bold uppercase tracking-tighter">Order Summary</h1>
            <p className="text-[10px] text-primary uppercase tracking-[0.6em] mt-3 font-bold">Review your final batch</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-2 space-y-12">
              <div className="space-y-6">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-bold">Selected Flavors</p>
                {items && items.length > 0 ? (
                  items.map((item) => {
                    const price = item.priceAtAddToCart || 12.00;
                    const qty = Number(item.quantity) || 0;
                    
                    return (
                      <div key={item.id} className="bg-white/2 border border-white/5 rounded-3xl p-8 flex items-center gap-8 group hover:border-primary/20 transition-all">
                        <div className="relative w-24 h-24 bg-black/40 rounded-2xl overflow-hidden flex-shrink-0">
                          <Image 
                            src={item.image || "https://picsum.photos/seed/juice/400/600"} 
                            alt={item.name || "NECTAR Flavor"} 
                            fill 
                            className="object-contain p-3" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div>
                               <h4 className="text-sm font-bold uppercase tracking-widest truncate">{item.name || "NECTAR Flavor"}</h4>
                               <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-1">350ml Bottle</p>
                            </div>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-white/10 hover:text-red-500 transition-colors p-2 bg-transparent no-glow"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-8">
                            <div className="flex items-center border border-white/10 rounded-full px-4 py-1.5 bg-black/60">
                              <button onClick={() => updateQty(item.id, qty - 1)} className="p-1 text-white/30 hover:text-white transition-colors bg-transparent no-glow"><Minus size={14} /></button>
                              <span className="w-12 text-center text-[11px] font-bold font-mono tracking-widest">{String(qty)}</span>
                              <button onClick={() => updateQty(item.id, qty + 1)} className="p-1 text-white/30 hover:text-white transition-colors bg-transparent no-glow"><Plus size={14} /></button>
                            </div>
                            <p className="text-lg font-headline font-bold text-primary">${(price * qty).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white/2 border border-white/5 rounded-3xl p-20 text-center">
                    <ShoppingBag className="mx-auto text-white/5 mb-6" size={48} />
                    <p className="text-[10px] uppercase tracking-[0.4em] text-white/20">Your harvest collection is empty</p>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.5em] font-bold">Logistics Protocol</p>
                <div className="bg-white/2 border border-white/5 rounded-3xl p-10 flex items-start gap-8 group">
                  <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MapPin className="text-primary" size={24} />
                  </div>
                  <div className="flex-1">
                    {profile?.location ? (
                      <div className="space-y-2">
                        <p className="text-[14px] font-bold uppercase tracking-widest">{profile.firstName} {profile.lastName}</p>
                        <p className="text-[12px] text-white/40 font-light leading-relaxed max-w-sm">{profile.location}</p>
                        <p className="text-[11px] text-white/20 font-mono mt-4 tracking-widest">{profile.phoneNumber}</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <p className="text-[11px] text-white/40 font-light italic">Delivery coordinates missing from identity profile.</p>
                        <Button asChild variant="outline" className="rounded-full h-12 px-8 uppercase text-[10px] tracking-widest border-white/10 bg-transparent hover:bg-white/5">
                          <Link href="/profile">Update Profile</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-neutral-950 border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.4em] mb-10 border-b border-white/5 pb-6">Final Value</h3>
                
                <div className="space-y-5 mb-12">
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/40">
                    <span>Logistics Fee</span>
                    <span className="font-mono">${SHIPPING_FEE.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full bg-white/5 my-6" />
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">Total Harvest</span>
                    <span className="text-4xl font-headline font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !items?.length}
                    className="w-full h-16 bg-white text-black hover:bg-neutral-200 rounded-full font-bold uppercase tracking-[0.3em] text-[11px] shadow-2xl transition-all active:scale-95 no-glow"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : "Transmit Order"}
                  </Button>
                  <p className="text-[8px] uppercase tracking-[0.5em] text-center text-white/20 font-bold flex items-center justify-center gap-2">
                    <ShieldCheck size={10} /> Secure Identity Verified
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}