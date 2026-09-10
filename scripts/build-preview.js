const fs = require('fs');
const path = require('path');

const imgPath = 'C:/Users/abhim/.gemini/antigravity/brain/6ed89e04-6031-442e-adc4-c95797a70598/app_icon_notext.png';
const b64 = fs.readFileSync(imgPath).toString('base64');
const dataUri = 'data:image/png;base64,' + b64;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Startup Animation: Speed Slash &amp; Climax Image Formation</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    /* High-velocity martial arts slash streaks */
    @keyframes slash1 {
      0% { transform: translate(-140%, 140%) rotate(-35deg); opacity: 0; }
      25% { opacity: 1; }
      100% { transform: translate(180%, -180%) rotate(-35deg); opacity: 0; }
    }
    @keyframes slash2 {
      0% { transform: translate(140%, 140%) rotate(45deg); opacity: 0; }
      30% { opacity: 1; }
      100% { transform: translate(-180%, -180%) rotate(45deg); opacity: 0; }
    }
    @keyframes slash3 {
      0% { transform: translate(-130%, 80%) rotate(-20deg); opacity: 0; }
      40% { opacity: 1; }
      100% { transform: translate(170%, -100%) rotate(-20deg); opacity: 0; }
    }
    @keyframes shockwaveRing {
      0% { transform: scale(0.1); opacity: 1; border-width: 8px; }
      60% { opacity: 0.9; }
      100% { transform: scale(3.5); opacity: 0; border-width: 1px; }
    }
    @keyframes climaxBurst {
      0% {
        transform: scale(1.35) rotate(-4deg);
        opacity: 0;
        filter: brightness(2.2) blur(12px);
      }
      50% {
        transform: scale(0.96) rotate(0deg);
        opacity: 1;
        filter: brightness(1.2) blur(0px);
      }
      100% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
        filter: brightness(1) blur(0px);
      }
    }
    @keyframes auraPulse {
      0%, 100% { opacity: 0.4; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.15); }
    }
    .slash-stroke {
      position: absolute;
      background: linear-gradient(90deg, transparent, #ef4444, #ffffff, #ef4444, transparent);
      height: 4.5px;
      border-radius: 9999px;
      pointer-events: none;
    }
  </style>
</head>
<body class="bg-[#080c14] text-slate-100 p-4 sm:p-6 antialiased font-sans">
  <div class="max-w-4xl mx-auto space-y-8">

    <!-- Header Section -->
    <div class="border-b border-slate-800 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold mb-2">
          ⚡ Focused Startup Sequence (4 &amp; 5 Only)
        </div>
        <h1 class="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Speed Slashes &rarr; Climax Icon Artwork Formation
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 mt-1">
          Fast, punchy, and cinematic. Slashes whip across the dark screen, shockwave bursts, and the heroic martial arts artwork forms with RTA Taekwondo branding!
        </p>
      </div>
      <div class="flex items-center gap-2 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        ✔ Option A Approved Icon
      </div>
    </div>

    <!-- APPROVED ICON DISPLAY (Option A) -->
    <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-b from-slate-950 to-black border-2 border-red-500/50 p-1.5 shadow-xl shadow-red-600/30 flex items-center justify-center overflow-hidden shrink-0">
          <div class="w-full h-full rounded-xl bg-white flex items-center justify-center p-0.5 overflow-hidden">
            <img src="${dataUri}" class="w-full h-full object-contain" alt="Approved Icon A" />
          </div>
        </div>
        <div>
          <span class="text-xs font-bold text-red-400 uppercase tracking-wider">App Icon: Option A</span>
          <p class="text-sm font-semibold text-white">Dark Dojo Squircle (Text &amp; Stamp Cleaned)</p>
          <p class="text-[11px] text-slate-400">High-kick fighters, red sun splatter explosion, and dynamic speed streaks.</p>
        </div>
      </div>
      <span class="text-xs px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
        Ready to Apply
      </span>
    </div>

    <!-- INTERACTIVE ANIMATION PHONE SIMULATOR -->
    <div class="space-y-4 pt-2">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-bold text-white flex items-center gap-2">
            <span>Live Startup Animation (Speed Slashes &rarr; Climax Image)</span>
          </h2>
          <p class="text-xs text-slate-400">
            Click &quot;Play Animation&quot; to test the snappy sequence:
          </p>
        </div>

        <button id="playBtn" onclick="playSlashAndClimax()" class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition flex items-center gap-2 cursor-pointer">
          <span>▶ Play Animation</span>
        </button>
      </div>

      <!-- Live Two-Stage Indicator Badges -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center text-xs font-bold">
        <div id="b1" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all flex items-center justify-center gap-2">
          <span>⚡ Stage 1: Speed Slash Energy Barrage</span>
        </div>
        <div id="b2" class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all flex items-center justify-center gap-2">
          <span>🥋 Stage 2: Climax Icon Artwork Formation</span>
        </div>
      </div>

      <!-- PHONE SIMULATOR FRAME -->
      <div class="flex justify-center my-3">
        <div class="w-full max-w-sm rounded-[42px] border-4 border-slate-700 bg-slate-950 p-3 shadow-2xl shadow-black relative">
          <!-- Speaker Notch -->
          <div class="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-2"></div>

          <!-- SCREEN CONTAINER (Deep Dark Dojang Background) -->
          <div id="screen" class="w-full h-[510px] rounded-[32px] bg-[#070a12] relative overflow-hidden flex flex-col items-center justify-center border border-slate-800">

            <!-- Ambient Crimson Aura Glow -->
            <div id="crimsonAura" class="absolute w-72 h-72 bg-red-600/30 blur-3xl rounded-full opacity-0 pointer-events-none transition-opacity duration-700" style="animation: auraPulse 2.5s ease-in-out infinite;"></div>

            <!-- Dynamic Speed Slash Lines -->
            <div id="slash1" class="slash-stroke w-[420px] -left-32 top-1/3 opacity-0"></div>
            <div id="slash2" class="slash-stroke w-[420px] -right-32 top-1/2 opacity-0"></div>
            <div id="slash3" class="slash-stroke w-[380px] -left-20 top-2/3 opacity-0"></div>

            <!-- Impact Shockwave Ring -->
            <div id="shockwave" class="absolute w-44 h-44 rounded-full border-4 border-red-500 opacity-0 pointer-events-none"></div>

            <!-- ================= CLIMAX IMAGE & TITLE STAGE ================= -->
            <div id="climaxStage" class="relative flex flex-col items-center justify-center opacity-0 pointer-events-none transition-all duration-700">

              <!-- Option A Icon Artwork Badge -->
              <div id="imageCard" class="w-56 h-56 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-black p-3 border-2 border-red-500/60 shadow-2xl shadow-red-600/50 flex items-center justify-center overflow-hidden relative">
                <div class="w-full h-full rounded-2xl bg-white flex items-center justify-center p-1.5 overflow-hidden shadow-inner">
                  <img src="${dataUri}" class="w-full h-full object-contain" alt="Climax Taekwondo Icon" />
                </div>
              </div>

              <!-- RTA Taekwondo Title -->
              <div id="titleContainer" class="text-center mt-5 opacity-0 translate-y-4 transition-all duration-700">
                <h4 class="text-xl font-black tracking-widest text-white uppercase flex items-center justify-center gap-1.5">
                  <span>RTA</span>
                  <span class="text-red-500">TAEKWONDO</span>
                </h4>
                <div class="w-14 h-0.5 bg-red-500 mx-auto my-1.5 rounded-full"></div>
                <p class="text-[10px] uppercase tracking-[0.25em] text-slate-400 font-bold">
                  DOJANG REGISTER &amp; FEES
                </p>
              </div>
            </div>

            <!-- ================= REVEAL TO MAIN APP ================= -->
            <div id="appScreen" class="absolute inset-0 bg-slate-950 p-4 opacity-0 pointer-events-none transition-opacity duration-700 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-sm shadow-md shadow-red-600/30">🥋</div>
                    <span class="text-xs font-bold text-white">RTA Dojang</span>
                  </div>
                  <span class="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">Connected</span>
                </div>
                <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div class="h-3.5 w-32 bg-slate-700 rounded"></div>
                  <div class="h-2 w-48 bg-slate-800 rounded"></div>
                </div>
                <div class="grid grid-cols-2 gap-2.5">
                  <div class="h-20 rounded-xl bg-slate-900 border border-slate-800"></div>
                  <div class="h-20 rounded-xl bg-slate-900 border border-slate-800"></div>
                </div>
              </div>
              <p class="text-center text-[10px] text-slate-500 font-medium">Live App Active</p>
            </div>

          </div>

          <!-- Bottom Phone Indicator -->
          <div class="w-32 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
        </div>
      </div>

      <!-- Chronological Timeline -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-red-400 font-bold block mb-1">0.0s &ndash; 0.6s</span>
          <p class="text-slate-400 text-[11px]">Dark dojang atmosphere. High-speed red &amp; white slashes whip across the screen.</p>
        </div>
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-red-400 font-bold block mb-1">0.6s &ndash; 1.4s</span>
          <p class="text-slate-400 text-[11px]">Shockwave bursts and the FINAL OPTION A ARTWORK FORMS at the climax with RTA Club branding!</p>
        </div>
        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800">
          <span class="text-red-400 font-bold block mb-1">1.4s &ndash; 2.2s</span>
          <p class="text-slate-400 text-[11px]">Smooth cinematic dissolve directly revealing the active club portal / login screen.</p>
        </div>
      </div>
    </div>

    <!-- Final Approval Action Card -->
    <div class="p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-900/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
      <div class="text-left">
        <h3 class="text-sm font-bold text-white flex items-center gap-2">
          <span>Ready to apply this refined sequence and Option A icon?</span>
        </h3>
        <p class="text-xs text-slate-400 mt-1">
          Once confirmed, this exact fast-paced startup animation and Option A icon will be built into the app and deployed live!
        </p>
      </div>

      <div class="flex items-center gap-3 shrink-0">
        <span class="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl">
          Awaiting Final Go-Ahead
        </span>
      </div>
    </div>

  </div>

  <script>
    let timer = null;

    function resetScreen() {
      clearTimeout(timer);
      const crimsonAura = document.getElementById('crimsonAura');
      const slash1 = document.getElementById('slash1');
      const slash2 = document.getElementById('slash2');
      const slash3 = document.getElementById('slash3');
      const shockwave = document.getElementById('shockwave');
      const climaxStage = document.getElementById('climaxStage');
      const imageCard = document.getElementById('imageCard');
      const titleContainer = document.getElementById('titleContainer');
      const appScreen = document.getElementById('appScreen');
      const b1 = document.getElementById('b1');
      const b2 = document.getElementById('b2');

      b1.className = 'p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all flex items-center justify-center gap-2';
      b2.className = 'p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all flex items-center justify-center gap-2';

      crimsonAura.style.opacity = '0';
      appScreen.style.opacity = '0';

      climaxStage.style.opacity = '0';
      imageCard.style.animation = 'none';
      titleContainer.style.opacity = '0';
      titleContainer.style.transform = 'translateY(16px)';

      slash1.style.animation = 'none';
      slash2.style.animation = 'none';
      slash3.style.animation = 'none';
      shockwave.style.animation = 'none';
    }

    function playSlashAndClimax() {
      resetScreen();
      const playBtn = document.getElementById('playBtn');
      const crimsonAura = document.getElementById('crimsonAura');
      const slash1 = document.getElementById('slash1');
      const slash2 = document.getElementById('slash2');
      const slash3 = document.getElementById('slash3');
      const shockwave = document.getElementById('shockwave');
      const climaxStage = document.getElementById('climaxStage');
      const imageCard = document.getElementById('imageCard');
      const titleContainer = document.getElementById('titleContainer');
      const appScreen = document.getElementById('appScreen');
      const b1 = document.getElementById('b1');
      const b2 = document.getElementById('b2');

      playBtn.disabled = true;
      playBtn.innerText = '⚡ Playing...';

      // STAGE 1: Speed Slashes Whip Across (0.0s - 0.6s)
      b1.className = 'p-3 rounded-xl bg-red-600 text-white font-black shadow-lg shadow-red-600/30 scale-102 transition-all flex items-center justify-center gap-2';
      crimsonAura.style.opacity = '1';

      slash1.style.animation = 'slash1 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => {
        slash2.style.animation = 'slash2 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      }, 100);
      setTimeout(() => {
        slash3.style.animation = 'slash3 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      }, 200);

      // STAGE 2: Climax Shockwave & Image Formation! (0.6s)
      setTimeout(() => {
        b1.className = 'p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 transition-all flex items-center justify-center gap-2';
        b2.className = 'p-3 rounded-xl bg-red-600 text-white font-black shadow-lg shadow-red-600/30 scale-102 transition-all flex items-center justify-center gap-2';

        shockwave.style.animation = 'shockwaveRing 0.75s ease-out forwards';

        climaxStage.style.opacity = '1';
        imageCard.style.animation = 'climaxBurst 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';

        // Title reveals smoothly
        setTimeout(() => {
          titleContainer.style.opacity = '1';
          titleContainer.style.transform = 'translateY(0px)';
        }, 250);
      }, 600);

      // STAGE 3: Smooth Dissolve to Live App (1.8s)
      setTimeout(() => {
        appScreen.style.opacity = '1';
      }, 1800);

      // Reset button (2.6s)
      setTimeout(() => {
        playBtn.disabled = false;
        playBtn.innerText = '↺ Replay Animation';
      }, 2600);
    }

    window.addEventListener('load', () => {
      setTimeout(playSlashAndClimax, 500);
    });
  </script>
</body>
</html>`;

const targetFile = 'C:/Users/abhim/.gemini/antigravity/brain/6ed89e04-6031-442e-adc4-c95797a70598/preview.html';
fs.writeFileSync(targetFile, html, 'utf8');

const pubFile = 'C:/Users/abhim/.gemini/antigravity/scratch/taekwondo-club/public/preview.html';
fs.writeFileSync(pubFile, html, 'utf8');

console.log('Successfully updated preview.html with 4 & 5 only!');
