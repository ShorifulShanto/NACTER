"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Search, ArrowLeft, Package, Activity, RefreshCw, AlertCircle, Plus } from "lucide-react";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { flavors } from "@/lib/flavor-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const ADMIN_EMAILS = ["md.si.shanto001@gmail.com"];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isUserLoading && (!user || !ADMIN_EMAILS.includes(user.email || ""))) {
      router.push("/auth");
    }
  }, [user, isUserLoading, router]);

  const hubQuery = useMemoFirebase(() => {
    if (!db || !user || !ADMIN_EMAILS.includes(user.email || "")) return null;
    return collection(db, "central_hub");
  }, [db, user]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || !user || !ADMIN_EMAILS.includes(user.email || "")) return null;
    return collection(db, "products");
  }, [db, user]);

  const { data: entries, isLoading: isHubLoading } = useCollection(hubQuery);
  const { data: dbProducts, isLoading: isProductsLoading } = useCollection(productsQuery);

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><RefreshCw className="animate-spin text-primary" /></div>;
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return null;

  const handleSyncProducts = async () => {
    if (!db) return;
    setIsSyncing(true);
    try {
      for (const flavor of flavors) {
        const productRef = doc(db, "products", flavor.id);
        await setDoc(productRef, {
          id: flavor.id,
          name: flavor.name,
          price: 12.00,
          amount: 50,
          image: flavor.imageUrl,
          description: flavor.description,
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      toast({ title: "Catalog Synchronized" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-4 no-glow">
            <ArrowLeft size={12} /> Back to Site
          </Link>
          <h1 className="text-4xl font-headline font-bold uppercase">Admin Control</h1>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-neutral-900/50 border border-white/5 rounded-full mb-8">
            <TabsTrigger value="products" className="rounded-full px-8 py-2 text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Products</TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full px-8 py-2 text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 gap-4">
              {isProductsLoading ? (
                <div className="p-20 text-center text-white/20 uppercase tracking-widest text-[10px]">Fetching Catalog...</div>
              ) : dbProducts && dbProducts.length > 0 ? (
                dbProducts.map((product) => (
                  <div key={product.id} className="bg-neutral-950 border border-white/5 rounded-xl p-6 flex items-center gap-6">
                    <div className="w-16 h-16 bg-neutral-900 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold uppercase tracking-widest">{product.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono">${product.price.toFixed(2)} • Stock: {product.amount}</p>
                    </div>
                  </div>
                ))
              ) : (
                <Button onClick={handleSyncProducts} disabled={isSyncing} className="bg-white text-black">Initialize Flavors</Button>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
             <div className="bg-neutral-950 border border-white/5 rounded-xl p-8 text-center text-white/40 text-[10px] uppercase tracking-widest">
               {isHubLoading ? "Loading activity logs..." : (entries?.length ? `${entries.length} recorded events` : "No activity recorded")}
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}