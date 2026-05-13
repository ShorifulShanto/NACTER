"use client";

import { useState, useEffect } from "react";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { collection, doc, setDoc, serverTimestamp, deleteDoc, updateDoc } from "firebase/firestore";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RefreshCw, Plus, Upload, Loader2, Trash2, Edit3, Save } from "lucide-react";
import { useMemoFirebase } from "@/firebase/provider";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { flavors } from "@/lib/flavor-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/app/actions/cloudinary";

const ADMIN_EMAILS = ["md.si.shanto001@gmail.com"];

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [newProduct, setNewProduct] = useState({ name: "", price: 12.0, amount: 50, description: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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

  const handleAddProduct = async () => {
    if (!db || !selectedImage) {
      toast({ variant: "destructive", title: "Incomplete Entry", description: "Product image is required." });
      return;
    }
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedImage);
      const imageUrl = await uploadToCloudinary(formData);
      
      const productId = `NECTAR_${Date.now()}`;
      await setDoc(doc(db, "products", productId), {
        id: productId,
        ...newProduct,
        image: imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      toast({ title: "Product Added to Collection" });
      setNewProduct({ name: "", price: 12.0, amount: 50, description: "" });
      setSelectedImage(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Upload Failed", description: e.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({ ...product });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!db || !editingProduct) return;
    setIsSaving(true);
    try {
      const productRef = doc(db, "products", editingProduct.id);
      await updateDoc(productRef, {
        name: editingProduct.name,
        price: parseFloat(editingProduct.price),
        amount: parseInt(editingProduct.amount),
        description: editingProduct.description,
        updatedAt: serverTimestamp()
      });
      toast({ title: "Protocol Updated", description: `${editingProduct.name} configuration saved.` });
      setIsEditDialogOpen(false);
      setEditingProduct(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Update Failed", description: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, "products", productId));
      toast({ title: "Product Terminated", description: "The flavor has been removed from the catalog." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message });
    }
  };

  if (isUserLoading) return <div className="min-h-screen bg-black flex items-center justify-center"><RefreshCw className="animate-spin text-primary" /></div>;
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />
      <div className="container mx-auto px-6 pt-32 pb-20">
        <div className="mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-4 no-glow">
            <ArrowLeft size={12} /> Back to Site
          </Link>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-primary text-[9px] uppercase tracking-[0.5em] mb-2 font-bold">Secure Protocol</p>
              <h1 className="text-4xl font-headline font-bold uppercase tracking-tight">Admin Control</h1>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="rounded-full bg-white text-black hover:bg-neutral-200 px-8 uppercase text-[10px] tracking-widest font-bold h-12">
                  <Plus size={14} className="mr-2" /> Add Flavor
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-neutral-900 border-white/10 text-white rounded-3xl sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="font-headline tracking-widest uppercase">New Product Entry</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Flavor Name</label>
                    <Input value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="bg-black/40 border-white/5 h-12" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Price ($)</label>
                      <Input type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} className="bg-black/40 border-white/5 h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-white/40">Initial Stock</label>
                      <Input type="number" value={newProduct.amount} onChange={e => setNewProduct({...newProduct, amount: parseInt(e.target.value)})} className="bg-black/40 border-white/5 h-12" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Description</label>
                    <Textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="bg-black/40 border-white/5 min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-white/40">Product Imagery</label>
                    <div className="flex items-center gap-4">
                      <Input type="file" accept="image/*" onChange={e => setSelectedImage(e.target.files?.[0] || null)} className="bg-black/40 border-white/5 text-[10px] h-12 flex items-center" />
                      <Upload size={20} className="text-primary" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleAddProduct} disabled={isUploading} className="w-full bg-primary text-black font-bold rounded-full h-12 uppercase tracking-widest text-[11px] no-glow">
                    {isUploading ? <Loader2 className="animate-spin" /> : "Deploy to Catalog"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
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
                  <div key={product.id} className="bg-neutral-950 border border-white/5 rounded-2xl p-6 flex items-center gap-6 group hover:border-primary/20 transition-all">
                    <div className="w-16 h-16 bg-neutral-900 rounded-xl overflow-hidden flex-shrink-0 relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-contain p-2" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold uppercase tracking-widest truncate">{product.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono tracking-widest mt-1">
                        ${Number(product.price).toFixed(2)} • Stock: <span className={product.amount <= 0 ? "text-red-500 font-bold" : ""}>{product.amount}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleEditProduct(product)}
                        variant="ghost" 
                        size="icon" 
                        className="text-white/20 hover:text-primary transition-colors bg-white/5 rounded-xl no-glow"
                      >
                        <Edit3 size={16} />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-white/20 hover:text-red-500 transition-colors bg-white/5 rounded-xl no-glow">
                            <Trash2 size={16} />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-neutral-900 border-white/10 text-white rounded-[2rem] shadow-2xl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-headline tracking-widest uppercase text-red-500">Terminate Flavor?</AlertDialogTitle>
                            <AlertDialogDescription className="text-white/40 text-sm">
                              This will permanently remove <b>{product.name}</b> from the NECTAR catalog. This action is irreversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="mt-6">
                            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-full h-12 uppercase text-[10px] tracking-widest no-glow">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)} className="bg-red-500 text-white hover:bg-red-600 rounded-full h-12 uppercase text-[10px] tracking-widest font-bold">Terminate</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center">
                   <p className="text-white/20 uppercase tracking-[0.4em] text-[10px] mb-8">Catalog is offline</p>
                   <Button onClick={handleSyncProducts} disabled={isSyncing} className="bg-white text-black rounded-full px-12 h-14 font-bold uppercase tracking-widest text-[10px]">
                     {isSyncing ? <Loader2 className="animate-spin" /> : "Initialize Harvest"}
                   </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
             <div className="bg-neutral-950 border border-white/5 rounded-2xl p-12 text-center text-white/40 text-[10px] uppercase tracking-[0.5em] font-bold">
               {isHubLoading ? "Syncing activity..." : (entries?.length ? `${entries.length} recorded events` : "Zero activity detected")}
             </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-neutral-900 border-white/10 text-white rounded-3xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline tracking-widest uppercase text-primary">Protocol Adjustment</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Flavor Identity</label>
                <Input 
                  value={editingProduct.name} 
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                  className="bg-black/40 border-white/5 h-14" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Value ($)</label>
                  <Input 
                    type="number" 
                    value={editingProduct.price} 
                    onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} 
                    className="bg-black/40 border-white/5 h-14" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Inventory Count</label>
                  <Input 
                    type="number" 
                    value={editingProduct.amount} 
                    onChange={e => setEditingProduct({...editingProduct, amount: e.target.value})} 
                    className="bg-black/40 border-white/5 h-14" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-white/40 ml-1">Sensory Description</label>
                <Textarea 
                  value={editingProduct.description} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                  className="bg-black/40 border-white/5 min-h-[120px] resize-none" 
                />
              </div>
              <DialogFooter className="pt-4">
                <Button 
                  onClick={handleUpdateProduct} 
                  disabled={isSaving} 
                  className="w-full bg-white text-black hover:bg-neutral-200 rounded-full h-16 uppercase tracking-widest text-[11px] font-bold no-glow"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={16} className="mr-2" /> Save Protocol</>}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}