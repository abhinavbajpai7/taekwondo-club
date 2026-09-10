'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [stage, setStage] = useState<1 | 2>(1); // 1: slashes, 2: climax image

  useEffect(() => {
    // Only show once per session or on app reload
    const hasSeen = sessionStorage.getItem('rta_tkd_splash_seen');
    if (hasSeen) return;

    setVisible(true);
    sessionStorage.setItem('rta_tkd_splash_seen', 'true');

    // Stage 1: Speed Slashes (0.0s - 0.6s)
    const timerStage2 = setTimeout(() => {
      setStage(2);
    }, 600);

    // Fade out splash overlay (1.9s)
    const timerFade = setTimeout(() => {
      setFadingOut(true);
    }, 1900);

    // Completely unmount after fade animation completes (2.5s)
    const timerDone = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => {
      clearTimeout(timerStage2);
      clearTimeout(timerFade);
      clearTimeout(timerDone);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      onClick={() => setFadingOut(true)}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#060910] text-white select-none overflow-hidden transition-opacity duration-600 ${
        fadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Crimson Aura Glow */}
      <div className="absolute w-80 sm:w-96 h-80 sm:h-96 bg-red-600/25 blur-3xl rounded-full pointer-events-none animate-pulse" />

      {/* STAGE 1: SPEED SLASH BARRAGE */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          stage === 1 ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="absolute h-1.5 w-[500px] rounded-full -left-20 top-1/3 animate-[splashSlash1_0.6s_cubic-bezier(0.16,1,0.3,1)_forwards]"
          style={{
            background:
              'linear-gradient(90deg, transparent, #ef4444, #ffffff, #ef4444, transparent)',
          }}
        />
        <div
          className="absolute h-1.5 w-[500px] rounded-full -right-20 top-1/2 animate-[splashSlash2_0.5s_cubic-bezier(0.16,1,0.3,1)_forwards_100ms]"
          style={{
            background:
              'linear-gradient(90deg, transparent, #ef4444, #ffffff, #ef4444, transparent)',
          }}
        />
        <div
          className="absolute h-1 w-[420px] rounded-full -left-10 top-2/3 animate-[splashSlash1_0.55s_cubic-bezier(0.16,1,0.3,1)_forwards_200ms]"
          style={{
            background:
              'linear-gradient(90deg, transparent, #ef4444, #ffffff, #ef4444, transparent)',
          }}
        />
      </div>

      {/* STAGE 2: SHOCKWAVE RING & CLIMAX OPTION A ARTWORK */}
      {stage === 2 && (
        <div className="relative flex flex-col items-center justify-center">
          {/* Shockwave ripple */}
          <div className="absolute w-48 h-48 rounded-full border-4 border-red-500 animate-[splashShockwave_0.75s_ease-out_forwards] pointer-events-none" />

          {/* Option A Icon Artwork Badge */}
          <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-[36px] bg-gradient-to-b from-slate-950 via-slate-900 to-black p-3 border-2 border-red-500/60 shadow-2xl shadow-red-600/50 flex items-center justify-center overflow-hidden animate-[splashClimax_0.65s_cubic-bezier(0.34,1.56,0.64,1)_forwards] relative">
            <div className="w-full h-full rounded-[26px] bg-white flex items-center justify-center p-2 overflow-hidden shadow-inner">
              <img
                src="/app_icon_notext.png"
                alt="RTA Taekwondo Club"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          </div>

          {/* RTA Taekwondo Title */}
          <div className="text-center mt-6 animate-[fadeInUp_0.5s_ease-out_0.2s_forwards] opacity-0">
            <h1 className="text-2xl sm:text-3xl font-black tracking-widest text-white uppercase flex items-center justify-center gap-2">
              <span>RTA</span>
              <span className="text-red-500">TAEKWONDO</span>
            </h1>
            <div className="w-16 h-0.5 bg-red-500 mx-auto my-2 rounded-full" />
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400 font-bold">
              DOJANG ATTENDANCE &amp; FEES
            </p>
          </div>
        </div>
      )}

      {/* Skip Hint */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setFadingOut(true);
        }}
        className="absolute bottom-6 text-[11px] text-slate-500 hover:text-slate-300 transition uppercase tracking-widest font-semibold px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800"
      >
        Tap to Skip
      </button>

      {/* Inline Keyframes styling */}
      <style jsx global>{`
        @keyframes splashSlash1 {
          0% {
            transform: translate(-140%, 140%) rotate(-35deg);
            opacity: 0;
          }
          25% {
            opacity: 1;
          }
          100% {
            transform: translate(180%, -180%) rotate(-35deg);
            opacity: 0;
          }
        }
        @keyframes splashSlash2 {
          0% {
            transform: translate(140%, 140%) rotate(45deg);
            opacity: 0;
          }
          30% {
            opacity: 1;
          }
          100% {
            transform: translate(-180%, -180%) rotate(45deg);
            opacity: 0;
          }
        }
        @keyframes splashShockwave {
          0% {
            transform: scale(0.1);
            opacity: 1;
            border-width: 8px;
          }
          60% {
            opacity: 0.85;
          }
          100% {
            transform: scale(3.2);
            opacity: 0;
            border-width: 1px;
          }
        }
        @keyframes splashClimax {
          0% {
            transform: scale(1.35) rotate(-4deg);
            opacity: 0;
            filter: brightness(2) blur(10px);
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
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(16px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}
