import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { type, email, name, order, baseUrl: customBaseUrl } = body;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
    const baseUrl = customBaseUrl || `${protocol}://${host}`;

    if (!email) {
      return NextResponse.json({ error: "Missing recipient email" }, { status: 400 });
    }

    let subject = "";
    let htmlContent = "";
    let textContent = "";
    let trackingUrl = "";

    // 1. ORDER CONFIRMATION EMAIL
    if (type === "order_confirmation" && order) {
      const orderId = order.id || order.orderNumber || "TH-RECEIPT";
      const trackingId = order.supabaseId || order.id || orderId;
      trackingUrl = `${baseUrl}/orders/${encodeURIComponent(trackingId)}`;

      const customerName =
        order.shippingAddress?.firstName
          ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
          : name || "Valued Customer";

      const items = order.items || [];
      const subtotal = Number(order.pricing?.subtotal || order.totalAmount || 0).toFixed(2);
      const shipping = Number(order.pricing?.shipping || order.shippingCost || 0).toFixed(2);
      const discount = Number(order.pricing?.promoDiscount || 0).toFixed(2);
      const total = Number(order.pricing?.total || order.totalAmount || 0).toFixed(2);

      subject = `Order Confirmed #${orderId} — Thriftable Archive`;

      // Build HTML items rows for the table
      const itemsRowsHtml = items
        .map(
          (item) => `
        <tr style="border-bottom: 1px solid #262626;">
          <td style="padding: 14px 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #ffffff; vertical-align: middle;">
            <div style="font-weight: 600; color: #ffffff;">${item.name || "Curated Vintage Garment"}</div>
            ${item.category ? `<div style="font-size: 12px; color: #a3a3a3; font-family: monospace; text-transform: uppercase;">${item.category}</div>` : ""}
          </td>
          <td style="padding: 14px 10px; font-family: monospace; font-size: 13px; color: #d4d4d4; text-align: center; vertical-align: middle;">
            ${item.size || "M"}
          </td>
          <td style="padding: 14px 10px; font-family: monospace; font-size: 13px; color: #d4d4d4; text-align: center; vertical-align: middle;">
            ${item.quantity || 1}
          </td>
          <td style="padding: 14px 10px; font-family: monospace; font-size: 14px; color: #B2A376; text-align: right; vertical-align: middle; font-weight: bold;">
            $${Number(typeof item.price === "string" ? item.price.replace(/[^0-9.]/g, "") : item.price || 0).toFixed(2)}
          </td>
        </tr>
      `
        )
        .join("");

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Georgia', serif; color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; border: 1px solid #262626; border-radius: 2px; overflow: hidden; max-width: 600px; width: 100%;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 36px 30px; text-align: center; border-bottom: 1px solid #262626;">
                      <div style="font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 0.18em; text-transform: uppercase; color: #B2A376; font-weight: bold;">
                        THRIFTABLE
                      </div>
                    </td>
                  </tr>

                  <!-- Confirmation Banner -->
                  <tr>
                    <td style="padding: 36px 30px 20px 30px;">
                      <div style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #B2A376; font-weight: 600; margin-bottom: 8px;">
                        Receipt Confirmed • ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                      <h1 style="font-size: 26px; font-weight: normal; margin: 0 0 16px 0; color: #ffffff; line-height: 1.3;">
                        Thank you for your order, ${customerName}
                      </h1>

                      <div style="background-color: #141414; border: 1px solid #262626; padding: 14px 18px; margin-bottom: 30px; font-family: monospace; font-size: 12px; color: #d4d4d4; display: flex; justify-content: space-between;">
                        <span>ORDER ID: <strong style="color: #ffffff;">${orderId}</strong></span>
                        <span>STATUS: <strong style="color: #B2A376;">PROCESSING</strong></span>
                      </div>
                    </td>
                  </tr>

                  <!-- Items Table -->
                  <tr>
                    <td style="padding: 0 30px 30px 30px;">
                      <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
                        <thead>
                          <tr style="border-bottom: 2px solid #B2A376; background-color: #141414;">
                            <th align="left" style="padding: 10px; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #B2A376;">Item Name</th>
                            <th align="center" style="padding: 10px; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #B2A376;">Size</th>
                            <th align="center" style="padding: 10px; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #B2A376;">Qty</th>
                            <th align="right" style="padding: 10px; font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #B2A376;">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsRowsHtml}
                        </tbody>
                      </table>

                      <!-- Price Breakdown -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 20px; font-family: monospace; font-size: 13px; color: #a3a3a3;">
                        <tr>
                          <td style="padding: 6px 0;">Subtotal</td>
                          <td align="right" style="padding: 6px 0; color: #ffffff;">$${subtotal}</td>
                        </tr>
                        ${Number(discount) > 0 ? `
                        <tr>
                          <td style="padding: 6px 0; color: #B2A376;">Promo Discount</td>
                          <td align="right" style="padding: 6px 0; color: #B2A376;">-$${discount}</td>
                        </tr>
                        ` : ""}
                        <tr>
                          <td style="padding: 6px 0;">Shipping</td>
                          <td align="right" style="padding: 6px 0; color: #ffffff;">${Number(shipping) === 0 ? "FREE" : `$${shipping}`}</td>
                        </tr>
                        <tr style="border-top: 1px solid #333333; font-size: 16px; font-weight: bold;">
                          <td style="padding: 14px 0 6px 0; color: #ffffff;">Total Amount</td>
                          <td align="right" style="padding: 14px 0 6px 0; color: #B2A376; font-size: 18px;">$${total}</td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Tracking CTA Button -->
                  <tr>
                    <td align="center" style="padding: 10px 30px 40px 30px;">
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background-color: #B2A376; border-radius: 0;">
                            <a href="${trackingUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; font-family: monospace; font-size: 13px; font-weight: bold; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em;">
                              Track Your Order Live →
                            </a>
                          </td>
                        </tr>
                      </table>
                      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #737373; margin-top: 14px;">
                        Click above or paste this link into your browser: <br/>
                        <a href="${trackingUrl}" style="color: #a3a3a3; text-decoration: underline; word-break: break-all;">${trackingUrl}</a>
                      </div>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #000000; padding: 24px 30px; text-align: center; border-top: 1px solid #262626; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #525252; line-height: 1.6;">
                      Questions about this piece or grading? Reply directly to this email or reach us at <strong style="color: #737373;">concierge@thriftable.archive</strong>.<br/>
                      © ${new Date().getFullYear()} Thriftable. All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      textContent = `
THRIFTABLE — Order Confirmation #${orderId}
Thank you for your order, ${customerName}!

Order Details:
Status: PROCESSING
Order ID: ${orderId}

Items:
${items.map((it) => `- ${it.name || "Vintage Garment"} | Size: ${it.size || "M"} | Qty: ${it.quantity || 1} | Price: $${Number(typeof it.price === "string" ? it.price.replace(/[^0-9.]/g, "") : it.price || 0).toFixed(2)}`).join("\n")}

Subtotal: $${subtotal}
${Number(discount) > 0 ? `Promo Discount: -$${discount}\n` : ""}Shipping: ${Number(shipping) === 0 ? "FREE" : `$${shipping}`}
Total Amount: $${total}

Track your order live:
${trackingUrl}

Questions? Contact concierge@thriftable.archive
© ${new Date().getFullYear()} Thriftable. All rights reserved.
      `.trim();
    }

    // 2. WELCOME EMAIL ON SIGN UP
    else if (type === "welcome") {
      const recipientName = name || "Fellow Thrifter";
      const shopUrl = `${baseUrl}/shop`;

      subject = `Welcome to the Archive — Enjoy 10% Off Your First Drop`;

      htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #050505; font-family: 'Georgia', serif; color: #ffffff;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #050505; padding: 40px 10px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #0d0d0d; border: 1px solid #262626; border-radius: 2px; overflow: hidden; max-width: 600px; width: 100%;">
                  
                  <!-- Brand Header -->
                  <tr>
                    <td style="background-color: #000000; padding: 36px 30px; text-align: center; border-bottom: 1px solid #262626;">
                      <div style="font-family: 'Georgia', serif; font-size: 28px; letter-spacing: 0.18em; text-transform: uppercase; color: #B2A376; font-weight: bold;">
                        THRIFTABLE
                      </div>
                    </td>
                  </tr>

                  <!-- Welcome Content -->
                  <tr>
                    <td style="padding: 40px 36px 30px 36px;">
                      <h1 style="font-size: 28px; font-weight: normal; margin: 0 0 20px 0; color: #ffffff; line-height: 1.3;">
                        Welcome to Thriftable, ${recipientName}
                      </h1>
                      <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; line-height: 1.7; color: #d4d4d4; margin: 0 0 24px 0;">
                        You have entered our private circle of collectors and conscious fashion enthusiasts. Every piece in our drops is curated by hand, graded for authenticity, and preserved for longevity.
                      </p>

                      <!-- Voucher Box -->
                      <div style="background-color: #141414; border: 1px dashed #B2A376; padding: 24px; text-align: center; margin: 30px 0;">
                        <div style="font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.2em; color: #a3a3a3; margin-bottom: 6px;">
                          Your Welcome Invitation
                        </div>
                        <div style="font-size: 24px; font-weight: bold; color: #B2A376; font-family: monospace; letter-spacing: 0.1em;">
                          THRIFT10
                        </div>
                        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #737373; margin-top: 8px;">
                          Apply at checkout for 10% off your first archival acquisition.
                        </div>
                      </div>

                      <p style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #a3a3a3; margin: 0 0 32px 0;">
                        New archival capsule drops go live every Thursday at 8:00 PM. As a registered member, your account is now ready to save pieces to your permanent archive and track orders in real time.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="background-color: #B2A376;">
                            <a href="${shopUrl}" target="_blank" style="display: block; padding: 16px 32px; font-family: monospace; font-size: 13px; font-weight: bold; color: #000000; text-decoration: none; text-transform: uppercase; letter-spacing: 0.15em; text-align: center;">
                              Explore The Collection →
                            </a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #000000; padding: 24px 30px; text-align: center; border-top: 1px solid #262626; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #525252; line-height: 1.6;">
                      You are receiving this because you joined the Thriftable community.<br/>
                      © ${new Date().getFullYear()} Thriftable. All rights reserved.
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `;

      textContent = `
THRIFTABLE — Welcome to the Archive

Welcome to Thriftable, ${recipientName}!

You have entered our private circle of collectors and conscious fashion enthusiasts. Every piece in our drops is curated by hand, graded for authenticity, and preserved for longevity.

Your Welcome Invitation Voucher:
Code: THRIFT10 (10% off your first archival acquisition at checkout)

Explore the latest collection drops:
${shopUrl}

© ${new Date().getFullYear()} Thriftable. All rights reserved.
      `.trim();
    } else {
      return NextResponse.json({ error: "Unsupported email type" }, { status: 400 });
    }

    // 3. DISPATCH VIA GMAIL SMTP OR RESEND
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY || process.env.RESEN_API_KEY;
    let dispatchStatus = "simulated (console only)";

    // Priority 1: Gmail SMTP (Sends to ANY customer for free without domain setup)
    if (smtpUser && smtpPass) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: {
            user: smtpUser.trim(),
            pass: smtpPass.trim().replace(/\s/g, ""), // removes Google App Password spaces
          },
        });

        const info = await transporter.sendMail({
          from: `"Thriftable" <${smtpUser.trim()}>`,
          replyTo: smtpUser.trim(),
          to: email,
          subject: subject,
          text: textContent,
          html: htmlContent,
          headers: {
            "X-Entity-Ref-ID": crypto.randomUUID(),
          },
        });

        dispatchStatus = `Delivered via Gmail SMTP (ID: ${info.messageId})`;
      } catch (err) {
        dispatchStatus = `Gmail SMTP Error: ${err.message}`;
        console.warn("⚠️ Gmail SMTP Error:", err);
      }
    }
    // Priority 2: Resend API
    else if (resendApiKey) {
      try {
        const fromEmail = process.env.EMAIL_FROM || "Thriftable <onboarding@resend.dev>";
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey.trim()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [email],
            subject: subject,
            text: textContent,
            html: htmlContent,
          }),
        });

        const resBody = await res.json();
        if (res.ok) {
          dispatchStatus = `Delivered via Resend (ID: ${resBody.id})`;
        } else {
          dispatchStatus = `Resend Error: ${resBody.message || resBody.name || "Failed"}`;
          console.warn("⚠️ Resend API Notice:", resBody);
        }
      } catch (err) {
        dispatchStatus = `Resend Exception: ${err.message}`;
        console.warn("Resend dispatch exception:", err);
      }
    }

    // Log receipt to terminal for immediate development verification
    console.log(`\n================ 📧 TRANSACTIONAL EMAIL (${type.toUpperCase()}) ================`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subject}`);
    if (trackingUrl) console.log(`Direct Tracking Link: ${trackingUrl}`);
    console.log(`Status: ${dispatchStatus}`);
    console.log(`=================================================================================\n`);

    return NextResponse.json({
      success: true,
      type,
      recipient: email,
      trackingUrl: trackingUrl || undefined,
      status: dispatchStatus,
    });
  } catch (error) {
    console.error("Email route error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
