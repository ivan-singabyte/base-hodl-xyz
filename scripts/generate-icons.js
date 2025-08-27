const fs = require('fs');
const path = require('path');

// Simple SVG icon template
const createIcon = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="20" fill="url(#gradient)"/>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0052FF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0033CC;stop-opacity:1" />
    </linearGradient>
  </defs>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="white" text-anchor="middle" dy=".35em">H</text>
</svg>`;

// Convert SVG to PNG using a data URL (placeholder approach)
const svgToPngDataUrl = (svg) => {
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
};

// Create icon files
const sizes = [
  { name: 'icon-144.png', size: 144 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

const publicDir = path.join(__dirname, '..', 'public');

sizes.forEach(({ name, size }) => {
  const svg = createIcon(size);
  const filePath = path.join(publicDir, name);
  
  // For now, we'll save SVGs with PNG extension as placeholders
  // In production, you'd want to use a proper SVG to PNG converter
  fs.writeFileSync(filePath, svg);
  console.log(`Created ${name}`);
});

console.log('Icon files created successfully!');