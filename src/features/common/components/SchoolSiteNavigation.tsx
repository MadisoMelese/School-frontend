import { useEffect, useState } from 'react';
import { ChevronDown, Languages, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export type SchoolSiteLanguage = 'en' | 'am';

interface SchoolSiteNavigationProps {
  language: SchoolSiteLanguage;
  onToggleLanguage: () => void;
}

const menus = {
  en: {
    latest: {
      label: 'Latest',
      items: [
        ['News', '/latest/news'],
        ['Events', '/latest/events'],
        ['Academic calendar', '/latest/academic-calendar'],
        ['Announcements', '/latest/announcements'],
        ['Photo gallery', '/latest/photo-gallery'],
        ['Video gallery', '/latest/video-gallery'],
      ],
    },
    about: {
      label: 'About',
      items: [
        ['About us', '/about/about-us'],
        ['Director', '/about/director'],
        ['Staff members', '/about/staff-members'],
        ['Administration', '/about/administration'],
        ['Vision and mission', '/about/vision-and-mission'],
      ],
    },
    portals: {
      label: 'Portals',
      items: [
        ['Student portal', '/student'],
        ['Parents portal', '/parent'],
      ],
    },
    learning: 'Learning',
    community: 'Community',
    contact: 'Contact us',
    home: 'Harvard Academy home',
    language: 'Switch language',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    mainNavigation: 'Main navigation',
    mobileNavigation: 'Mobile navigation',
  },
  am: {
    latest: {
      label: 'ዜናዎች',
      items: [
        ['ዜና', '/latest/news'],
        ['ዝግጅቶች', '/latest/events'],
        ['የትምህርት ዘመን ቀን መቁጠሪያ', '/latest/academic-calendar'],
        ['ማስታወቂያዎች', '/latest/announcements'],
        ['የፎቶ ማዕከል', '/latest/photo-gallery'],
        ['የቪዲዮ ማዕከል', '/latest/video-gallery'],
      ],
    },
    about: {
      label: 'ስለ እኛ',
      items: [
        ['ስለ ትምህርት ቤቱ', '/about/about-us'],
        ['ዳይሬክተር', '/about/director'],
        ['የሠራተኞች አባላት', '/about/staff-members'],
        ['አስተዳደር', '/about/administration'],
        ['ራዕይና ተልዕኮ', '/about/vision-and-mission'],
      ],
    },
    portals: {
      label: 'ፖርታሎች',
      items: [
        ['የተማሪ ፖርታል', '/student'],
        ['የወላጅ ፖርታል', '/parent'],
      ],
    },
    learning: 'ትምህርት',
    community: 'ማኅበረሰብ',
    contact: 'ያግኙን',
    home: 'የሃርቫርድ አካዳሚ መነሻ',
    language: 'ቋንቋ ቀይር',
    openMenu: 'የአሰሳ ምናሌን ክፈት',
    closeMenu: 'የአሰሳ ምናሌን ዝጋ',
    mainNavigation: 'ዋና አሰሳ',
    mobileNavigation: 'የሞባይል አሰሳ',
  },
} as const;

const SchoolSiteNavigation = ({
  language,
  onToggleLanguage,
}: SchoolSiteNavigationProps) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const text = menus[language];

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, []);

  const closeNavigation = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  const renderDropdown = (
    key: 'latest' | 'about' | 'portals',
    mobile = false
  ) => {
    const menu = text[key];
    const expanded = openMenu === `${mobile ? 'mobile-' : ''}${key}`;
    return (
      <div className={mobile ? 'academy-mobile-group' : 'academy-nav-dropdown'} key={key}>
        <button
          type="button"
          className={mobile ? 'academy-mobile-group-button' : 'academy-navlink academy-nav-trigger'}
          aria-haspopup="true"
          aria-expanded={expanded}
          onClick={() => setOpenMenu(expanded ? null : `${mobile ? 'mobile-' : ''}${key}`)}
        >
          {menu.label}
          <ChevronDown
            size={mobile ? 17 : 14}
            className={expanded ? 'academy-chevron-open' : ''}
            aria-hidden="true"
          />
        </button>
        {expanded && (
          <div
            className={mobile ? 'academy-mobile-submenu' : 'academy-nav-dropdown-panel'}
            role="menu"
          >
            {menu.items.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                role="menuitem"
                onClick={closeNavigation}
                className={mobile ? 'academy-mobile-submenu-link' : 'academy-nav-dropdown-link'}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="academy-header sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3.5 sm:px-8 lg:px-12">
        <Link to="/" className="academy-brand" aria-label={text.home}>
          <span className="academy-monogram">H</span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-extrabold tracking-[0.1em] sm:text-base">
              HARVARD ACADEMY
            </span>
            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.25em] text-[#748078]">
              Hossana · Ethiopia
            </span>
          </span>
        </Link>

        <nav aria-label={text.mainNavigation} className="academy-main-navigation">
          {renderDropdown('latest')}
          {renderDropdown('about')}
          <a href="/#learning" className="academy-navlink" onClick={closeNavigation}>
            {text.learning}
          </a>
          <a href="/#community" className="academy-navlink" onClick={closeNavigation}>
            {text.community}
          </a>
          <Link to="/contact" className="academy-navlink" onClick={closeNavigation}>
            {text.contact}
          </Link>
          {renderDropdown('portals')}
        </nav>

        <div className="academy-header-actions">
          <button
            type="button"
            className="academy-language"
            onClick={onToggleLanguage}
            aria-label={text.language}
          >
            <Languages size={16} aria-hidden="true" />
            {language === 'en' ? 'አማርኛ' : 'English'}
          </button>
        </div>

        <div className="academy-mobile-actions">
          <button
            type="button"
            className="academy-language !h-10 !px-3"
            onClick={onToggleLanguage}
            aria-label={text.language}
          >
            <Languages size={15} aria-hidden="true" />
            {language === 'en' ? 'አማ' : 'EN'}
          </button>
          <button
            type="button"
            aria-label={mobileOpen ? text.closeMenu : text.openMenu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-white transition hover:bg-white/10"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          id="mobile-navigation"
          aria-label={text.mobileNavigation}
          className="academy-mobile-menu"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 px-5 py-4 sm:px-8">
            {renderDropdown('latest', true)}
            {renderDropdown('about', true)}
            <a href="/#learning" onClick={closeNavigation} className="academy-mobile-link">
              {text.learning}
            </a>
            <a href="/#community" onClick={closeNavigation} className="academy-mobile-link">
              {text.community}
            </a>
            <Link to="/contact" onClick={closeNavigation} className="academy-mobile-link">
              {text.contact}
            </Link>
            {renderDropdown('portals', true)}
          </div>
        </nav>
      )}
    </header>
  );
};

export default SchoolSiteNavigation;
