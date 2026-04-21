import { Resend } from "resend";
import { NextResponse } from "next/server";

const DEST = "tidianetambadoupro@gmail.com";

interface SaleItem {
  perfume_name: string;
  brand: string;
  price: number | null;
  private_sale_price: number | null;
  quantity: number;
  sale_quantity: number | null;
}

function buildEmailHtml(shopName: string, month: string, items: SaleItem[]) {
  const rows = items.map(i => {
    const original = i.price ?? 0;
    const vip = i.private_sale_price ?? original;
    const pct = original > 0 ? Math.round((1 - vip / original) * 100) : 0;
    const saleQty = i.sale_quantity ?? i.quantity;
    return `
      <tr>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:600">${i.perfume_name}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666">${i.brand}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;text-decoration:line-through;color:#999;font-family:monospace">${original.toFixed(2)} €</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:800;font-family:monospace;color:#0a0a0a">${vip.toFixed(2)} €</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;color:#666">${pct > 0 ? `−${pct}%` : "—"}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;font-weight:700;color:#0a0a0a">${saleQty}</td>
      </tr>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8f8f8;font-family:'Segoe UI',Arial,sans-serif">
  <div style="max-width:640px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">

    <!-- Header -->
    <div style="background:#0a0a0a;padding:28px 32px">
      <p style="margin:0;color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;opacity:0.4">La Niche CRM</p>
      <h1 style="margin:8px 0 0;color:#ffffff;font-size:22px;font-weight:900;letter-spacing:-0.03em">Nouvelle braderie à mettre en ligne</h1>
    </div>

    <!-- Info -->
    <div style="padding:24px 32px 0">
      <div style="display:flex;gap:24px;flex-wrap:wrap">
        <div style="background:#f8f8f8;border-radius:12px;padding:14px 20px;flex:1;min-width:120px">
          <p style="margin:0;font-size:11px;color:#999;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Boutique</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#0a0a0a">${shopName}</p>
        </div>
        <div style="background:#0a0a0a;border-radius:12px;padding:14px 20px;flex:1;min-width:120px">
          <p style="margin:0;font-size:11px;color:#ffffff;opacity:0.4;font-weight:700;text-transform:uppercase;letter-spacing:0.1em">Lancement prévu</p>
          <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#ffffff;text-transform:capitalize">${month}</p>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div style="padding:24px 32px">
      <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999">
        ${items.length} article${items.length > 1 ? "s" : ""} à mettre en ligne sur Shopify
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:#f8f8f8">
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Parfum</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Marque</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Prix normal</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Prix bradé</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Remise</th>
            <th style="padding:10px 16px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999">Stock</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px 28px;border-top:1px solid #f0f0f0">
      <p style="margin:0;font-size:12px;color:#bbb;text-align:center">
        Envoyé depuis <strong style="color:#0a0a0a">La Niche CRM</strong> · À mettre en ligne sur la boutique Shopify
      </p>
    </div>

  </div>
</body>
</html>`;
}

export async function POST(req: Request) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return NextResponse.json({ error: "RESEND_API_KEY manquante" }, { status: 500 });
  const resend = new Resend(key);

  try {
    const { shopName, month, items } = await req.json() as {
      shopName: string;
      month: string;
      items: SaleItem[];
    };

    if (!items?.length) {
      return NextResponse.json({ error: "Aucun article" }, { status: 400 });
    }

    const result = await resend.emails.send({
      from: "La Niche CRM <onboarding@resend.dev>",
      to: DEST,
      subject: `Braderie ${shopName} — ${month} (${items.length} article${items.length > 1 ? "s" : ""})`,
      html: buildEmailHtml(shopName, month, items),
    });

    if (result.error) {
      console.error("[notify-sale] Resend error:", JSON.stringify(result.error));
      throw new Error(result.error.message ?? "Resend a refusé l'envoi");
    }

    console.log("[notify-sale] Envoyé, id:", result.data?.id);
    return NextResponse.json({ ok: true, id: result.data?.id });
  } catch (err: any) {
    console.error("[notify-sale]", err);
    return NextResponse.json({ error: err.message ?? "Erreur serveur" }, { status: 500 });
  }
}
