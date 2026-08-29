"use client";

import { useState } from "react";

const SUPPORT_SECTIONS = [
  {
    id: "faqs",
    title: "FAQ'S",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.451 1.827v.75M12 18h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
    ),
    questions: [
      {
        q: "What is Thriftable and how does it curate garments?",
        a: "Thriftable is a premier destination for archival, vintage, and high-grade pre-loved fashion. Every item undergoes rigorous hand-inspection for authenticity, structural integrity, and condition before entering our collection."
      },
      {
        q: "Are all items 100% authentic vintage?",
        a: "Yes. Our archival specialists verify single-stitch constructions, tag typographies, care labels, wash distress, and era-specific hardware. We stand behind a 100% authenticity guarantee on all pieces."
      },
      {
        q: "How does your condition grading scale work?",
        a: "We categorize each item into four distinct grades: Pristine (unworn with archive tags), Excellent (minimal signs of age), Good (authentic vintage character with subtle patina), and Distressed (intentional historic wear, fraying, or paint splatter documented in detail)."
      },
      {
        q: "How often are new drops released?",
        a: "We release curated capsule drops every Thursday at 8:00 PM PKT. Archival newsletter members receive 15-minute priority early access."
      },
      {
        q: "Do items come washed and sanitized?",
        a: "Every garment is sanitized using organic steam treatments and specialized eco-friendly textile washes suitable for vintage fibers prior to archiving and shipment."
      },
      {
        q: "How can I contact the concierge support team?",
        a: "You can reach us directly at concierge@thriftable.archive or message us via WhatsApp (+92 300 1234567) Monday through Saturday from 10:00 AM to 7:00 PM PKT."
      }
    ]
  },
  {
    id: "how-to-buy",
    title: "HOW TO BUY",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
      </svg>
    ),
    questions: [
      {
        q: "How do I place an order on Thriftable?",
        a: "Browse our catalogue, select your desired piece, review measurements and photos, click 'Add to Archive' (or 'Direct Checkout'), proceed through our streamlined 3-step checkout, and confirm your payment."
      },
      {
        q: "Can I place an order as a guest without creating an account?",
        a: "Yes! Guest checkout is fully supported. Simply provide your shipping destination and contact email during checkout. You will receive an instant digital tracking link."
      },
      {
        q: "How do I understand sizing for vintage garments?",
        a: "Vintage tags often differ from modern sizes. Each item page lists exact flat-lay measurements (Chest Pit-to-Pit, Length, Shoulder, Sleeve). We recommend comparing these against your favorite fitted clothing."
      },
      {
        q: "What happens after I place my order?",
        a: "You will immediately receive an email order confirmation containing your invoice and tracking identifier. Your item is reserved and enters final quality packaging."
      },
      {
        q: "Can I save pieces to buy later?",
        a: "Yes, click the heart icon on any piece to save it to your personal Wishlist. Because vintage items are 1-of-1, we recommend purchasing promptly to avoid missing out."
      }
    ]
  },
  {
    id: "item-availability",
    title: "ITEM AVAILABILITY",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
      </svg>
    ),
    questions: [
      {
        q: "Are vintage items one-of-a-kind (1-of-1)?",
        a: "Yes. Almost all items on Thriftable are singular vintage originals. Once purchased, that exact individual piece is archived and marked as Sold Out."
      },
      {
        q: "Can a sold-out item be restocked?",
        a: "While exact 1-of-1 vintage pieces cannot be duplicated, our sourcing team frequently hunts for similar cuts, bands, and era styles. Use the 'Notify Me' feature on product pages to receive alerts when similar items drop."
      },
      {
        q: "Does adding an item to my bag reserve it?",
        a: "Items in your cart remain available to other thrifters until checkout payment is completed. To ensure you secure rare archive pieces, we suggest completing checkout immediately."
      },
      {
        q: "What does 'Archived' status signify?",
        a: "An 'Archived' badge denotes historic pieces that have been sold and preserved in our customer archive lookbook for design and provenance reference."
      }
    ]
  },
  {
    id: "payment",
    title: "PAYMENT",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
      </svg>
    ),
    questions: [
      {
        q: "Which payment methods are accepted?",
        a: "We accept all major Credit/Debit Cards (Visa, MasterCard, UnionPay), Cash on Delivery (COD) across Pakistan, Bank Transfer / Raast, and Apple Pay."
      },
      {
        q: "Is Cash on Delivery (COD) available nationwide?",
        a: "Yes! COD is available for all domestic orders across Pakistan up to PKR 35,000. Orders exceeding this amount require prepaid bank transfer or card payment."
      },
      {
        q: "Is my payment information secure?",
        a: "All online transactions are encrypted through 256-bit SSL encryption and processed via PCI-DSS compliant payment gateways. We never store your raw card details on our servers."
      },
      {
        q: "When will my card or account be charged?",
        a: "Your card is charged immediately upon placing the order. For COD, payment is collected in cash by our courier partner upon doorstep delivery."
      },
      {
        q: "Can I get a tax invoice with my order?",
        a: "Yes, an official itemized digital invoice is sent to your email immediately upon checkout confirmation, and a printed slip is included inside your parcel."
      }
    ]
  },
  {
    id: "shipping-delivery",
    title: "SHIPPING & DELIVERY",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.25V4.125C14.25 3.504 13.746 3 13.125 3H3.375C2.754 3 2.25 3.504 2.25 4.125v10.125c0 .621.504 1.125 1.125 1.125H6.75" />
      </svg>
    ),
    questions: [
      {
        q: "What are your delivery timeframes?",
        a: "Standard Tracked Delivery takes 3 to 5 business days nationwide. Express Priority shipping arrives in 1 to 2 business days in major metropolitan areas (Islamabad, Rawalpindi, Lahore, Karachi)."
      },
      {
        q: "What are the shipping charges?",
        a: "Standard shipping is FREE for orders over $75 (PKR 15,000). For smaller orders, standard domestic shipping is PKR 250, and Express Priority delivery is PKR 500."
      },
      {
        q: "How can I track my parcel?",
        a: "As soon as your order is dispatched, you receive an SMS and email with your live courier tracking link (DHL / TCS / Call Courier). You can also track in real-time from our `/orders` dashboard."
      },
      {
        q: "Do you ship internationally?",
        a: "Yes! We ship worldwide via DHL Express Carbon Neutral. International delivery typically takes 4 to 8 business days depending on customs clearance."
      },
      {
        q: "What packaging do you use?",
        a: "We ship all items in 100% compostable plant-based mailers with recycled archival tissue wrapping to minimize environmental impact."
      }
    ]
  },
  {
    id: "exchange-returns",
    title: "EXCHANGE & RETURNS",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    questions: [
      {
        q: "What is your return policy?",
        a: "We offer a hassle-free 7-day return window from the day of delivery if an item arrives with significant undisclosed damage or size discrepancy beyond our measurement guidelines."
      },
      {
        q: "How do I initiate a return or exchange?",
        a: "Navigate to your Order Details page (`/orders/[id]`), click 'Request Return / Exchange', upload photo proof of the issue, and select your return reason. Our team will review within 24 hours."
      },
      {
        q: "How are refunds processed?",
        a: "Refunds are issued directly to your original payment method (card / bank account) or as Thriftable store credit vouchers with a 10% bonus within 2–4 business days of item inspection."
      },
      {
        q: "Can I exchange for another item?",
        a: "Yes! You can choose Instant Store Credit to exchange for any available piece in our current or upcoming drop."
      },
      {
        q: "Who covers return shipping fees?",
        a: "If the return is due to an error on our end (incorrect item or unlisted flaw), Thriftable covers all return courier expenses. For preference returns, customer covers standard courier return fees."
      }
    ]
  },
  {
    id: "discount-promotions",
    title: "DISCOUNT/PROMOTIONAL CODES",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m9 14.25 6-6m4.5-3.493V8.75a.75.75 0 0 1-.75.75H16.5a.75.75 0 0 1-.75-.75V4.757a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 .75.75ZM8.25 15.25a.75.75 0 0 1-.75.75H5.25a.75.75 0 0 1-.75-.75V13a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 .75.75v2.25ZM21.75 12a9.75 9.75 0 1 1-19.5 0 9.75 9.75 0 0 1 19.5 0Z" />
      </svg>
    ),
    questions: [
      {
        q: "How do I apply a promotional voucher code?",
        a: "During Step 3 of checkout, enter your promo code in the 'Promo / Voucher Code' input and click Apply. The discount will instantly reflect on your total breakdown."
      },
      {
        q: "Can I stack multiple discount codes?",
        a: "Only one promotional code can be applied per order. However, loyalty points and store credit vouchers can be combined with promotional discounts."
      },
      {
        q: "Where can I find active discount codes?",
        a: "Sign up for our Archival Newsletter for 10% off your first order (`THRIFT10`). We also announce exclusive seasonal flash codes on our Instagram @thriftable.pk."
      },
      {
        q: "Why is my promo code not working?",
        a: "Promo codes may be case-sensitive, require a minimum spend, or be expired. Ensure no accidental trailing spaces are entered."
      }
    ]
  },
  {
    id: "modification-orders",
    title: "MODIFICATION OF INFO & ORDERS",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
      </svg>
    ),
    questions: [
      {
        q: "Can I edit my delivery address after placing an order?",
        a: "Yes! If your order is still in 'Processing' status, contact our concierge immediately with your Order ID and corrected address to update dispatch labels before courier handover."
      },
      {
        q: "Can I cancel an order after payment?",
        a: "Orders in 'Processing' status can be canceled directly from your `/orders/[id]` dashboard or by messaging our support line within 2 hours of placement."
      },
      {
        q: "Can I add more items to an existing order?",
        a: "To preserve inventory fairness, we cannot add items to a finalized order. You can place a second order, and if requested promptly, we will combine packages and refund the extra shipping fee."
      },
      {
        q: "How do I update my account profile details?",
        a: "Visit your Account Dashboard (`/dashboard`) to update your full name, saved addresses, phone number, or password."
      }
    ]
  },
  {
    id: "care-instructions",
    title: "CARE INSTRUCTIONS",
    icon: (
      <svg className="w-6 h-6 stroke-[1.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
      </svg>
    ),
    questions: [
      {
        q: "How should I wash vintage heavy cotton t-shirts?",
        a: "Always wash inside out in cold water on a gentle cycle using mild detergent. Avoid high-heat tumble drying; hang dry in the shade to preserve vintage graphic prints and cotton weave density."
      },
      {
        q: "How do I care for raw and selvedge denim?",
        a: "Wash rarely (only when soiled). Submerge inside-out in cold water with mild liquid soap, gently rinse without wringing, and hang to air dry to maintain authentic fade patterns."
      },
      {
        q: "What is the recommended care for wool coats & knitwear?",
        a: "Dry clean only for tailored wool coats and blazers. For wool and mohair knitwear, hand-wash in lukewarm water with wool-specific shampoo, press gently between towels, and lay flat to dry."
      },
      {
        q: "How can I protect leather jackets and workwear canvas?",
        a: "Condition vintage leather twice a year with organic leather balm. For waxed workwear canvas, brush off dirt and spot clean with cold water (never machine wash or dry clean)."
      }
    ]
  }
];

export default function SupportPage() {
  const [openItems, setOpenItems] = useState({});

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleQuestion = (sectionIdx, qIdx) => {
    const key = `${sectionIdx}-${qIdx}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black text-neutral-900 dark:text-white transition-colors duration-500 pt-28 sm:pt-32 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Heading */}
        <header className="mb-14 sm:mb-18 text-center sm:text-left">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B2A376] font-semibold block mb-3">
            Customer Concierge & Knowledge Base
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-calluna font-normal tracking-tight text-neutral-900 dark:text-white">
            Shopping Guide
          </h1>
          <p className="mt-4 text-sm sm:text-base font-proda text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Everything you need to know about sourcing, authenticating, purchasing, and caring for archival vintage garments.
          </p>
        </header>

        {/* Minimalist Grid Section (No border, no shadow, bg white for light / black for dark) */}
        <section className="bg-white dark:bg-black shadow-none border-0 mb-16 sm:mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Row 1: 4 Items */}
            {SUPPORT_SECTIONS.slice(0, 4).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="group flex flex-col items-center justify-between text-center p-6 sm:p-8 bg-white dark:bg-black transition-all duration-300 cursor-pointer min-h-40"
              >
                {/* Text Above */}
                <span className="font-macsans font-bold text-xs sm:text-sm tracking-wider uppercase text-neutral-900 dark:text-white group-hover:text-[#B2A376] transition-colors leading-tight">
                  {item.title}
                </span>

                {/* Corresponding Icon Below */}
                <div className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110 transition-all duration-300 mt-6">
                  {item.icon}
                </div>
              </button>
            ))}

            {/* Row 2: 4 Items */}
            {SUPPORT_SECTIONS.slice(4, 8).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollToSection(item.id)}
                className="group flex flex-col items-center justify-between text-center p-6 sm:p-8 bg-white dark:bg-black transition-all duration-300 cursor-pointer min-h-40"
              >
                {/* Text Above */}
                <span className="font-macsans font-bold text-xs sm:text-sm tracking-wider uppercase text-neutral-900 dark:text-white group-hover:text-[#B2A376] transition-colors leading-tight">
                  {item.title}
                </span>

                {/* Corresponding Icon Below */}
                <div className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110 transition-all duration-300 mt-6">
                  {item.icon}
                </div>
              </button>
            ))}

            {/* Row 3: 1 Item */}
            {SUPPORT_SECTIONS.slice(8, 9).map((item) => (
              <div key={item.id} className="col-span-1 sm:col-span-2 lg:col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className="group flex flex-col items-center justify-between text-center p-6 sm:p-8 bg-white dark:bg-black transition-all duration-300 cursor-pointer min-h-40 w-fit sm:max-w-xs lg:max-w-sm"
                >
                  {/* Text Above */}
                  <span className="font-macsans font-bold text-xs sm:text-sm tracking-wider uppercase text-neutral-900 dark:text-white group-hover:text-[#B2A376] transition-colors leading-tight">
                    {item.title}
                  </span>

                  {/* Corresponding Icon Below */}
                  <div className="text-neutral-500 group-hover:text-neutral-900 dark:group-hover:text-white group-hover:scale-110 transition-all duration-300 mt-6">
                    {item.icon}
                  </div>
                </button>
              </div>
            ))}

          </div>
        </section>

        {/* Separation Dashed Line (Black for light, White for dark) */}
        <div className="w-full border-2 border-dashed border-black dark:border-white my-16 sm:my-20" />

        {/* Section-wise Detailed Questions & Answers */}
        <div className="space-y-16 sm:space-y-24">
          {SUPPORT_SECTIONS.map((section, sIdx) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-32 pt-2"
            >
              {/* Section Header */}
              <div className="flex items-center gap-3 mb-8 pb-4 border-b border-black/10 dark:border-white/10">
                <div className="text-[#B2A376]">
                  {section.icon}
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-calluna font-normal tracking-tight text-neutral-900 dark:text-white uppercase">
                  {section.title}
                </h2>
                <span className="ml-auto text-[11px] font-mono uppercase tracking-widest text-neutral-400">
                  {section.questions.length} Answers
                </span>
              </div>

              {/* Questions List */}
              <div className="divide-y divide-black/5 dark:divide-white/5">
                {section.questions.map((qItem, qIdx) => {
                  const isOpen = openItems[`${sIdx}-${qIdx}`] ?? true;

                  return (
                    <div
                      key={qIdx}
                      className="py-5 sm:py-6 transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(sIdx, qIdx)}
                        className="w-full flex items-start justify-between text-left gap-4 cursor-pointer group"
                      >
                        <h3 className="font-macsans font-bold text-base sm:text-lg text-neutral-900 dark:text-white group-hover:text-[#B2A376] transition-colors leading-snug">
                          {qItem.q}
                        </h3>
                        <span className="text-xl font-mono text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white shrink-0 mt-0.5 transition-transform duration-200">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      {isOpen && (
                        <p className="mt-3 text-sm sm:text-base font-proda text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-4xl pr-8">
                          {qItem.a}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom Concierge Assistance Footer */}
        <div className="mt-24 p-8 sm:p-12 bg-neutral-50 dark:bg-neutral-950 border border-black/5 dark:border-white/5 text-center flex flex-col items-center">
          <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#B2A376] font-semibold mb-2">
            Still need assistance?
          </span>
          <h3 className="text-2xl sm:text-3xl font-calluna font-normal text-neutral-900 dark:text-white mb-4">
            Our Concierge is here to help
          </h3>
          <p className="text-sm font-proda text-neutral-600 dark:text-neutral-400 max-w-md mb-6 leading-relaxed">
            Have a specific sizing inquiry or tracking update request? Speak directly with our archival team.
          </p>
          <a
            href="mailto:concierge@thriftable.archive"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-black dark:bg-white text-white dark:text-black font-mono text-xs uppercase tracking-widest hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Email Support Concierge →
          </a>
        </div>

      </div>
    </div>
  );
}
