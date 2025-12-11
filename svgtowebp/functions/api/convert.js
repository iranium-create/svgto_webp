export async function onRequest(context) {
  const url = new URL(context.request.url);

  async function svgToWebp(svgString, quality = 1) {
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.src = url;
  
    await new Promise(resolve => img.onload = resolve);
  
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  
    return new Promise(resolve => {
        canvas.toBlob(blob => resolve(blob), 'image/webp', quality);
    });
    }

  // URL 파라미터 받기
  const location = url.searchParams.get('location') || '???';
  const date = url.searchParams.get('date') || 'MM/DD';
  const time = url.searchParams.get('time') || 'HH:MM';
  const job = url.searchParams.get('tech') || '???';
  const faction = url.searchParams.get('faction') || '???';
  const ability = url.searchParams.get('ability') || '???';
  const char = url.searchParams.get('char') || '???';
  const emoji = url.searchParams.get('emoji') || '?';
  const relation = url.searchParams.get('relation') || '???';
  const incident = url.searchParams.get('incident') || '???';

  // 관계 파싱 (. 으로 구분)
  const chars = char.split('.');
  const emojis = emoji.split('.');
  const relations = relation.split('.');

  // 관계 텍스트 생성
  let relationLines = '';
  for (let i = 0; i < chars.length; i++) {
    const y = 300 + (i * 40);
    relationLines += `<text x="400" y="${y}" fill="white" font-size="28" font-family="'Noto Sans KR', sans-serif" font-weight="200">${chars[i]} | ${emojis[i] || '?'} | ${relations[i] || '???'}</text>`;
  }

  // 배경 이미지 로드 (선택사항)
  let bgImage = '';
  try {
    const bgUrl = url.origin + '/status-bg.png';
    const bgResponse = await fetch(bgUrl);
    const bgBuffer = await bgResponse.arrayBuffer();
    const bgBase64 = btoa(String.fromCharCode(...new Uint8Array(bgBuffer)));
    bgImage = `<image href="data:image/png;base64,${bgBase64}" width="1000" height="500"/>`;
  } catch (e) {
    // 배경 이미지 없으면 검정 배경
    bgImage = `<rect width="1000" height="500" fill="#1a1a2e"/>`;
  }

  // SVG 생성
  const svg = `
    <svg width="1000" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@200;700&amp;display=swap');
        </style>
      </defs>
      ${bgImage}
      <text x="50" y="80" fill="white" font-size="32" font-family="'Noto Sans KR', sans-serif" font-weight="200">${location}</text>
      <text x="350" y="80" fill="white" font-size="32" font-family="'Noto Sans KR', sans-serif" font-weight="200">${date}</text>
      <text x="550" y="80" fill="white" font-size="32" font-family="'Noto Sans KR', sans-serif" font-weight="200">${time}</text>
      <text x="750" y="80" fill="white" font-size="32" font-family="'Noto Sans KR', sans-serif" font-weight="200">${job}</text>
      <text x="150" y="200" fill="white" font-size="40" font-family="'Noto Sans KR', sans-serif" font-weight="700" text-anchor="middle">${faction}</text>
      <text x="150" y="250" fill="white" font-size="24" font-family="'Noto Sans KR', sans-serif" font-weight="200" text-anchor="middle">${ability}</text>
      ${relationLines}
      <text x="400" y="450" fill="white" font-size="28" font-family="'Noto Sans KR', sans-serif" font-weight="200">${incident}</text>
    </svg>
  `;

  const webp_blob = svgToWebp(svg)

  return new Response(webp_blob, {
    headers: {
      'Content-Type': 'image/webp',
      'Cache-Control': 'public, max-age=300',
    },
  });
}