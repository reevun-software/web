// A soft, angled light glow fading into the black background - like
// resend.com's hero (a diagonal light-ray image behind their hero, masked to
// fade out). Pure CSS gradient + blur, no image asset, no JS.
//
// Fixed (not absolute) so it stays pinned to the viewport as the page
// scrolls, reading as page-wide ambience rather than a decoration boxed into
// whichever section happened to contain it. Must be rendered outside any
// ancestor that gets a CSS transform (e.g. the Reveal animations use one) -
// a transformed ancestor would create its own containing block and break
// true viewport-fixed positioning.
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -bottom-1/4 -right-1/5 h-[80vh] w-[90vw] rotate-[-10deg] bg-gradient-to-tr from-white/[0.09] via-white/[0.03] to-transparent blur-3xl" />
    </div>
  );
}
