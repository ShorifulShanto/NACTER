
"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Sparkles } from "lucide-react";
import { useUser, useFirestore } from "@/firebase";
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { generateReview } from "@/ai/flows/generate-review-flow";

interface ReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  product?: { id: string; name: string } | null;
}

export function ReviewDialog({ isOpen, onClose, product }: ReviewDialogProps) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiDraft = async () => {
    setIsAiGenerating(true);
    try {
      const response = await generateReview({
        productName: product?.name || "NECTAR Experience",
        rating: rating
      });
      setComment(response.review);
      toast({ title: "AI Draft Complete", description: "Tasting notes generated based on your rating." });
    } catch (e: any) {
      toast({ variant: "destructive", title: "AI Draft Failed", description: "Could not connect to NECTAR AI." });
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleSubmit = () => {
    if (!user || !db) return;
    setIsSubmitting(true);

    const reviewRef = collection(db, "reviews");
    addDocumentNonBlocking(reviewRef, {
      productId: product?.id || null,
      userId: user.uid,
      userName: user.email?.split('@')[0] || "Anonymous User",
      rating,
      comment,
      timestamp: new Date().toISOString()
    });

    const hubRef = collection(db, "central_hub");
    addDocumentNonBlocking(hubRef, {
      type: "review_submitted",
      userId: user.uid,
      userEmail: user.email,
      payload: { productId: product?.id || "brand", productName: product?.name || "Brand", rating },
      timestamp: new Date().toISOString()
    });

    toast({ 
      title: "Story Shared", 
      description: product ? `Thank you for sharing your thoughts on ${product.name}!` : "Thank you for your feedback!" 
    });
    
    setRating(5);
    setComment("");
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black/80 backdrop-blur-2xl border-white/10 text-white rounded-[2rem] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline uppercase tracking-widest mb-2">
            {product ? `Rate ${product.name}` : "Share Your Story"}
          </DialogTitle>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Share your harvest experience</p>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  size={32} 
                  className={`${star <= rating ? 'text-primary fill-primary' : 'text-white/10'}`} 
                />
              </button>
            ))}
          </div>

          <div className="relative group">
            <Textarea 
              placeholder={product ? "How was the tasting experience?" : "Tell us about your NECTAR journey..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-white/5 border-white/10 text-sm min-h-[120px] rounded-2xl pr-12 focus:border-primary/50"
            />
            <button
              type="button"
              onClick={handleAiDraft}
              disabled={isAiGenerating}
              className="absolute bottom-4 right-4 text-primary/40 hover:text-primary transition-colors disabled:opacity-30"
              title="Draft with NECTAR AI"
            >
              {isAiGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            </button>
          </div>
        </div>

        <DialogFooter className="sm:flex-col gap-3">
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting || !comment.trim()}
            className="w-full bg-white text-black hover:bg-neutral-200 rounded-full uppercase tracking-widest text-[11px] font-bold h-12"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Submit Review"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleAiDraft}
            disabled={isAiGenerating}
            className="w-full text-primary uppercase tracking-widest text-[9px] font-bold flex items-center justify-center gap-2 hover:bg-primary/5 rounded-full"
          >
            <Sparkles size={14} />
            {isAiGenerating ? "Brewing Draft..." : "Draft with AI"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
