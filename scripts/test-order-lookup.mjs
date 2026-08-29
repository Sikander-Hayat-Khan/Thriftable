async function testOrderLookup() {
  const orderId = "cbbcd3d9-139f-40fd-9bec-8e7d9e609db2"; // order created earlier
  console.log("Testing GET /api/orders/" + orderId);

  const res = await fetch(`http://localhost:3000/api/orders/${orderId}`);
  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Returned Order:", {
    id: data.order?.id,
    status: data.order?.status,
    itemsCount: data.order?.items?.length,
    items: data.order?.items,
    trackingNumber: data.order?.trackingNumber,
    pricing: data.order?.pricing
  });
}

testOrderLookup();
