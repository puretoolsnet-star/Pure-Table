import type { PageSeoContent } from "@/i18n/seo/page-content";

export function PageSeoSection({ content }: { content: PageSeoContent }) {
  return (
    <section
      aria-labelledby="page-seo-benefits-heading"
      className="mt-10 border-t border-gray-800/90 pt-10 sm:mt-12 sm:pt-12"
    >
      <h2
        id="page-seo-benefits-heading"
        className="text-lg font-semibold tracking-tight text-white sm:text-xl"
      >
        {content.benefitsTitle}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-base">
        {content.benefitsLead}
      </p>
      <ul className="mt-5 max-w-3xl space-y-2.5">
        {content.benefitPoints.map((point) => (
          <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-slate-400">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" aria-hidden />
            <span>{point}</span>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 text-base font-semibold text-white sm:text-lg">{content.faqTitle}</h3>
      <dl className="mt-5 max-w-3xl space-y-4">
        {content.faqs.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-gray-800/90 bg-gray-950/60 p-4 sm:p-5"
          >
            <dt className="text-sm font-medium text-slate-200 sm:text-base">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-slate-500">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}