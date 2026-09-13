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
// Two circular blobs rather than one wide rectangle - a rectangle's blurred
// silhouette still reads as a box once it drifts far enough to show a
// straight edge, where a circle stays a soft round glow at any position.
export function HeroBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="hero-glow-a absolute -bottom-1/4 -right-1/12 size-[70vh] rounded-full bg-gradient-to-tr from-white/[0.09] via-white/[0.03] to-transparent blur-3xl" />
      <div className="hero-glow-b absolute -top-1/4 -left-1/12 size-[45vh] rounded-full bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent blur-3xl" />
    </div>
  );
}
