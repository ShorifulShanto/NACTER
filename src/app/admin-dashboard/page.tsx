"use client";

import { useState } from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, deleteDoc, doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Trash2, 
  Search, 
  ArrowLeft, 
  Package, 
  Activity, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  Plus 
} from "lucide-react";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { flavors } from "@/lib/flavor-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

const ADMIN_EMAIL = "md.si.shanto001@gmail.com";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  const [newProduct, setNewProduct] = useState({
    id: "",
    name: "",
    price: 12.00,
    amount: 50,
    image: "https://picsum.photos/seed/juice/400/600",
    description: ""
  });

  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const hubQuery = useMemoFirebase(() => {
    if (!db || user?.email !== ADMIN_EMAIL) return null;
    return collection(db, "central_hub");
  }, [db, user]);

  const productsQuery = useMemoFirebase(() => {
    if (!db || user?.email !== ADMIN_EMAIL) return null;
    return collection(db, "products");
  }, [db, user]);

  const { data: entries, isLoading: isHubLoading, error: hubError } = useCollection(hubQuery);
  const { data: dbProducts, isLoading: isProductsLoading, error: productsError } = useCollection(productsQuery);

  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <RefreshCw className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-red-500" size={32} />
        </div>
        <h1 className="text-2xl font-headline font-bold uppercase tracking-widest mb-2">Access Denied</h1>
        <p className="text-white/40 text-sm max-w-xs mb-8 uppercase tracking-widest">
          This area is restricted to authorized administrators only.
        </p>
        <Button asChild variant="outline" className="rounded-full px-8 border-white/10 uppercase text-[10px] tracking-widest">
          <Link href="/">Return to Site</Link>
        </Button>
      </div>
    );
  }

  const filteredEntries = entries?.sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA;
  }).filter((entry) => 
    entry.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
    entry.type?.toLowerCase().includes(search.toLowerCase())
  );

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
      toast({ title: "Catalog Synchronized", description: "All flavors have been initialized in Firestore." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: e.message });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;
    setIsAdding(true);
    try {
      const docId = newProduct.id || `PROD_${Date.now()}`;
      const productRef = doc(db, "products", docId);
      await setDoc(productRef, {
        ...newProduct,
        id: docId,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Product Added", description: `${newProduct.name} is now in the catalog.` });
      setIsAddModalOpen(false);
      setNewProduct({
        id: "",
        name: "",
        price: 12.00,
        amount: 50,
        image: "https://picsum.photos/seed/juice/400/600",
        description: ""
      });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Failed to add", description: e.message });
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateProduct = async (id: string, field: string, value: any) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "products", id), {
        [field]: value,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Product Updated", description: `${field} updated successfully.` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "central_hub", id));
      toast({ title: "Log entry removed" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "products", id));
      toast({ title: "Product removed from catalog" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Delete failed", description: e.message });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={12} /> Back to Site
            </Link>
            <h1 className="text-4xl font-headline font-bold tracking-tight uppercase">Admin Control</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] mt-2">Authenticated as {user.email}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline"
                  className="border-white/10 bg-white/5 uppercase tracking-widest text-[9px] h-11 px-6 rounded-full hover:bg-white hover:text-black transition-all"
                >
                  <Plus size={14} className="mr-2" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/10 text-white sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl font-headline tracking-widest uppercase">New Product</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddProduct} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Product ID (Unique)</label>
                      <Input 
                        placeholder="WA00xx" 
                        value={newProduct.id}
                        onChange={(e) => setNewProduct({...newProduct, id: e.target.value})}
                        className="bg-neutral-900 border-white/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Name</label>
                      <Input 
                        placeholder="Flavor Name" 
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="bg-neutral-900 border-white/5"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Price ($)</label>
                      <Input 
                        type="number" 
                        step="0.01"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value)})}
                        className="bg-neutral-900 border-white/5"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Initial Stock</label>
                      <Input 
                        type="number" 
                        value={newProduct.amount}
                        onChange={(e) => setNewProduct({...newProduct, amount: parseInt(e.target.value)})}
                        className="bg-neutral-900 border-white/5"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Image URL</label>
                    <Input 
                      placeholder="https://..." 
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                      className="bg-neutral-900 border-white/5"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Description</label>
                    <Textarea 
                      placeholder="Product storytelling..." 
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      className="bg-neutral-900 border-white/5 min-h-[100px]"
                      required
                    />
                  </div>
                  <DialogFooter className="pt-4">
                    <Button 
                      type="submit" 
                      disabled={isAdding}
                      className="w-full bg-white text-black hover:bg-neutral-200 uppercase tracking-widest font-bold h-12 rounded-full"
                    >
                      {isAdding ? "Creating..." : "Create Product"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              onClick={handleSyncProducts} 
              disabled={isSyncing}
              variant="outline"
              className="border-white/10 bg-white/5 uppercase tracking-widest text-[9px] h-11 px-6 rounded-full hover:bg-white hover:text-black transition-all"
            >
              <RefreshCw size={14} className={`mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              Sync Base Flavors
            </Button>
            <div className="relative flex-1 md:w-64 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={16} />
              <Input 
                placeholder="SEARCH..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-neutral-900 border-white/5 pl-10 h-11 text-[10px] tracking-widest uppercase focus:ring-white/10"
              />
            </div>
          </div>
        </div>

        {(hubError || productsError) && (
          <Alert variant="destructive" className="mb-8 bg-destructive/10 border-destructive/20">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="uppercase tracking-widest text-[10px] font-bold">Data Access Error</AlertTitle>
            <AlertDescription className="text-[11px] opacity-70">
              There was an issue fetching data. Admin permissions might be restricted.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="bg-neutral-900/50 border border-white/5 p-1 rounded-full mb-8">
            <TabsTrigger value="products" className="rounded-full px-8 py-2 text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">
              <Package size={14} className="mr-2" /> Products
            </TabsTrigger>
            <TabsTrigger value="activity" className="rounded-full px-8 py-2 text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">
              <Activity size={14} className="mr-2" /> Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="grid grid-cols-1 gap-4">
              {isProductsLoading ? (
                <div className="p-20 text-center text-white/20 uppercase tracking-[0.5em] text-[10px]">Fetching Catalog...</div>
              ) : dbProducts && dbProducts.length > 0 ? (
                dbProducts.map((product) => (
                  <div key={product.id} className="bg-neutral-950 border border-white/5 rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center group/item">
                    <div className="w-16 h-16 bg-neutral-900 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="text-sm font-bold uppercase tracking-widest truncate">{product.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono">{product.id}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20">Price ($)</label>
                        <Input 
                          type="number"
                          step="0.01"
                          defaultValue={product.price}
                          onBlur={(e) => handleUpdateProduct(product.id, 'price', parseFloat(e.target.value))}
                          className="bg-neutral-900 border-white/5 h-9 text-[10px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20">Amount (Stock)</label>
                        <Input 
                          type="number"
                          defaultValue={product.amount}
                          onBlur={(e) => handleUpdateProduct(product.id, 'amount', parseInt(e.target.value))}
                          className={`bg-neutral-900 border-white/5 h-9 text-[10px] ${product.amount === 0 ? 'text-red-500 font-bold' : ''}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] uppercase tracking-widest text-white/20">Status</label>
                        <div className={`h-9 px-4 rounded-md flex items-center text-[9px] font-bold uppercase tracking-widest ${product.amount > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {product.amount > 0 ? 'In Stock' : 'Sold Out'}
                        </div>
                      </div>
                      <div className="flex items-end justify-end md:pb-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="h-9 w-9 text-white/20 hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center border border-dashed border-white/10 rounded-xl bg-neutral-950">
                  <p className="text-white/20 uppercase tracking-widest text-[10px] mb-6">Product collection is empty.</p>
                  <Button onClick={handleSyncProducts} className="bg-white text-black rounded-full uppercase text-[10px] tracking-widest font-bold px-10">Initialize Flavors</Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <div className="bg-neutral-950 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-900/50 border-b border-white/5">
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Type</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">User</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40">Timestamp</th>
                      <th className="p-4 text-[10px] font-bold uppercase tracking-widest text-white/40 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {isHubLoading ? (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-white/20 uppercase tracking-[0.5em] text-[10px]">Loading Activity...</td>
                      </tr>
                    ) : filteredEntries && filteredEntries.length > 0 ? (
                      filteredEntries.map((entry, i) => (
                        <tr key={entry.id} className={`${i % 2 === 0 ? 'bg-black/20' : 'bg-transparent'} hover:bg-white/5 transition-colors group`}>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest ${
                              entry.type === 'signup' ? 'bg-blue-500/10 text-blue-400' :
                              entry.type === 'cart_addition' ? 'bg-green-500/10 text-green-400' :
                              'bg-neutral-800 text-white/60'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="p-4 text-[10px] font-medium text-white/80">{entry.userEmail || 'GUEST'}</td>
                          <td className="p-4 text-[10px] text-white/40">
                            {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="p-4 text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-white/40 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDeleteEntry(entry.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-20 text-center text-white/20 uppercase tracking-widest text-[10px]">No activity logs.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}