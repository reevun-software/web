import { SiteHeader } from "@/components/site-header";
import { Footer } from "@/components/landing/footer";

type Section = { heading: string; body: string };

export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro?: string;
  sections: Section[];
}) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-20">
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-xs text-muted-foreground">{updated}</p>
          {intro ? (
            <p className="mt-6 text-sm leading-relaxed text-muted-foreground">{intro}</p>
          ) : null}
          <div className="mt-10 flex flex-col gap-8">
            {sections.map((s) => (
              <section key={s.heading}>
                <h2 className="text-lg font-medium">{s.heading}</h2>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
