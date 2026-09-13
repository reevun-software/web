"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import Image from "next/image";

export function BrandOrb() {
  const reduce = useReducedMotion();
  const rotateY = useMotionValue(20);
  const springY = useSpring(rotateY, { stiffness: 90, damping: 20 });
  const dragging = useRef(false);

  useEffect(() => {
    if (reduce) return;
    let raf: number;
    const tick = () => {
      if (!dragging.current) rotateY.set(rotateY.get() + 0.25);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, rotateY]);

  const faceStyle =
    "absolute inset-0 flex items-center justify-center rounded-full [backface-visibility:hidden]";

  return (
    <div className="relative size-32 md:size-36">
      <div className="absolute inset-x-2 bottom-0 h-4 rounded-full bg-black/50 blur-md" />
      <div
        className="relative size-full touch-none select-none [perspective:1000px]"
        onPointerDown={(e) => {
          dragging.current = true;
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          rotateY.set(rotateY.get() + e.movementX * 0.6);
        }}
      >
        <motion.div
          className="relative size-full cursor-grab [transform-style:preserve-3d] active:cursor-grabbing"
          style={{ rotateY: springY }}
        >
          <div
            className={faceStyle}
            style={{
              background:
                "radial-gradient(circle at 32% 28%, #e8e8ea 0%, #9a9aa2 32%, #4b4b52 62%, #1c1c20 100%)",
              boxShadow:
                "inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.45)",
            }}
          >
            <div className="flex size-[62%] items-center justify-center rounded-full bg-black/85 ring-1 ring-white/15">
              <Image src="/logo.png" alt="" width={34} height={34} className="rounded-[6px]" />
            </div>
          </div>
          <div
            className={faceStyle}
            style={{
              transform: "rotateY(180deg)",
              background:
                "radial-gradient(circle at 68% 28%, #e8e8ea 0%, #9a9aa2 32%, #4b4b52 62%, #1c1c20 100%)",
              boxShadow:
                "inset 0 2px 6px rgba(255,255,255,0.35), inset 0 -10px 18px rgba(0,0,0,0.45), 0 12px 30px rgba(0,0,0,0.45)",
            }}
          >
            <span className="text-lg font-semibold tracking-tight text-white/90">
              R
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
