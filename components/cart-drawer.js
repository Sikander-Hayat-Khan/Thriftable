"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart } from "./cart-provider";

export default function CartDrawer() {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  } = useCart();

  return (
    <>
      {/* Dimmed backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-70 transition-opacity duration-500 ${
          isCartOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* 40vw Right-Side Sliding Cart Drawer */}
      <aside
        aria-label="Shopping Cart Drawer"
        className={`fixed top-0 right-0 h-screen w-full sm:w-[460px] lg:w-[40vw] max-w-[600px] z-80 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-2xl flex flex-col justify-between border-l border-black/10 dark:border-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-6 sm:px-8 py-5 border-b border-black/10 dark:border-white/10 flex items-center justify-between shrink-0 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-macsans font-bold tracking-wider text-neutral-900 dark:text-white uppercase">
              Shopping Cart
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-[#B2A376]/20 text-[#756b4e] font-extrabold">
              {cartCount}
            </span>
          </div>

          <button
            onClick={closeCart}
            aria-label="Close cart drawer"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Cart Items List */}
        <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6 space-y-6">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-16 h-16 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center mb-4 text-neutral-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-8 h-8"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <p className="text-sm font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                Your cart is currently empty.
              </p>
              <button
                onClick={closeCart}
                className="mt-4 text-xs font-mono uppercase tracking-widest text-[#B2A376] hover:underline cursor-pointer"
              >
                Continue Browsing →
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 pb-6 border-b border-black/5 dark:border-white/5 last:border-b-0"
              >
                {/* Small Product Image Thumbnail */}
                <div className="relative w-20 h-26 sm:w-22 sm:h-28 bg-neutral-100 dark:bg-neutral-800 rounded-none overflow-hidden shrink-0 border border-black/10 dark:border-white/10">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="100px"
                    className={`object-cover ${item.objectPosition || "object-center"}`}
                  />
                </div>

                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between min-h-26 sm:min-h-28">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-proda font-bold text-sm sm:text-base text-neutral-900 dark:text-white leading-snug">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name} from cart`}
                        className="text-neutral-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Remove item"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-xs sm:text-sm font-proda font-semibold text-neutral-900 dark:text-white">
                      {item.price}
                    </div>

                    {/* Color & Size Attributes */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      {item.selectedColor && (
                        <div className="flex font-proda items-center gap-1.5">
                          <span>Color:</span>
                          <span
                            className="w-3 h-3 rounded-none border border-black/20 dark:border-white/20 inline-block"
                            style={{ backgroundColor: item.selectedColor.hex }}
                            title={item.selectedColor.name}
                          />
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium capitalize">
                            {item.selectedColor.name}
                          </span>
                        </div>
                      )}
                      <div className="flex font-proda items-center gap-1">
                        <span>Size:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 font-medium uppercase">
                          {item.size}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Increment/Decrement Controls */}
                  <div className="flex items-center justify-between pt-3">
                    <div className="flex items-center border border-black/15 dark:border-white/15">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        aria-label="Decrease quantity"
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-mono"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-mono font-semibold text-neutral-900 dark:text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        aria-label="Increase quantity"
                        className="w-7 h-7 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-sm font-mono"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-proda tracking-wider text-neutral-400 uppercase">
                      Subtotal: <span className="text-neutral-900 dark:text-white font-semibold">${(parseFloat(item.price.replace("$", "")) * item.quantity).toFixed(2)}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bottom Checkout & Actions Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 sm:p-8 border-t border-black/10 dark:border-white/10 bg-neutral-50/80 dark:bg-neutral-900/80 backdrop-blur-md shrink-0 flex flex-col gap-4">
            {/* Total Row */}
            <div className="flex items-center justify-between text-sm sm:text-base font-proda uppercase tracking-wider">
              <span className="text-neutral-500 dark:text-neutral-400">Total</span>
              <span className="text-xl font-bold text-neutral-900 dark:text-white font-mono">
                {cartTotal}
              </span>
            </div>

            <p className="text-[11px] font-proda tracking-widest text-neutral-500 dark:text-neutral-400">
              Shipping, taxes, and discounts calculated at checkout.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="w-full py-4 bg-[#B2A376] hover:bg-black hover:text-white text-black font-semibold text-xs uppercase tracking-widest text-center shadow-lg transition-all duration-400 ease-out active:scale-98 rounded-none dark:hover:bg-white dark:hover:text-black"
              >
                Proceed to Checkout
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="w-full py-3 border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white hover:border-black dark:hover:border-white text-xs font-mono uppercase tracking-widest text-center transition-colors rounded-none"
              >
                View Full Cart Page
              </Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
