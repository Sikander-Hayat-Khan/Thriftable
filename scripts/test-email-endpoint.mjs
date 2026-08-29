async function testEmailEndpoint() {
  console.log("Testing /api/send-email (Order Confirmation)...");
  const res1 = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "order_confirmation",
      email: "ayesha.khan@example.com",
      order: {
        id: "TH-849201",
        supabaseId: "cbbcd3d9-139f-40fd-9bec-8e7d9e609db2",
        shippingAddress: { firstName: "Ayesha", lastName: "Khan" },
        items: [
          { name: "Vintage 90s Heavyweight Graphic Tee", size: "L", quantity: 1, price: 48.0, category: "Streetwear" },
          { name: "Heritage Double-Breasted Wool Overcoat", size: "XL", quantity: 1, price: 84.0, category: "Tailoring" }
        ],
        pricing: { subtotal: 132, shipping: 0, promoDiscount: 13.2, total: 118.8 }
      }
    })
  });

  const json1 = await res1.json();
  console.log("Order confirmation response:", json1);

  console.log("\nTesting /api/send-email (Welcome on Sign Up)...");
  const res2 = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "welcome",
      email: "newmember@example.com",
      name: "Tariq Mahmood"
    })
  });

  const json2 = await res2.json();
  console.log("Welcome email response:", json2);
}

testEmailEndpoint();
