"use client";

export function NutritionSection() {
  return (
    <section id="nutrition" className="py-24 bg-silver-dark border-y border-white/5 transition-colors duration-700">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div className="p-8 border-[1px] border-primary rounded-sm max-w-[320px] mx-auto md:mx-0 shadow-2xl bg-black/40 interactive-glow">
            <h3 className="text-2xl font-bold font-headline border-b-[6px] border-primary pb-2 mb-3 leading-none uppercase text-primary">Nutrition Facts</h3>
            <p className="text-[9px] uppercase tracking-widest text-foreground/40 border-b border-white/20 pb-3 mb-4 font-bold">Serving Size: 1 Bottle (350ml)</p>
            <div className="flex justify-between items-end border-b-[3px] border-primary pb-2 mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">Calories</span>
              <span className="text-4xl font-bold leading-none font-headline text-primary">110</span>
            </div>
            {[
              { label: "Total Fat", val: "0g" },
              { label: "Sodium", val: "15mg" },
              { label: "Total Carbohydrate", val: "27g" },
              { label: "Dietary Fiber", val: "1g", indent: true },
              { label: "Total Sugars", val: "22g", indent: true },
              { label: "Protein", val: "1g" },
              { label: "Vitamin C", val: "45%", highlight: true },
              { label: "Potassium", val: "8%", highlight: true },
            ].map((row) => (
              <div key={row.label} className={`flex justify-between py-1.5 border-b border-white/10 text-[9px] uppercase tracking-widest ${row.highlight ? 'font-bold text-primary' : 'text-foreground/50'}`}>
                <span className={row.indent ? 'pl-4' : ''}>{row.label}</span>
                <span>{row.val}</span>
              </div>
            ))}
            <p className="text-[8px] text-foreground/20 mt-4 leading-tight italic uppercase tracking-wider font-light">
              * Percent daily values are based on a 2,000 calorie diet.
            </p>
          </div>
          
          <div className="space-y-12">
            <h2 className="text-3xl md:text-4xl font-headline font-bold leading-[0.9] tracking-tighter uppercase text-white">
              <span className="text-white">Nutrition</span><br /><span className="text-primary">You Can Feel.</span>
            </h2>
            <div className="grid gap-6">
              {[
                { num: "01", title: "Immune Support", desc: "High Vitamin C content from real fruits helps strengthen your immune system naturally." },
                { num: "02", title: "Antioxidant Rich", desc: "Natural antioxidants from whole fruits combat free radicals and support cellular health." },
                { num: "03", title: "Hydration Boost", desc: "Natural electrolytes and pure water content keep you hydrated throughout the day." },
                { num: "04", title: "No Added Sugar", desc: "Every gram of sweetness comes directly from the fruits — nothing added, nothing artificial." },
              ].map((item) => (
                <div key={item.num} className="flex gap-6 items-start border-l border-primary/20 pl-6 group">
                  <span className="text-2xl font-headline font-bold text-primary/10 group-hover:text-primary transition-colors duration-500">{item.num}</span>
                  <div>
                    <h4 className="text-[11px] font-bold mb-1 uppercase tracking-[0.2em] text-foreground">
                      <span className="text-white group-hover:text-primary transition-colors">{item.title}</span>
                    </h4>
                    <p className="text-foreground/40 font-light leading-relaxed text-[10px] max-w-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
