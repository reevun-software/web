"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
import { Users, ShieldCheck, Ticket, Layers } from "lucide-react";
import Image from "next/image";

const SIZE = 96;
const HALF = SIZE / 2;

const SIDE_FACES = [
  { Icon: Users, transform: `rotateY(90deg) translateZ(${HALF}px)` },
  { Icon: ShieldCheck, transform: `rotateY(-90deg) translateZ(${HALF}px)` },
  { Icon: Ticket, transform: `rotateX(90deg) translateZ(${HALF}px)` },
  { Icon: Layers, transform: `rotateX(-90deg) translateZ(${HALF}px)` },
];

export function BrandCube() {
  const reduce = useReducedMotion();
  const rotateX = useMotionValue(-18);
  const rotateY = useMotionValue(28);
  const springX = useSpring(rotateX, { stiffness: 120, damping: 24 });
  const springY = useSpring(rotateY, { stiffness: 120, damping: 24 });
  const dragging = useRef(false);

  useEffect(() => {
    if (reduce) return;
    let raf: number;
    const tick = () => {
      if (!dragging.current) rotateY.set(rotateY.get() + 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, rotateY]);

  const faceBase =
    "absolute inset-0 flex items-center justify-center rounded-2xl border border-white/10 bg-card/80 backdrop-blur-sm";

  return (
    <div
      className="size-24 touch-none select-none [perspective:900px]"
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
        rotateY.set(rotateY.get() + e.movementX * 0.5);
        rotateX.set(rotateX.get() - e.movementY * 0.5);
      }}
    >
      <motion.div
        className="relative size-24 cursor-grab [transform-style:preserve-3d] active:cursor-grabbing"
        style={{ rotateX: springX, rotateY: springY }}
      >
        <div className={faceBase} style={{ transform: `translateZ(${HALF}px)` }}>
          <Image src="/logo.png" alt="" width={40} height={40} className="rounded-md" />
        </div>
        <div
          className={faceBase}
          style={{ transform: `rotateY(180deg) translateZ(${HALF}px)` }}
        >
          <Image src="/logo.png" alt="" width={40} height={40} className="rounded-md" />
        </div>
        {SIDE_FACES.map(({ Icon, transform }, i) => (
          <div
            key={i}
            className={faceBase + " bg-brand/15"}
            style={{ transform }}
          >
            <Icon className="size-7 text-brand" strokeWidth={1.5} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
