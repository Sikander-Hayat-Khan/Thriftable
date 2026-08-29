import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req, { params }) {
  try {
    const resolvedParams = typeof params?.then === "function" ? await params : params;
    const orderId = resolvedParams?.id;

    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({ error: "Missing Supabase configuration" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Try finding by UUID id or custom string
    let orderRow = null;
    let itemsRows = [];

    // Query 1: Direct match on id
    const { data: orderData, error: orderErr } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();

    if (orderData) {
      orderRow = orderData;
      itemsRows = orderData.order_items || [];
    }

    if (!orderRow) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    let shippingAddr = {};
    try {
      shippingAddr =
        typeof orderRow.shipping_address === "string"
          ? JSON.parse(orderRow.shipping_address)
          : orderRow.shipping_address || {};
    } catch {
      shippingAddr = { street: String(orderRow.shipping_address || "") };
    }

    const items = itemsRows.map((it) => ({
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
      Number(orderRow.total_amount) ||
      items.reduce((acc, it) => acc + it.price * it.quantity, 0);

    const formattedOrder = {
      id: orderRow.id,
      supabaseId: orderRow.id,
      userId: orderRow.user_id,
      userEmail: shippingAddr?.email || "",
      createdAt: orderRow.created_at,
      status: orderRow.status || "processing",
      estimatedDelivery: new Date(
        new Date(orderRow.created_at).getTime() + 3 * 24 * 3600 * 1000
      ).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      deliveredAt: orderRow.status === "delivered" ? orderRow.created_at : null,
      trackingNumber: `TRK-PK-${String(orderRow.id).slice(0, 8).toUpperCase()}`,
      carrier: "DHL Express Carbon Neutral",
      shippingMethod: "standard",
      shippingMethodLabel: "Standard Tracked Delivery (3–5 Days)",
      shippingCost: 0,
      paymentMethod:
        typeof orderRow.payment_method === "string" ? orderRow.payment_method : "card",
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
          time: new Date(orderRow.created_at).toLocaleString(),
          completed: true,
        },
        {
          title: "Archival Quality Check & Packaged",
          description:
            "Verification of garment condition, tags, and compostable packaging.",
          time: orderRow.status !== "processing" ? "Completed" : "Processing",
          completed: orderRow.status !== "processing",
        },
        {
          title: "In Transit with Carrier",
          description: "Handover to DHL Express Carbon Neutral.",
          time:
            orderRow.status === "shipped" || orderRow.status === "delivered"
              ? "In Transit"
              : "Pending Dispatch",
          completed:
            orderRow.status === "shipped" || orderRow.status === "delivered",
        },
        {
          title: "Delivered",
          description: "Delivered to destination address.",
          time:
            orderRow.status === "delivered"
              ? "Delivered"
              : "Estimated in 3-5 days",
          completed: orderRow.status === "delivered",
        },
      ],
      returnDetails: null,
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (err) {
    console.error("Order lookup API error:", err);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
