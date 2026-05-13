"use client";

import { useParams, useRouter } from "next/navigation";
import { useFirestore, useDoc, useMemoFirebase, useUser, useCollection } from "@/firebase";
import { doc, collection, query, where, limit } from "firebase/firestore";
import { flavors } from "@/lib/flavor-data";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Image from "next/image";
import { ArrowLeft, Plus, Minus, ShoppingCart, Loader2, Star, Sparkles, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Button } from "@/components/ui/button";
import { generateFlavorDescription } from "@/ai/flows/generate-flavor-description";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.productId as string;
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [aiStory, setAiStory] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const flavorStatic = flavors.find(f => f.id === productId);
  
  const productRef = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return doc(db, "products", productId);
  }, [db, productId]);

  const reviewsQuery = useMemoFirebase(() => {
    if (!db || !productId) return null;
    return query(collection(db, "reviews"), where("productId", "==", productId), limit(5));
  }, [db, productId]);

  const { data: productData, isLoading } = useDoc(productRef);
  const { data: reviews } = useCollection(reviewsQuery);

  const name = productData?.name || flavorStatic?.name || "NECTAR Product";
  const price = productData?.price || 12.00;
  const description = productData?.description || flavorStatic?.description || "A premium cold-pressed functional beverage.";
  const image = productData?.image || flavorStatic?.imageUrl || "https://picsum.photos/seed/juice/400/600";
  const accentColor = flavorStatic?.accentHex || '#ffffff';
  
  const availableStock = productData?.amount ?? 0;
  const isSoldOut = availableStock <= 0;

  // Ensure quantity doesn't exceed stock if stock changes
  useEffect(() => {
    if (availableStock > 0 && quantity > availableStock) {
      setQuantity(availableStock);
    }
  }, [availableStock, quantity]);

  useEffect(() => {
    if (name && name !== "NECTAR Product") {
      const fetchAiStory = async () => {
        setIsAiLoading(true);
        try {
          const res = await generateFlavorDescription({ flavorName: name, flavorColor: flavorStatic?.color || "Fresh" });
          setAiStory(res.description);
        } catch (e) {
          console.error("AI Story failed", e);
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchAiStory();
    }
  }, [name, flavorStatic?.color]);

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  const handleAddToCart = () => {
    if (!user || !db) {
      toast({ title: "Please sign in to shop" });
      return;
    }
    if (isSoldOut) {
      toast({ variant: "destructive", title: "Sold Out" });
      return;
    }
    if (quantity > availableStock) {
        toast({ variant: "destructive", title: "Stock Limit", description: `Only ${availableStock} units remaining.` });
        return;
    }

    const itemRef = doc(db, "users", user.uid, "cart", productId);
    setDocumentNonBlocking(itemRef, {
      productId,
      userId: user.uid,
      quantity,
      priceAtAddToCart: price,
      name,
      image,
      updatedAt: new Date().toISOString()
    }, { merge: true });
    toast({ title: `${quantity}x ${name} added.` });
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-20">
        <button onClick={() => router.back()} className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all mb-12">
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="relative aspect-square rounded-[3rem] bg-transparent border border-white/5 overflow-hidden flex items-center justify-center p-12 group">
            <div className="absolute inset-0 opacity-20 blur-[100px] pointer-events-none" style={{ background: `radial-gradient(circle at center, ${accentColor} 0%, transparent 70%)` }} />
            <div className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-1000">
              <Image src={image} alt={name} fill className="object-contain" priority />
            </div>
          </div>

          <div className="space-y-10">
            <div>
              <p className="text-primary text-[9px] uppercase tracking-[0.5em] mb-4 font-bold">Cold Pressed Batch No. {flavorStatic?.index || '01'}</p>
              <h1 className="text-6xl md:text-8xl font-headline font-bold uppercase leading-[0.85] tracking-tighter mb-6" style={{ color: accentColor }}>{name}</h1>
              <div className="space-y-6">
                <p className="text-[13px] md:text-[15px] text-white/40 leading-relaxed max-w-lg font-light">{description}</p>
                
                <div className="flex items-center gap-4 py-4 px-6 bg-white/5 border border-white/5 rounded-2xl w-fit">
                    <ShieldCheck size={14} className={isSoldOut ? "text-red-500" : "text-primary"} />
                    <p className="text-[10px] uppercase tracking-widest font-bold">
                        {isSoldOut ? "Inventory Exhausted" : `Available Stock: ${availableStock} units`}
                    </p>
                </div>

                <div className="pt-6 border-t border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-primary" size={14} />
                    <span className="text-[9px] uppercase tracking-[0.4em] text-primary font-bold">NECTAR AI Story</span>
                  </div>
                  {isAiLoading ? (
                    <div className="flex items-center gap-3 text-white/20">
                      <Loader2 className="animate-spin" size={14} />
                      <span className="text-[10px] uppercase tracking-widest animate-pulse">Brewing sensory narrative...</span>
                    </div>
                  ) : (
                    <p className="text-[14px] text-white/70 italic leading-relaxed max-w-lg">{aiStory || "Nature's purest essence, captured in a single bottle."}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 h-16 w-full sm:w-40 justify-between">
                <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))} 
                    className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white"
                >
                    <Minus size={18} />
                </button>
                <span className="text-lg font-mono font-bold">{quantity}</span>
                <button 
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))} 
                    disabled={quantity >= availableStock}
                    className="w-12 h-12 flex items-center justify-center text-white/40 hover:text-white disabled:opacity-10"
                >
                    <Plus size={18} />
                </button>
              </div>
              <Button disabled={isSoldOut} onClick={handleAddToCart} className="flex-1 h-16 bg-white text-black hover:bg-neutral-200 rounded-full font-bold uppercase tracking-widest text-[11px] no-glow">
                <ShoppingCart size={18} className="mr-2" />
                {isSoldOut ? "Sold Out" : "Add to Collection"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}