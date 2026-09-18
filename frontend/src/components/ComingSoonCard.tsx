import React from 'react';
import { Construction } from 'lucide-react';

/**
 * Reusable "Coming soon" placeholder card.
 *
 * Rendered above blurred page content (the parent supplies the blur) to mark
 * a section that is under development — currently used by the Casino /
 * Live Casino lobby for every category page reached from the header dropdown.
 *
 * The parent must position it (the card itself is content-only) and should
 * keep surrounding navigation interactive — only the page content behind the
 * card is blurred/locked.
 */
export const ComingSoonCard: React.FC<{
  /** Short feature name, e.g. "Casino" or "Live Casino". */
  title?: string;
}> = ({ title }) => (
  <div
    role="status"
    aria-live="polite"
    className="w-full max-w-sm bg-white rounded-2xl shadow-2xl shadow-black/50 px-6 py-8 sm:px-8 sm:py-10 text-center animate-in zoom-in-95 fade-in duration-200"
  >
    <div className="w-14 h-14 mx-auto rounded-2xl bg-[#ffc600]/15 border border-[#ffc600]/40 flex items-center justify-center">
      <Construction className="w-7 h-7 text-[#e8a800]" />
    </div>
    <h3 className="mt-4 text-lg font-black text-neutral-900 tracking-tight">
      Coming soon
    </h3>
    <p className="mt-1.5 text-sm text-neutral-500 leading-relaxed">
      {title ? <><span className="font-bold text-neutral-700">{title}</span> — </> : null}
      This feature is under development.
    </p>
  </div>
);
