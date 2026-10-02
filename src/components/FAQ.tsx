import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const faqData: { buyer: FAQItem[]; seller: FAQItem[] } = {
  buyer: [
    { q: "What is a Lalpurja?", a: "A Lalpurja (Land Ownership Certificate) is the primary legal document issued by the Malpot Karyalaya (Land Revenue Office) in Nepal proving ownership of a land plot." },
    { q: "How do I verify a land plot's legality?", a: "You should cross-verify the Kitta number with the survey map at the Napi Karyalaya (Survey Office), check if the land is not in a restricted area, and ensure the Lalpurja is in the owner's name." },
    { q: "What are the registration taxes?", a: "Registration tax varies based on the location (Metropolitan, Sub-Metropolitan, Municipality, or Rural) and the buyer's status (e.g., female buyers get discounts)." }
  ],
  seller: [
    { q: "What documents do I need to sell my land?", a: "You need the original Lalpurja, your Citizenship certificate, tax clearance receipts from the local ward office, and a trace map (blueprint) of the plot." },
    { q: "What is Malpot process?", a: "Malpot is the Land Revenue Office where ownership transfer takes place. Both buyer and seller must be present to sign the deed (Raajinama)." },
    { q: "How is Capital Gains Tax (CGT) calculated?", a: "CGT is calculated based on the holding period of the land. The rate is lower if the land is held for more than 5 years." }
  ]
};

export default function FAQ({ role }: { role: 'buyer' | 'seller' }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const faqs = faqData[role];

  return (
    <div className="bg-white p-6 rounded-xl border border-neutral-150 space-y-4">
      <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
        <HelpCircle className="text-amber-700" size={16} />
        Common Legal & Real Estate Queries
      </h3>
      <div className="space-y-2">
        {faqs.map((item, index) => (
          <div key={index} className="border border-neutral-100 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-3 text-left bg-neutral-50 hover:bg-neutral-100 transition-colors"
            >
              <span className="text-xs font-semibold text-neutral-800">{item.q}</span>
              {openIndex === index ? <ChevronUp size={14} className="text-neutral-500" /> : <ChevronDown size={14} className="text-neutral-500" />}
            </button>
            {openIndex === index && (
              <div className="p-3 text-[11px] text-neutral-600 bg-white border-t border-neutral-100">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
