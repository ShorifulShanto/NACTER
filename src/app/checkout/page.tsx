"use client";

import { useState } from "react";
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc, writeBatch } from "firebase/firestore";
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
  Minus
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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

    const isProfileIncomplete = !profile?.firstName || !profile?.lastName || !profile?.location;
    
    if (isProfileIncomplete) {
      toast({
        title: "Profile Incomplete",
        description: "Please update your delivery details in your profile before confirmation.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const orderId = `ORD_${Date.now()}`;
      const ordersRef = collection(db, "orders");
      const orderRef = doc(ordersRef, orderId);

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

      setDocumentNonBlocking(orderRef, {
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
        createdAt: new Date().toISOString()
      }, { merge: true });

      const hubRef = collection(db, "central_hub");
      addDocumentNonBlocking(hubRef, {
        type: "order_placed",
        userId: user.uid,
        userEmail: user.email,
        payload: { orderId, totalAmount },
        timestamp: new Date().toISOString()
      });

      const batch = writeBatch(db);
      items.forEach((item) => {
        const itemRef = doc(db, "users", user.uid, "cart", item.id);
        batch.delete(itemRef);
      });
      await batch.commit();

      toast({ title: "Order Confirmed", description: "Your harvest is being prepared." });
      router.push("/checkout/success");
    } catch (e: any) {
      toast({ variant: "destructive", title: "Order Failed", description: e.message });
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all mb-8 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
              Back to Selection
            </Link>
            <h1 className="text-5xl font-headline font-bold uppercase tracking-tighter">Order Summary</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.5em] mt-2 font-bold">Review your final batch</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Included Flavors</p>
                {items && items.length > 0 ? (
                  items.map((item) => {
                    const price = item.priceAtAddToCart || 12.00;
                    const qty = Number(item.quantity) || 0;
                    const imageSrc = (typeof item.image === 'string' && item.image) ? item.image : "https://picsum.photos/seed/juice/400/600";
                    
                    return (
                      <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 flex items-center gap-6 group">
                        <div className="relative w-20 h-20 bg-black/40 rounded-xl overflow-hidden flex-shrink-0">
                          <Image 
                            src={imageSrc} 
                            alt={item.name || "NECTAR Flavor"} 
                            fill 
                            className="object-contain p-2" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold uppercase tracking-widest truncate">{item.name || "NECTAR Flavor"}</h4>
                            <button 
                              onClick={() => removeItem(item.id)}
                              className="text-white/20 hover:text-red-500 transition-colors p-1"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center mt-6">
                            <div className="flex items-center border border-white/10 rounded-full px-3 py-1 bg-black/40">
                              <button 
                                onClick={() => updateQty(item.id, qty - 1)}
                                className="p-1 text-white/40 hover:text-white transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="w-10 text-center text-xs font-bold font-mono">{String(qty)}</span>
                              <button 
                                onClick={() => updateQty(item.id, qty + 1)}
                                className="p-1 text-white/40 hover:text-white transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-sm font-bold text-primary">${(price * qty).toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white/5 border border-white/5 rounded-2xl p-12 text-center">
                    <ShoppingBag className="mx-auto text-white/10 mb-4" size={32} />
                    <p className="text-[10px] uppercase tracking-widest text-white/20">Selection is empty</p>
                    <Button asChild variant="ghost" className="mt-6 text-primary uppercase tracking-widest text-[9px] hover:bg-primary/5">
                      <Link href="/">Back to Shop</Link>
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.4em] font-bold">Delivery Protocol</p>
                <div className="bg-white/5 border border-white/5 rounded-2xl p-8 flex items-start gap-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div className="flex-1">
                    {profile?.firstName ? (
                      <div className="space-y-1">
                        <p className="text-[12px] font-bold uppercase tracking-widest">{profile.firstName} {profile.lastName}</p>
                        <p className="text-[11px] text-white/40 font-light leading-relaxed">{profile.location}</p>
                        <p className="text-[10px] text-white/20 font-mono mt-2">{profile.phoneNumber}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <p className="text-[11px] text-white/40 font-light italic">Delivery address not found in your profile.</p>
                        <Button asChild variant="outline" className="rounded-full h-10 px-6 uppercase text-[9px] tracking-widest">
                          <Link href="/orders">Update Profile</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-32 bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] mb-8 border-b border-white/5 pb-4">Order Value</h3>
                
                <div className="space-y-4 mb-10">
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/40">
                    <span>Subtotal</span>
                    <span className="font-mono">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] uppercase tracking-widest text-white/40">
                    <span>Logistics Fee</span>
                    <span className="font-mono">${SHIPPING_FEE.toFixed(2)}</span>
                  </div>
                  <div className="h-px w-full bg-white/5 my-4" />
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">Total Harvest</span>
                    <span className="text-3xl font-headline font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || !items?.length || !profile?.location}
                    className="w-full h-14 bg-white text-black hover:bg-neutral-200 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] shadow-2xl transition-all active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : "Proceed to Checkout"}
                  </Button>
                  
                  <Button asChild variant="ghost" className="w-full h-12 text-white/30 hover:text-white uppercase tracking-widest text-[9px]">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
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
