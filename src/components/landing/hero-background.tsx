// A soft, angled light glow fading into the black background - like
// resend.com's hero (a diagonal light-ray image behind their hero, masked to
// fade out). Pure CSS gradient + blur, no image asset, no JS.
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -bottom-1/3 -right-1/4 h-[70vh] w-[90vw] rotate-[-10deg] bg-gradient-to-tr from-white/[0.09] via-white/[0.03] to-transparent blur-3xl" />
    </div>
  );
}
