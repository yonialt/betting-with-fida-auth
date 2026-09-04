import React from 'react';
import { Apple, Smartphone, LayoutGrid } from 'lucide-react';
import { useBetting } from '../context/BettingContext';

export const Footer: React.FC = () => {
  const { setLoginModalOpen, setBonusesModalOpen, openAuthModal } = useBetting();

  const handleLinkClick = (title: string) => {
    if (title === 'Registration') {
      openAuthModal('signup');
    } else if (title === 'Payment methods') {
      setLoginModalOpen(true);
    } else if (title === 'About us' || title === 'Terms and Conditions' || title === 'Cookie Policy') {
      setBonusesModalOpen(true);
    }
  };

  return (
    <footer id="main-footer" className="w-full bg-[#183e66] border-t border-[#123153] text-white py-8 sm:py-10 px-4 sm:px-6 lg:px-10 select-none">
      <div className="max-w-[1920px] mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 sm:gap-8 text-xs">
        {/* Column 1: INFORMATION */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            INFORMATION
          </h4>
          <ul className="flex flex-col gap-1.5 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('About us')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                About us
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Terms and Conditions')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Terms and Conditions
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Affiliate Program')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Affiliate Program
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Cookie Policy')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Cookie Policy
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Contacts')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Contacts
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: GAMES */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            GAMES
          </h4>
          <ul className="flex flex-col gap-1.5 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('Casino')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Casino
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('1xGames')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                1xGames
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Live Casino')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Live Casino
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: BETTING */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            BETTING
          </h4>
          <ul className="flex flex-col gap-1.5 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('Sports')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Sports
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Multi-LIVE')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Multi-LIVE
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Live')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Live
              </button>
            </li>
          </ul>
        </div>

        {/* Column 4: STATISTICS */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            STATISTICS
          </h4>
          <ul className="flex flex-col gap-1.5 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('Statistics')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Statistics
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Results')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Results
              </button>
            </li>
          </ul>
        </div>

        {/* Column 5: USEFUL LINKS */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            USEFUL LINKS
          </h4>
          <ul className="flex flex-col gap-1.5 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('Payment methods')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Payment methods
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Mobile version')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Mobile version
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Registration')}
                className="hover:text-white hover:underline transition-colors text-left cursor-pointer"
              >
                Registration
              </button>
            </li>
          </ul>
        </div>

        {/* Column 6: APPS */}
        <div className="flex flex-col gap-2.5">
          <h4 className="font-extrabold text-white uppercase tracking-wider text-[13px]">
            APPS
          </h4>
          <ul className="flex flex-col gap-2 text-neutral-200">
            <li>
              <button
                onClick={() => handleLinkClick('iOS')}
                className="flex items-center gap-2 hover:text-white hover:underline transition-colors cursor-pointer"
              >
                <Apple className="w-4 h-4 text-white shrink-0" />
                <span>iOS</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Android')}
                className="flex items-center gap-2 hover:text-white hover:underline transition-colors cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-white shrink-0" />
                <span>Android</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleLinkClick('Other apps')}
                className="flex items-center gap-2 hover:text-white hover:underline transition-colors cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4 text-white shrink-0" />
                <span>Other apps</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};
