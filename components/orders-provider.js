"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "./auth-provider";
import { catalogueItems } from "@/data/products";
import { createClient } from "@/utils/supabase/client";

const OrdersContext = createContext({
  orders: [],
  loading: true,
  getOrder: () => undefined,
  createOrder: async () => {},
  updateOrderStatus: () => {},
  requestReturn: () => {},
  cancelOrder: () => {},
});

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Load orders strictly from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setLoading(true);

      if (user) {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*, order_items(*)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (!error && data && isMounted) {
            const formatted = data.map((row) => {
              let shippingAddr = {};
              try {
                shippingAddr =
                  typeof row.shipping_address === "string"
                    ? JSON.parse(row.shipping_address)
                    : row.shipping_address || {};
              } catch {
                shippingAddr = { street: String(row.shipping_address || "") };
              }

              const items = (row.order_items || []).map((it) => ({
                id: it.product_id || it.id,
                productId: it.product_id,
                name: it.name || "Curated Vintage Piece",
                price: Number(it.price) || 0,
                numericPrice: Number(it.price) || 0,
                size: it.size || "M",
                quantity: Number(it.quantity) || 1,
                image: it.image || "/shop/streetwear/street1.jpg",
              }));

              const total =
                Number(row.total_amount) ||
                items.reduce((acc, it) => acc + it.price * it.quantity, 0);

              return {
                id: row.id,
                userId: row.user_id,
                userEmail: shippingAddr?.email || user.email,
                createdAt: row.created_at,
                status: row.status || "Processing",
                estimatedDelivery: new Date(
                  new Date(row.created_at).getTime() + 3 * 24 * 3600 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }),
                deliveredAt: row.status === "Delivered" ? row.created_at : null,
                trackingNumber: `TRK-PK-${String(row.id).slice(0, 8).toUpperCase()}`,
                carrier: "DHL Express Carbon Neutral",
                shippingMethod: "standard",
                shippingMethodLabel: "Standard Tracked Delivery (3–5 Days)",
                shippingCost: 0,
                paymentMethod:
                  typeof row.payment_method === "string" ? row.payment_method : "card",
                paymentDetails: {
                  brand: "Credit Card / Online",
                  paid: true,
                },
                shippingAddress: shippingAddr,
                items,
                pricing: {
                  subtotal: total,
                  promoDiscount: 0,
                  promoCode: null,
                  loyaltyDiscount: 0,
                  shipping: 0,
                  tax: 0,
                  total: total,
                },
                timeline: [
                  {
                    title: "Order Placed & Verified",
                    description: "Order synced with Supabase database.",
                    time: new Date(row.created_at).toLocaleString(),
                    completed: true,
                  },
                  {
                    title: "Archival Quality Check & Packaged",
                    description:
                      "Verification of garment condition, tags, and compostable packaging.",
                    time: row.status !== "Processing" ? "Completed" : "Processing",
                    completed: row.status !== "Processing",
                  },
                  {
                    title: "In Transit with Carrier",
                    description: "Handover to DHL Express Carbon Neutral.",
                    time:
                      row.status === "In Transit" || row.status === "Delivered"
                        ? "In Transit"
                        : "Pending Dispatch",
                    completed:
                      row.status === "In Transit" || row.status === "Delivered",
                  },
                  {
                    title: "Delivered",
                    description: "Delivered to destination address.",
                    time:
                      row.status === "Delivered" ? "Delivered" : "Estimated in 3-5 days",
                    completed: row.status === "Delivered",
                  },
                ],
                returnDetails: null,
              };
            });

            setOrders(formatted);
          } else if (isMounted) {
            setOrders([]);
          }
        } catch (err) {
          console.warn("Could not load orders from Supabase:", err);
          if (isMounted) setOrders([]);
        }
      } else {
        if (isMounted) setOrders([]);
      }

      if (isMounted) setLoading(false);
    }

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [user, supabase]);

  // Find order by ID
  const getOrder = useCallback(
    (id) => {
      if (!id) return undefined;
      const cleanId = String(id).trim().toUpperCase();
      return orders.find(
        (o) =>
          (o.id && o.id.toUpperCase() === cleanId) ||
          (o.supabaseId && o.supabaseId.toUpperCase() === cleanId) ||
          (o.id && o.id.toUpperCase().replace("#", "") === cleanId.replace("#", ""))
      );
    },
    [orders]
  );

  // In-memory update helper
  const persistOrders = useCallback((updatedOrders) => {
    setOrders(updatedOrders);
  }, []);

  // Create a new order (from checkout)
  const createOrder = useCallback(
    async (orderData) => {
      const orderId =
        orderData.id || `TH-${Math.floor(100000 + Math.random() * 900000)}`;
      const now = new Date();
      const estDays = orderData.shippingMethod === "express" ? 2 : 4;
      const estDelivery = new Date(now.getTime() + estDays * 24 * 60 * 60 * 1000);

      const trackingNumber = `TRK-PK-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const carrier =
        orderData.shippingMethod === "express"
          ? "TCS Express Priority"
          : "DHL Express Carbon Neutral";

      const newOrder = {
        id: orderId,
        userId: user?.id || "guest",
        userEmail: orderData.shippingAddress?.email || user?.email || "",
        createdAt: now.toISOString(),
        status: "Processing",
        estimatedDelivery: estDelivery.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        deliveredAt: null,
        trackingNumber: trackingNumber,
        carrier: carrier,
        shippingMethod: orderData.shippingMethod || "standard",
        shippingMethodLabel:
          orderData.shippingMethod === "express"
            ? "Express Priority (1–2 Days)"
            : "Standard Tracked (3–5 Days)",
        shippingCost: orderData.pricing?.shipping || 0,
        paymentMethod: orderData.paymentMethod || "card",
        paymentDetails: orderData.paymentDetails || {
          brand: orderData.paymentMethod === "card" ? "Credit Card" : orderData.paymentMethod,
          paid: orderData.paymentMethod !== "cod",
        },
        shippingAddress: orderData.shippingAddress || {},
        items: orderData.items || [],
        pricing: orderData.pricing || {
          subtotal: 0,
          promoDiscount: 0,
          promoCode: null,
          loyaltyDiscount: 0,
          shipping: 0,
          tax: 0,
          total: 0,
        },
        timeline: [
          {
            title: "Order Placed & Verified",
            description: "Order received and archive reservation secured.",
            time: now.toLocaleString(),
            completed: true,
          },
          {
            title: "Archival Quality Check & Packaged",
            description: "Verification of garment condition, tags, and compostable packaging.",
            time: "Processing",
            completed: false,
          },
          {
            title: "In Transit with Carrier",
            description: `Handover to ${carrier}.`,
            time: "Pending Dispatch",
            completed: false,
          },
          {
            title: "Out for Delivery",
            description: "With local courier for final doorstep handover.",
            time: "Pending",
            completed: false,
          },
          {
            title: "Delivered",
            description: "Delivered to destination address.",
            time: `Est. ${estDelivery.toLocaleDateString()}`,
            completed: false,
          },
        ],
        returnDetails: null,
      };

      const updated = [newOrder, ...orders];
      persistOrders(updated);

      // Generate valid UUID for Supabase order foreign key relation
      const orderUuid =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "00000000-0000-0000-0000-000000000000".replace(/[0]/g, () =>
              Math.floor(Math.random() * 16).toString(16)
            );

      newOrder.supabaseId = orderUuid;

      // Attempt to sync with Supabase for both authenticated and guest checkout
      try {
        const { error: orderErr } = await supabase.from("orders").insert({
          id: orderUuid,
          user_id: user?.id || null,
          status: "processing", // PostgreSQL check constraint requires lowercase status
          total_amount: Number(newOrder.pricing?.total || 0),
          shipping_address:
            typeof newOrder.shippingAddress === "string"
              ? newOrder.shippingAddress
              : JSON.stringify(newOrder.shippingAddress),
          payment_method:
            typeof newOrder.paymentMethod === "string"
              ? newOrder.paymentMethod
              : JSON.stringify(newOrder.paymentMethod),
          created_at: newOrder.createdAt,
        });

        if (!orderErr) {
          if (newOrder.items && newOrder.items.length > 0) {
            const lineItems = newOrder.items.map((item) => {
              const rawPrice =
                typeof item.price === "string"
                  ? Number(item.price.replace(/[^0-9.]/g, ""))
                  : Number(item.price || item.numericPrice || 0);

              return {
                order_id: orderUuid,
                product_id: String(item.id || item.productId || "item"),
                quantity: Number(item.quantity || 1),
                price: isNaN(rawPrice) ? 0 : rawPrice,
                size: String(item.size || "M"),
                image: String(item.image || "/shop/streetwear/street1.jpg"),
                name: String(item.name || item.title || "Vintage Piece"),
              };
            });

            const { error: itemErr } = await supabase
              .from("order_items")
              .insert(lineItems);

            if (itemErr) {
              console.warn("Supabase order_items insert warning:", itemErr);
            }
          }
        } else {
          console.warn("Supabase orders insert warning:", orderErr);
        }
      } catch (e) {
        console.warn("Supabase order insert skipped/error:", e);
      }

      // Send Order Confirmation Email with itemized table & tracking link
      const customerEmail =
        newOrder.userEmail || newOrder.shippingAddress?.email || user?.email;

      if (customerEmail) {
        try {
          fetch("/api/send-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "order_confirmation",
              email: customerEmail,
              order: newOrder,
            }),
          }).catch((err) => console.warn("Order email trigger error:", err));
        } catch (e) {
          console.warn("Order email trigger exception:", e);
        }
      }

      return newOrder;
    },
    [orders, persistOrders, user, supabase]
  );

  // Update order status
  const updateOrderStatus = useCallback(
    (orderId, newStatus) => {
      const updated = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            deliveredAt: newStatus === "Delivered" ? new Date().toISOString() : o.deliveredAt,
          };
        }
        return o;
      });
      persistOrders(updated);
    },
    [orders, persistOrders]
  );

  // Request a Return for an Order
  const requestReturn = useCallback(
    (orderId, returnPayload) => {
      const rmaNumber = `RMA-${orderId.replace("#", "")}-${Math.floor(100 + Math.random() * 900)}`;
      const now = new Date();

      const returnDetails = {
        rmaNumber: rmaNumber,
        requestedAt: now.toISOString(),
        status: "Return Processing", // "Return Processing" | "Approved" | "Received" | "Refunded"
        items: returnPayload.items || [],
        reason: returnPayload.reason || "Size/Fit issue",
        method: returnPayload.method || "outlet", // "outlet" | "courier"
        resolution: returnPayload.resolution || "credit", // "credit" | "refund"
        notes: returnPayload.notes || "",
        outletDropoffLocation: returnPayload.method === "outlet" ? "Thriftable Vault #01 - F-7 Markaz, Islamabad" : null,
      };

      const updated = orders.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = [
            ...o.timeline,
            {
              title: "Return Initiated (RMA Issued)",
              description: `Return authorization issued (${rmaNumber}). Handover via ${
                returnDetails.method === "outlet" ? "Physical Outlet Drop-off" : "Scheduled Courier Pickup"
              }.`,
              time: now.toLocaleString(),
              completed: true,
            },
          ];

          return {
            ...o,
            status: "Return Requested",
            returnDetails: returnDetails,
            timeline: updatedTimeline,
          };
        }
        return o;
      });

      persistOrders(updated);
      return returnDetails;
    },
    [orders, persistOrders]
  );

  // Cancel order
  const cancelOrder = useCallback(
    (orderId, reason = "Cancelled by customer") => {
      const now = new Date();
      const updated = orders.map((o) => {
        if (o.id === orderId) {
          const updatedTimeline = [
            ...o.timeline,
            {
              title: "Order Cancelled",
              description: reason,
              time: now.toLocaleString(),
              completed: true,
            },
          ];
          return {
            ...o,
            status: "Cancelled",
            timeline: updatedTimeline,
          };
        }
        return o;
      });
      persistOrders(updated);
    },
    [orders, persistOrders]
  );

  const value = {
    orders,
    loading,
    getOrder,
    createOrder,
    updateOrderStatus,
    requestReturn,
    cancelOrder,
  };

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
