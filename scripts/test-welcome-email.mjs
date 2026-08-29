async function testWelcomeEmail() {
  console.log("Testing /api/send-email for welcome email...");
  const res = await fetch("http://localhost:3000/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "welcome",
      email: "sikandarhayat003@gmail.com",
      name: "Sikander Hayat"
    })
  });

  console.log("Status:", res.status);
  const data = await res.json();
  console.log("Response:", data);
}

testWelcomeEmail();
