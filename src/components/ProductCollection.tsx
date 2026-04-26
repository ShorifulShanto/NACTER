"use client";

import { Plus, RefreshCw, Eye } from "lucide-react";
import { flavors } from "@/lib/flavor-data";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Link from "next/link";

export function ProductCollection() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();

  const productsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "products");
  }, [db]);

  const { data: dbProducts, isLoading } = useCollection(productsQuery);

  const handleAddToCart = (e: React.MouseEvent, productId: string, productName: string, price: number, image: string, isSoldOut: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !db) {
      toast({ title: "Please sign in to shop", description: "You need an account to add items to cart." });
      return;
    }

    if (isSoldOut) {
      toast({ variant: "destructive", title: "Sold Out", description: "This flavor is currently unavailable." });
      return;
    }

    const itemRef = doc(db, "users", user.uid, "cart", productId);
    
    const hubRef = collection(db, "central_hub");
    addDocumentNonBlocking(hubRef, {
      type: "cart_addition",
      userId: user.uid,
      userEmail: user.email,
      payload: { productId, flavorName: productName },
      timestamp: new Date().toISOString()
    });

    toast({ title: `${productName} added to cart.` });
    
    setDocumentNonBlocking(itemRef, {
      productId: productId,
      userId: user.uid,
      cartId: 'default_cart',
      quantity: 1, 
      priceAtAddToCart: price,
      name: productName,
      image: image,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  };

  return (
    <section id="product" className="py-24 bg-silver-dark transition-colors duration-700">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 text-center md:text-left">
          <p className="text-primary text-[9px] lowercase tracking-[0.4em] mb-3 font-medium">our collection</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold leading-tight uppercase text-white">
            Discover Our <span className="text-nectar-teal">Latest Batch</span>
          </h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-20">
            <RefreshCw className="animate-spin text-primary/10" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {dbProducts && dbProducts.length > 0 ? (
              dbProducts.map((product) => {
                const isSoldOut = product.amount <= 0;
                const price = product.price || 12.00;
                const flavorConfig = flavors.find(f => f.id === product.id);
                const accentColor = flavorConfig?.accentHex || '#7AE2CF';
                const productImage = product.image || flavorConfig?.imageUrl || 'https://picsum.photos/seed/juice/400/600';

                return (
                  <div 
                    key={product.id} 
                    className="group relative flex flex-col items-center sm:items-start will-change-transform gpu-smooth"
                  >
                     <Link 
                       href={`/product/${product.id}`}
                       className="aspect-square w-full rounded-[2.5rem] bg-transparent border border-white/5 overflow-hidden p-4 mb-6 flex flex-col items-center justify-center group-hover:border-primary/40 transition-all duration-700 cursor-pointer"
                     >
                        {isSoldOut && (
                          <div className="absolute top-4 left-4 z-10 border border-primary text-primary text-[8px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest bg-transparent backdrop-blur-sm">
                            Sold Out
                          </div>
                        )}
                        <div className={`relative w-full h-full transform group-hover:scale-105 transition-transform duration-700 ${isSoldOut ? 'grayscale opacity-50' : ''}`}>
                          <Image 
                            src={productImage} 
                            alt={product.name} 
                            fill 
                            className="object-contain"
                          />
                        </div>

                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white/20">
                          <Eye size={18} />
                        </div>

                        {!isSoldOut && (
                          <button 
                            onClick={(e) => handleAddToCart(e, product.id, product.name, price, productImage, isSoldOut)}
                            className="absolute bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-20 hover:scale-110 border bg-transparent"
                            style={{ borderColor: accentColor, color: accentColor }}
                          >
                            <Plus size={20} />
                          </button>
                        )}
                     </Link>
                     <div className="text-center sm:text-left px-2">
                       <h4 className={`text-[12px] font-bold tracking-[0.3em] uppercase mb-1 transition-all duration-300 ${isSoldOut ? 'opacity-20' : 'text-white'}`}>
                         {product.name}
                       </h4>
                       <p className="text-[10px] text-foreground/40 uppercase tracking-[0.4em] font-medium font-mono transition-colors">
                         ${price.toFixed(2)} — 350ml
                       </p>
                     </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center border border-dashed border-white/10 rounded-[3rem] bg-transparent opacity-40">
                <p className="text-foreground uppercase tracking-[0.5em] text-[10px] font-bold">Catalog is currently empty</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
