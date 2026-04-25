"use client";

import { Leaf, Waves, ShieldCheck, Droplets, Zap, Wind } from "lucide-react";

export function IngredientsSection() {
  const ingredients = [
    { name: "Real Fruits", benefit: "100% cold-pressed whole fruits. No concentrates or artificial flavoring.", icon: Leaf },
    { name: "Pure Water", benefit: "Triple-filtered spring water for a perfectly clean finish.", icon: Waves },
    { name: "No Additives", benefit: "Zero artificial colors, flavors, or preservatives. Just pure juice.", icon: ShieldCheck },
    { name: "Natural Sweetness", benefit: "Sweetened only with the natural sugars found in the fruit itself.", icon: Droplets },
    { name: "Vitamins", benefit: "Rich in Vitamin C, antioxidants, and natural fruit electrolytes.", icon: Zap },
    { name: "Cold-Pressed", benefit: "HPP processing preserves nutrients and flavor at their absolute peak.", icon: Wind },
  ];

  return (
    <section id="ingredients" className="py-24 bg-black">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-16 text-center md:text-left">
          <p className="text-primary text-[9px] lowercase tracking-[0.4em] mb-3 font-medium">what's inside</p>
          <h2 className="text-3xl md:text-4xl font-headline font-bold leading-tight uppercase text-white">
            <span className="text-white">Real Ingredients</span><br />
            <span className="text-primary">Real Benefits</span>
          </h2>
          <p className="text-foreground/40 mt-4 max-w-lg font-light text-[11px] md:text-sm">Every drop starts with real, whole fruits. No concentrates, no preservatives — just nature in a bottle.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {ingredients.map((item) => (
            <div key={item.name} className="p-8 bg-white/5 rounded-2xl transition-all duration-300 group primary-glow-border border-white/5">
              <div className="mb-4 text-primary">
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <h4 className="text-[12px] font-headline font-bold mb-2 tracking-widest uppercase text-foreground">{item.name}</h4>
              <p className="text-[10px] text-foreground/30 leading-relaxed font-light">{item.benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}