"use client";

import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { catalogueItems } from "@/data/products";

const CartContext = createContext({
  cartItems: [],
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  toggleCart: () => {},
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  cartCount: 0,
  cartTotal: "$0.00",
});

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([
    {
      ...catalogueItems[0],
      quantity: 1,
      selectedColor: catalogueItems[0].colors?.[0] || { name: "Default", hex: "#DDC55B" },
    },
    {
      ...catalogueItems[1],
      quantity: 1,
      selectedColor: catalogueItems[1].colors?.[0] || { name: "Washed Black", hex: "#1f1f1f" },
    },
  ]);
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

  const addToCart = (item, color = null) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      }
      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          selectedColor: color || item.colors?.[0] || { name: "Default", hex: "#171717" },
        },
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
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
