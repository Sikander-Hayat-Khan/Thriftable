async function runTest() {
  console.log("Dispatching welcome email test...");
  try {
    const res = await fetch("http://localhost:3000/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "welcome",
        email: "sikandarhayat003@gmail.com",
        name: "Sikander Hayat"
      })
    });

    const data = await res.json();
    console.log("Result:", data);
  } catch (err) {
    console.error("Error:", err);
  }
}

runTest();
