
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUser, useFirestore, useCollection } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Plus, Minus, ShoppingBag, ArrowLeft, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemoFirebase } from "@/firebase/provider";
import { updateDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export function CartSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const cartQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return collection(db, "users", user.uid, "cart");
  }, [db, user]);

  const { data: items, isLoading } = useCollection(cartQuery);

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

  const handleOrderNow = () => {
    if (!items || items.length === 0) return;
    onClose();
    router.push("/checkout");
  };

  const totalQuantity = items?.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0) || 0;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="bg-black/60 backdrop-blur-2xl border-white/10 text-white w-full sm:max-w-md flex flex-col p-0 transition-all duration-500 ease-in-out z-[1000]">
        <SheetHeader className="p-6 border-b border-white/5 bg-black/20">
          <SheetTitle className="text-xl font-headline font-bold tracking-widest uppercase flex items-center justify-between">
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft size={18} />
            </button>
            <span className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-primary" />
              Your Selection
            </span>
            {items && items.length > 0 && (
              <span className="text-[10px] bg-primary text-black px-2 py-0.5 rounded-full font-mono font-bold">
                {String(totalQuantity)}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-white/20 uppercase tracking-[0.3em] text-[10px] animate-pulse">Syncing selection...</p>
            </div>
          ) : items && items.length > 0 ? (
            items.map((item) => {
              const name = item.name || "NECTAR Flavor";
              const image = item.image || "https://picsum.photos/seed/juice/400/600";
              const price = item.priceAtAddToCart || 12.00;
              const quantity = Number(item.quantity) || 0;

              return (
                <div key={item.id} className="flex gap-4 items-center bg-white/5 p-4 rounded-xl border border-white/5 animate-in fade-in slide-in-from-right-4 duration-500 will-change-transform group">
                  <div className="relative w-16 h-16 bg-neutral-900/40 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={image} alt={name} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold uppercase tracking-widest truncate">{name}</h4>
                        <p className="text-[9px] text-white/20 uppercase tracking-[0.3em] mt-1 font-bold">Pure Cold Pressed</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <p className="text-[10px] font-mono text-primary">${price.toFixed(2)}</p>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-white/10 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center border border-white/10 rounded-full px-2 py-0.5 bg-black/40">
                        <button onClick={() => updateQty(item.id, quantity - 1)} className="p-1 text-white/40 hover:text-white transition-colors">
                          <Minus size={10} />
                        </button>
                        <span className="w-6 text-center text-[9px] font-bold font-mono">{String(quantity)}</span>
                        <button onClick={() => updateQty(item.id, quantity + 1)} className="p-1 text-white/40 hover:text-white transition-colors">
                          <Plus size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                 <ShoppingBag size={20} />
              </div>
              <p className="text-white uppercase tracking-[0.3em] text-[10px] mb-4">No flavors selected</p>
              <button onClick={onClose} className="text-[10px] font-bold uppercase tracking-widest border-b border-primary hover:text-primary transition-all pb-1">Explore the collection</button>
            </div>
          )}
        </div>

        {items && items.length > 0 && (
          <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-xl">
            <button 
              onClick={handleOrderNow}
              className="w-full h-14 bg-primary text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-primary/80 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-2"
            >
              Order Now
            </button>
            <p className="mt-4 text-[8px] uppercase tracking-[0.4em] text-center text-white/20 font-bold">Review full summary in next step</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
