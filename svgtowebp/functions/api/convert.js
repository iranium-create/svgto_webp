import initWasm, { Resvg } from "@resvg/resvg-wasm-cloudflare";

export default {
  async fetch(request) {
    // WASM 초기화
    await initWasm();

    const url = new URL(request.url);
    const text = url.searchParams.get("text") || "Hello";

    // SVG 생성 (당신의 코드 그대로 넣으면 됨)
    const svg = `
      <svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="800" height="200" fill="#222" />
        <text x="400" y="120" fill="white" font-size="48" font-family="sans-serif" text-anchor="middle">${text}</text>
      </svg>
    `;

    // SVG → PNG (RGBA buffer 출력)
    const resvg = new Resvg(svg, {
      fitTo: { mode: "original" },
    });

    const rendered = resvg.render();
    const pngBytes = rendered.asPng(); // Uint8Array

    // PNG → WebP (Cloudflare Image API 이용)
    const img = new ImageData(new Uint8ClampedArray(rendered.pixels), rendered.width, rendered.height);
    const webp = await new Response(img).arrayBuffer();

    return new Response(webp, {
      headers: { "Content-Type": "image/webp" },
    });
  },
};
