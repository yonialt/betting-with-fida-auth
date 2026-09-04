import React from 'react';
import { CreditCard } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

interface Partner {
  id: string;
  name: string;
  type: 'payment';
  renderLogo: () => React.ReactNode;
}

const PARTNERS: Partner[] = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <img src="/partners/telebirr.jpg" alt="Telebirr" className="w-11 h-11 object-contain rounded" loading="lazy" />
      </div>
    ),
  },
  {
    id: 'national-id',
    name: 'Fida National ID',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <img src="/partners/fayda-id.jpg" alt="Fida National ID" className="w-11 h-11 object-contain rounded-full bg-white p-0.5" loading="lazy" />
      </div>
    ),
  },
  {
    id: 'santim-pay',
    name: 'Santim Pay',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <img src="/partners/santim-pay.jpg" alt="Santim Pay" className="w-11 h-11 object-contain rounded" loading="lazy" />
      </div>
    ),
  },
  {
    id: 'arifpay',
    name: 'Arifpay',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <img src="/partners/arifpay.svg" alt="Arifpay" className="w-11 h-11 object-contain" loading="lazy" />
      </div>
    ),
  },
  {
    id: 'dashen-bank',
    name: 'Dashen Bank',
    type: 'payment',
    renderLogo: () => (
      <div className="flex flex-col items-center justify-center">
        <img src="/partners/dashen-bank.png" alt="Dashen Bank" className="w-11 h-11 object-contain rounded" loading="lazy" />
      </div>
    ),
  },
];

export const PartnersPanel: React.FC = () => {
  const { setBonusesModalOpen } = useBetting();

  return (
    <div
      id="partners-panel"
      className="w-full bg-[#13355a] border-t border-[#0e2743] px-3 sm:px-4 lg:px-8 py-5 select-none text-white"
    >
      <div className="max-w-[1920px] mx-auto">
        {/* Title */}
        <h3 className="text-white font-extrabold text-xs sm:text-sm tracking-wider uppercase mb-3">
          PARTNERS
        </h3>

        {/* Partners Horizontal Rail Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5 pb-1">
          {PARTNERS.map((partner) => (
            <div
              key={partner.id}
              onClick={() => setBonusesModalOpen(true)}
              title={`${partner.name} - Official Partner`}
              className="group relative bg-[#183d66]/80 hover:bg-[#1f4a7a] rounded-lg p-2.5 h-24 flex flex-col items-center justify-center border border-[#214a79] hover:border-[#3874b7] transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5"
            >
              {/* Type Badge Icon on Top Right */}
              <div className="absolute top-1.5 right-1.5 text-neutral-400 group-hover:text-amber-400 transition-colors">
                <CreditCard className="w-3 h-3" />
              </div>

              {/* Logo Graphic */}
              <div className="w-full h-full flex items-center justify-center group-hover:scale-105 transition-transform">
                {partner.renderLogo()}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Accent Track Line */}
        <div className="w-full h-1 bg-[#1a426e] rounded-full mt-3 overflow-hidden">
          <div className="w-32 h-full bg-[#4174a8] rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
