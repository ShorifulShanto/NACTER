"use client";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function FAQSection() {
  const faqs = [
    { q: "Are NECTAR juices 100% real fruit?", a: "Yes. Every bottle is cold-pressed from whole, real fruit. We never use concentrates, artificial flavoring, or fillers." },
    { q: "Is there added sugar in the juice?", a: "No added sugar at all. The sweetness in every bottle comes entirely from the natural fruit sugars." },
    { q: "How long does a bottle stay fresh?", a: "Our HPP technique extends shelf life to 60 days refrigerated. Once opened, enjoy within 3 days for best taste." },
    { q: "Do you ship nationwide?", a: "Yes! We ship cold-packed in insulated boxes across the country. Orders typically arrive within 2 business days." },
  ];

  return (
    <section id="faq" className="py-24 bg-silver-dark transition-colors duration-700">
      <div className="container mx-auto px-6 md:px-12 max-w-2xl">
        <div className="mb-12 text-center md:text-left">
          <p className="text-[9px] lowercase tracking-[0.4em] mb-3 font-medium text-primary">questions</p>
          <h2 className="text-2xl md:text-3xl font-headline font-bold uppercase text-white">Frequently Asked</h2>
        </div>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-white/5 bg-black/20 rounded-xl px-6 transition-all duration-300">
              <AccordionTrigger className="text-[11px] md:text-sm font-headline font-bold hover:no-underline hover:text-primary py-5 uppercase tracking-widest text-left text-foreground transition-all group">
                <span className="transition-all group-hover:glow-precise">{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-foreground/40 text-[11px] pb-5 leading-relaxed font-light border-t border-white/5 pt-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
