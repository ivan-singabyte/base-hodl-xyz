function withValidProperties(
  properties: Record<string, undefined | string | string[] | boolean>
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([_, value]) =>
      Array.isArray(value) ? value.length > 0 : !!value
    )
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL || 'https://www.base-hodl.xyz';

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjExMzU5NTMsInR5cGUiOiJhdXRoIiwia2V5IjoiMHg0MjYzODU0ZjhkMDRkYmVCMERFZkYwNzlmNEViZDE4MGJhMTY4RjlEIn0",
      payload: "eyJkb21haW4iOiJ3d3cuYmFzZS1ob2RsLnh5eiJ9",
      signature: "Wklk0KhLSQLnEbuf2RbHh35RzDvI52No1LpaYPgjJ5d7tg01cNxt+FGXu6hMHQQoG9dRFqWFRUPZ8Nx3KP5AdBs="
    },
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "HODL Vault",
      subtitle: "Lock tokens with diamond hands",
      description: "Timelock any ERC20 token on Base with fixed durations. No early withdrawal and completely free.",
      iconUrl: `${URL}/icon-512.png`,
      splashImageUrl: `${URL}/og-image.png`,
      splashBackgroundColor: "#0A0B0D",
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: "finance",
      tags: ["defi", "vault", "hodl", "lock", "base"],
      heroImageUrl: `${URL}/og-image.png`,
      screenshotUrls: [
        `${URL}/screenshot-home.png`,
        `${URL}/screenshot-dashboard.png`
      ]
    })
  });
}