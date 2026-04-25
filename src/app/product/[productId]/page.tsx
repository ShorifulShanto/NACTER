
"use client";

import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, limit } from "firebase/firestore";
import { flavors } from "@/lib/flavor-data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  ShieldCheck, 
  Zap, 
  Droplets, 
  Leaf,
  ShoppingCart,
  Loader2,
  Star
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const flavorStatic = flavors.find(f => f.id === productId);
  
  const productRef = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return doc(db, "products", productId);
  }, [db, productId]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(
      collection(db, "reviews"),
      where("productId", "==", productId),
      limit(5)
    );
  }, [db, productId]);

  const { data: productData, isLoading } = useDoc(productRef);
  const { data: reviews } = useCollection(reviewsQuery);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (!flavorStatic && !productData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-6">
        <h1 className="text-2xl font-headline font-bold uppercase mb-4">Product Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="rounded-full uppercase tracking-widest text-[10px]">
          Return to Site
        </Button>
      </div>
    );
  }

  const name = productData?.name || flavorStatic?.name || "NECTAR Product";
  const price = productData?.price || 12.00;
  const description = productData?.description || flavorStatic?.description || "A premium cold-pressed functional beverage.";
  const image = productData?.image || flavorStatic?.imageUrl || "https://picsum.photos/seed/juice/400/600";
  const accentColor = flavorStatic?.accentHex || '#ffffff';
  const isSoldOut = productData ? productData.amount <= 0 : false;

  const handleAddToCart = () => {
    if (!user || !db) {
      toast({ title: "Please sign in to shop", description: "You need an account to add items to cart." });
      return;
    }

    if (isSoldOut) {
      toast({ variant: "destructive", title: "Sold Out", description: "This flavor is currently unavailable." });
      return;
    }

    const itemRef = doc(db, "users", user.uid, "cart", productId);
    
    setDocumentNonBlocking(itemRef, {
      productId: productId,
      userId: user.uid,
      cartId: 'default_cart',
      quantity: quantity, 
      priceAtAddToCart: price,
      name,
      image,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    toast({ title: `${quantity}x ${name} added to cart.` });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      
      <div className="container mx-auto px-6 pt-32 pb-20">
        <button 
          onClick={() => router.back()}
          className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all mb-12"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to the Grove
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-square rounded-[3rem] bg-neutral-900/40 border border-white/5 overflow-hidden flex items-center justify-center p-12 group">
            <div 
              className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }}
            />
            <div className="relative w-full h-full">
              <Image src={image} alt={name} fill className="object-contain" priority />
            </div>
            {isSoldOut && (
              <div className="absolute top-8 left-8 bg-primary text-black text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest z-20">
                Sold Out
              </div>
            )}
          </div>

          <div className="space-y-10">
            <div>
              <p className="text-primary text-[9px] uppercase tracking-[0.5em] mb-4 font-bold">Cold Pressed Batch No. {flavorStatic?.index || '01'}</p>
              <h1 className="text-6xl md:text-8xl font-headline font-bold uppercase leading-[0.85] tracking-tighter mb-6" style={{ color: accentColor }}>
                {name}
              </h1>
              <p className="text-[13px] md:text-[15px] text-white/40 leading-relaxed max-w-lg font-light">
                {description}
              </p>
            </div>

            <div className="flex items-end gap-6 pb-6 border-b border-white/5">
              <span className="text-5xl font-headline font-bold">${price.toFixed(2)}</span>
              <span className="text-[11px] uppercase tracking-widest text-white/20 pb-1.5">Per 350ml Bottle</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 h-16 w-full sm:w-40 justify-between">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white"><Minus size={18} /></button>
                <span className="text-lg font-mono font-bold">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white"><Plus size={18} /></button>
              </div>

              <Button disabled={isSoldOut} onClick={handleAddToCart} className="flex-1 h-16 bg-white text-black hover:bg-neutral-200 rounded-full font-bold uppercase tracking-widest text-[11px]">
                <ShoppingCart size={18} className="mr-2" />
                {isSoldOut ? "Currently Unavailable" : "Add to Collection"}
              </Button>
            </div>

            {reviews && reviews.length > 0 && (
              <div className="pt-10 border-t border-white/5">
                <h4 className="text-[10px] uppercase tracking-[0.4em] text-white/20 font-bold mb-6">Tasting Notes</h4>
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white/2 p-4 rounded-2xl border border-white/5">
                      <div className="flex gap-1 text-primary mb-2">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} size={10} fill="currentColor" />)}
                      </div>
                      <p className="text-[12px] text-white/60 font-light mb-2 italic">"{review.comment}"</p>
                      <p className="text-[9px] uppercase tracking-widest text-white/20">— {review.userName}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
