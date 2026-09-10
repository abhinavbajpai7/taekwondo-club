const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function generateOptionAIcons() {
  const srcImage = 'C:/Users/abhim/.gemini/antigravity/brain/6ed89e04-6031-442e-adc4-c95797a70598/app_icon_notext.png';
  const outDir = 'C:/Users/abhim/.gemini/antigravity/scratch/taekwondo-club/public/icons';
  const pubDir = 'C:/Users/abhim/.gemini/antigravity/scratch/taekwondo-club/public';

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Create 512x512 Option A SVG template
  // SVG composite: Dark squircle with red rim + inner white badge with cleaned artwork
  const b64Art = fs.readFileSync(srcImage).toString('base64');
  const artDataUri = 'data:image/png;base64,' + b64Art;

  const svg512 = `
  <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <!-- Outer Squircle Clip -->
      <clipPath id="squircleClip">
        <rect x="0" y="0" width="512" height="512" rx="115" ry="115" />
      </clipPath>
      <!-- Inner White Badge Clip -->
      <clipPath id="innerBadgeClip">
        <rect x="36" y="36" width="440" height="440" rx="90" ry="90" />
      </clipPath>
      <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
        <stop offset="60%" stop-color="#ef4444" stop-opacity="0.1" />
        <stop offset="98%" stop-color="#ef4444" stop-opacity="0.9" />
        <stop offset="100%" stop-color="#ef4444" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="50%" stop-color="#080c14" />
        <stop offset="100%" stop-color="#000000" />
      </linearGradient>
    </defs>

    <!-- Outer Squircle Container -->
    <g clip-path="url(#squircleClip)">
      <!-- Dark Dojo Background -->
      <rect width="512" height="512" fill="url(#bgGrad)" />

      <!-- Crimson Energy Rim & Glow -->
      <rect x="4" y="4" width="504" height="504" rx="112" fill="none" stroke="#ef4444" stroke-width="6" stroke-opacity="0.65" />
      <rect width="512" height="512" fill="url(#rimGlow)" />

      <!-- Inner White Badge -->
      <rect x="36" y="36" width="440" height="440" rx="90" fill="#ffffff" stroke="#ef4444" stroke-width="4" stroke-opacity="0.4" />

      <!-- Embedded Cleaned Artwork -->
      <g clip-path="url(#innerBadgeClip)">
        <image href="${artDataUri}" x="40" y="40" width="432" height="432" preserveAspectRatio="xMidYMid meet" />
      </g>
    </g>
  </svg>
  `;

  const svgBuffer = Buffer.from(svg512);

  // 2. Generate 512x512 PNG
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(outDir, 'icon-512x512.png'));
  console.log('Generated icon-512x512.png');

  // Also copy to public/app-icon.png
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(pubDir, 'app-icon.png'));

  // 3. Generate 192x192 PNG
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(outDir, 'icon-192x192.png'));
  console.log('Generated icon-192x192.png');

  // 4. Generate apple-touch-icon.png (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(outDir, 'apple-touch-icon.png'));
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(pubDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');

  // 5. Generate favicon.ico / 64x64 PNG
  await sharp(svgBuffer)
    .resize(64, 64)
    .png()
    .toFile(path.join(pubDir, 'favicon.ico'));
  console.log('Generated favicon.ico');

  // 6. Also save copy in artifact dir for reference
  const artifactDir = 'C:/Users/abhim/.gemini/antigravity/brain/6ed89e04-6031-442e-adc4-c95797a70598';
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(artifactDir, 'icon_option_a_512.png'));
  console.log('Generated artifact icon_option_a_512.png');
}

generateOptionAIcons().catch(console.error);
