"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { catalogueItems } from "@/data/products";
import { showCartToast, showStockWarningToast } from "./cart-toast";

const CartContext = createContext({
  cartItems: [],
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  cartCount: 0,
  cartTotal: "$0.00",
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Close cart on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (item, color = null, options = { openDrawer: false, quantity: 1 }) => {
    const qtyToAdd = typeof options === "object" && options?.quantity ? Number(options.quantity) : 1;
    const maxStock = item.stock !== undefined ? Number(item.stock) : 10;
    let limitHit = false;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        if (currentQty + qtyToAdd > maxStock) {
          limitHit = true;
          const newQty = Math.max(currentQty, maxStock);
          if (newQty === currentQty) return prev;
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            stock: maxStock,
            quantity: newQty,
          };
          return updated;
        }
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          stock: maxStock,
          quantity: currentQty + qtyToAdd,
        };
        return updated;
      }

      if (qtyToAdd > maxStock) {
        limitHit = true;
        return [
          ...prev,
          {
            ...item,
            stock: maxStock,
            quantity: Math.max(1, maxStock),
            selectedColor: color || item.colors?.[0] || { name: "Default", hex: "#171717" },
          },
        ];
      }

      return [
        ...prev,
        {
          ...item,
          stock: maxStock,
          quantity: qtyToAdd,
          selectedColor: color || item.colors?.[0] || { name: "Default", hex: "#171717" },
        },
      ];
    });

    if (limitHit) {
      showStockWarningToast(item, maxStock);
    } else {
      showCartToast(item, color, openCart);
    }

    if (options?.openDrawer) {
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity = (id, delta) => {
    let limitHit = false;
    let hitItem = null;

    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const maxStock = item.stock !== undefined ? Number(item.stock) : 10;
            if (delta > 0 && item.quantity >= maxStock) {
              limitHit = true;
              hitItem = item;
              return item;
            }
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(newQty, maxStock) } : null;
          }
          return item;
        })
        .filter(Boolean)
    );

    if (limitHit && hitItem) {
      showStockWarningToast(hitItem, hitItem.stock !== undefined ? hitItem.stock : 10);
    }
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const cartTotal = useMemo(() => {
    const sum = cartItems.reduce((acc, item) => {
      const numericPrice = parseFloat(item.price.replace("$", "")) || 0;
      return acc + numericPrice * item.quantity;
    }, 0);
    return `$${sum.toFixed(2)}`;
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
