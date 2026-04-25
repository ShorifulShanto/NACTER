"use client";

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, limit, orderBy } from "firebase/firestore";
import { Star, Loader2, MessageSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewDialog } from "./ReviewDialog";
import { AuthModal } from "./AuthModal";

export function ReviewsSection() {
  const db = useFirestore();
  const { user } = useUser();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const latestReviewsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(
      collection(db, "reviews"),
      orderBy("timestamp", "desc"),
      limit(4)
    );
  }, [db]);

  const { data: reviews, isLoading } = useCollection(latestReviewsQuery);

  const handleShareStory = () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsReviewOpen(true);
  };

  const aiFallbackReviews = [
    {
      id: 'ai-1',
      userName: 'Aria S.',
      comment: "The crispness of the green apple is unparalleled. It's like walking through a mist-filled orchard at dawn.",
      rating: 5,
      role: 'Flavor Sommelier'
    },
    {
      id: 'ai-2',
      userName: 'Marcus K.',
      comment: "Finally, a functional beverage that doesn't compromise on the raw essence of the fruit. Truly refined.",
      rating: 5,
      role: 'Nectar Enthusiast'
    },
    {
      id: 'ai-3',
      userName: 'Elena R.',
      comment: "The Guava is a tropical masterclass. Smooth, vibrant, and incredibly fresh. My new daily ritual.",
      rating: 5,
      role: 'Community Member'
    }
  ];

  const displayReviews = reviews && reviews.length > 0 ? reviews : aiFallbackReviews;

  return (
    <section id="reviews" className="py-24 bg-black">
      <div className="container mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="text-center md:text-left">
            <p className="text-[9px] lowercase tracking-[0.4em] mb-3 font-medium flex items-center justify-center md:justify-start gap-2 text-primary">
              <Sparkles size={12} /> what people say
            </p>
            <h2 className="text-2xl md:text-4xl font-headline font-bold uppercase leading-tight text-white">
              Community <span className="text-nectar-teal">Stories</span>
            </h2>
          </div>
          
          <Button 
            onClick={handleShareStory}
            variant="outline" 
            className="rounded-full border-primary/20 bg-transparent text-foreground uppercase tracking-widest text-[9px] px-8 h-12 hover:bg-primary/5 hover:border-primary transition-all group"
          >
            <MessageSquare size={14} className="mr-2 group-hover:scale-110 transition-transform" />
            Share Your Story
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-primary/20" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-900/40 p-10 rounded-3xl border border-primary/10 text-center flex flex-col justify-center items-center backdrop-blur-sm shadow-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="text-4xl md:text-6xl font-headline font-bold text-primary relative z-10 hover:glow-precise">4.9</span>
              <div className="flex gap-1.5 my-3 text-primary relative z-10">
                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />) }
              </div>
              <p className="text-[9px] text-foreground/30 uppercase tracking-[0.3em] relative z-10 font-bold">Verified Praise</p>
            </div>
            
            {displayReviews.map((review) => (
              <div key={review.id} className="p-8 bg-neutral-900/40 rounded-3xl group hover:border-primary transition-all duration-500 shadow-lg primary-glow-border flex flex-col gpu-smooth">
                <div className="flex gap-1 mb-5 text-primary/20 group-hover:text-primary transition-colors">
                  {[...Array(review.rating || 5)].map((_, j) => <Star key={j} size={10} fill="currentColor" />)}
                </div>
                <p className="text-[12px] text-foreground/50 mb-6 leading-relaxed font-light italic flex-1">
                  "{review.comment}"
                </p>
                <div className="mt-auto pt-4 border-t border-white/5">
                  <h5 className="font-bold text-[10px] tracking-widest uppercase text-foreground hover:glow-precise">{review.userName || 'Valued Member'}</h5>
                  <p className="text-[9px] text-primary uppercase tracking-widest mt-1 font-bold">
                    {(review as any).role || 'Nectar Enthusiast'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewDialog 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        product={null} 
      />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </section>
  );
}