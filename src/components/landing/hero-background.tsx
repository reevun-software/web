// Fixed (not random) positions so this stays a pure Server Component with no
// client JS and no hydration mismatch - "random" placement that's actually
// hand-picked to read as scattered.
const DOTS = [
  { top: "12%", left: "8%", size: 2, delay: "0s", duration: "6s" },
  { top: "22%", left: "18%", size: 1.5, delay: "1.2s", duration: "7s" },
  { top: "8%", left: "32%", size: 1.5, delay: "2.4s", duration: "5.5s" },
  { top: "18%", left: "48%", size: 2, delay: "0.6s", duration: "6.5s" },
  { top: "10%", left: "62%", size: 1.5, delay: "3s", duration: "7.5s" },
  { top: "24%", left: "78%", size: 2, delay: "1.8s", duration: "6s" },
  { top: "14%", left: "90%", size: 1.5, delay: "0.3s", duration: "5s" },
  { top: "38%", left: "5%", size: 1.5, delay: "2.1s", duration: "6.8s" },
  { top: "46%", left: "22%", size: 2, delay: "3.6s", duration: "7.2s" },
  { top: "35%", left: "40%", size: 1.5, delay: "1.5s", duration: "5.8s" },
  { top: "42%", left: "58%", size: 2, delay: "4.2s", duration: "6.3s" },
  { top: "34%", left: "72%", size: 1.5, delay: "0.9s", duration: "7s" },
  { top: "44%", left: "88%", size: 1.5, delay: "2.7s", duration: "6.6s" },
  { top: "62%", left: "12%", size: 2, delay: "3.3s", duration: "5.4s" },
  { top: "70%", left: "28%", size: 1.5, delay: "0.4s", duration: "7.4s" },
  { top: "58%", left: "46%", size: 1.5, delay: "1.9s", duration: "6.1s" },
  { top: "68%", left: "64%", size: 2, delay: "2.5s", duration: "6.9s" },
  { top: "60%", left: "82%", size: 1.5, delay: "4.5s", duration: "5.7s" },
  { top: "72%", left: "95%", size: 1.5, delay: "0.7s", duration: "7.1s" },
  { top: "86%", left: "20%", size: 2, delay: "1.1s", duration: "6.4s" },
  { top: "90%", left: "50%", size: 1.5, delay: "3.9s", duration: "5.9s" },
  { top: "84%", left: "76%", size: 1.5, delay: "2.2s", duration: "7.3s" },
];

export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-foreground/25 animate-hero-dust"
          style={{
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
      <svg
        viewBox="0 0 200 200"
        className="absolute top-1/2 left-1/2 size-[420px] -translate-x-1/2 -translate-y-1/2 text-foreground/[0.07] animate-hero-crystal-spin md:size-[560px]"
        style={{ perspective: 800 }}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.6"
      >
        <path d="M100 10 L170 55 L170 145 L100 190 L30 145 L30 55 Z" />
        <path d="M100 10 L100 90 L170 55" />
        <path d="M100 10 L100 90 L30 55" />
        <path d="M100 90 L170 145" />
        <path d="M100 90 L30 145" />
        <path d="M100 90 L100 190" />
        <path d="M30 55 L170 55" />
        <path d="M30 145 L170 145" />
      </svg>
    </div>
  );
}
