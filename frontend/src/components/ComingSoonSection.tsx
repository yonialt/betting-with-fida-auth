import React, { useEffect, useState } from 'react';
import { ComingSoonCard } from './ComingSoonCard';

/**
 * Reusable "Coming soon" section wrapper.
 *
 * Renders children normally for a short simulated page-load beat, then blurs
 * the content (inert + aria-hidden) and shows a centered white ComingSoonCard
 * on top. Surrounding navigation outside this wrapper stays fully functional.
 *
 * Used by the Casino / Live Casino lobby body and the Polymarket Elections
 * category — any under-development page section can adopt it the same way.
 */
export const ComingSoonSection: React.FC<{
  /** Feature label shown on the card, e.g. "Casino" or "Elections". */
  title?: string;
  /** When this key changes, the page-load beat replays (e.g. on navigation). */
  beatKey?: string | number;
  /** Classes for the inner blurred content box (e.g. scroll containers). */
  contentClassName?: string;
  /** Center the card in the viewport instead of the section (tall pages). */
  centerInViewport?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ title, beatKey, contentClassName = '', centerInViewport = false, className = '', children }) => {
  // Simulated "page load" beat: content renders normally first, then settles
  // into the blurred "Coming soon" state. The state persists — the feature is
  // under development, so the blurred page + card stay until the user leaves.
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 550);
    return () => clearTimeout(t);
  }, [beatKey]);

  const comingSoon = !loading;

  return (
    <div className={`relative ${className}`}>
      {/* Page content — blurred + inert while the "Coming soon" state is
          active. Navigation outside this wrapper stays crisp and functional. */}
      <div
        aria-hidden={comingSoon}
        className={`transition-[filter] duration-300 ${contentClassName} ${
          comingSoon ? 'blur-md pointer-events-none select-none' : ''
        }`}
      >
        {children}
      </div>

      {/* Centered white card above the blurred content. In viewport mode the
          overlay itself ignores pointer events so sticky navs stay clickable. */}
      {comingSoon && (
        <div
          className={`inset-0 z-30 flex items-center justify-center px-4 ${
            centerInViewport ? 'fixed pointer-events-none' : 'absolute'
          }`}
        >
          <div className={centerInViewport ? 'pointer-events-auto' : undefined}>
            <ComingSoonCard title={title} />
          </div>
        </div>
      )}
    </div>
  );
};
