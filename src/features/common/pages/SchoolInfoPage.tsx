import { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  Image,
  MapPin,
  Megaphone,
  Newspaper,
  User,
  Users,
  Video,
} from 'lucide-react';
import { Link, Navigate, useLocation, useParams } from 'react-router-dom';
import { apiClient } from '@services/api/client';
import SchoolSiteNavigation, {
  type SchoolSiteLanguage,
} from '../components/SchoolSiteNavigation';
import './LandingPage.css';

interface SchoolSiteContent {
  _id: string;
  title: { en: string; am: string };
  summary?: { en: string; am: string };
  body?: { en: string; am: string };
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  externalUrl?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  featured?: boolean;
}

const pages = {
  news: {
    icon: Newspaper,
    en: ['News', 'School news and stories'],
    am: ['ዜና', 'የትምህርት ቤቱ ዜናና ታሪኮች'],
  },
  events: {
    icon: CalendarDays,
    en: ['Events', 'What is happening at Harvard Academy'],
    am: ['ዝግጅቶች', 'በሃርቫርድ አካዳሚ የሚካሄዱ ዝግጅቶች'],
  },
  'academic-calendar': {
    icon: CalendarDays,
    en: ['Academic calendar', 'Important dates in the school year'],
    am: ['የትምህርት ዘመን ቀን መቁጠሪያ', 'በትምህርት ዘመኑ ውስጥ ያሉ አስፈላጊ ቀናት'],
  },
  announcements: {
    icon: Megaphone,
    en: ['Announcements', 'Updates for our school community'],
    am: ['ማስታወቂያዎች', 'ለትምህርት ቤቱ ማኅበረሰብ የሚተላለፉ መረጃዎች'],
  },
  'photo-gallery': {
    icon: Image,
    en: ['Photo gallery', 'A look at life around our school'],
    am: ['የፎቶ ማዕከል', 'በትምህርት ቤታችን ያለውን ሕይወት ይመልከቱ'],
  },
  'video-gallery': {
    icon: Video,
    en: ['Video gallery', 'Videos from the Harvard Academy community'],
    am: ['የቪዲዮ ማዕከል', 'ከሃርቫርድ አካዳሚ ማኅበረሰብ የተዘጋጁ ቪዲዮዎች'],
  },
  'about-us': {
    icon: BookOpen,
    en: ['About us', 'Get to know Harvard Academy'],
    am: ['ስለ ትምህርት ቤቱ', 'ሃርቫርድ አካዳሚን ይወቁ'],
  },
  director: {
    icon: User,
    en: ['Director', 'A message from our school leadership'],
    am: ['ዳይሬክተር', 'ከትምህርት ቤቱ አመራር የተላለፈ መልዕክት'],
  },
  'staff-members': {
    icon: Users,
    en: ['Staff members', 'Meet the people who support our learners'],
    am: ['የሠራተኞች አባላት', 'ተማሪዎቻችንን የሚደግፉ ሰዎችን ይወቁ'],
  },
  administration: {
    icon: Users,
    en: ['Administration', 'The team that helps our school thrive'],
    am: ['አስተዳደር', 'ትምህርት ቤታችን እንዲያድግ የሚያግዘው ቡድን'],
  },
  'vision-and-mission': {
    icon: Compass,
    en: ['Vision and mission', 'What guides our learning community'],
    am: ['ራዕይና ተልዕኮ', 'የትምህርት ማኅበረሰባችንን የሚመሩ እሴቶች'],
  },
} as const;

const SchoolInfoPage = () => {
  const { section } = useParams();
  const location = useLocation();
  const isContact = location.pathname === '/contact';
  const page = section && Object.prototype.hasOwnProperty.call(pages, section)
    ? pages[section as keyof typeof pages]
    : undefined;
  const [language, setLanguage] = useState<SchoolSiteLanguage>(() => (
    window.localStorage.getItem('school-site-language') === 'am' ? 'am' : 'en'
  ));
  const [items, setItems] = useState<SchoolSiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const contentSection = isContact ? 'contact' : section;
  const loadContent = useCallback(async (signal: AbortSignal) => {
    if (!contentSection) return;
    setLoading(true);
    setLoadError(null);
    try {
      const response = await apiClient.get<{
        data: { items: SchoolSiteContent[] };
      }>(`/school-site/${contentSection}`, { signal });
      setItems(response.data.data.items);
    } catch (error) {
      if (signal.aborted) return;
      setLoadError(error instanceof Error ? error.message : 'Failed to load school content.');
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, [contentSection]);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('school-site-language', language);
  }, [language]);

  useEffect(() => {
    const controller = new AbortController();
    void loadContent(controller.signal);
    return () => controller.abort();
  }, [loadContent]);

  const PageIcon = page?.icon ?? MapPin;
  const copy = language === 'en'
    ? {
        location: 'Hossana, Ethiopia',
        home: 'Home',
        section: section?.startsWith('about-') || section === 'director' ||
          section === 'staff-members' || section === 'administration' ||
          section === 'vision-and-mission' ? 'About Harvard Academy' : 'Latest',
        emptyTitle: 'This page is getting ready',
        emptyDescription:
          'There is no information published here yet. Please check back later for updates from Harvard Academy.',
        loading: 'Loading school information…',
        loadError: 'We could not load this page right now.',
        retry: 'Try again',
        noEntries: 'No published information yet.',
        noEntriesDescription: 'Please check back later for updates.',
        contactTitle: 'Looking for the school?',
        contactDescription: 'Harvard Academy is in Hossana, Ethiopia.',
        map: 'Find Harvard Academy on a map',
        studentPortal: 'Student portal',
        parentPortal: 'Parents portal',
        contact: 'Contact us',
        back: 'Back to school home',
      }
    : {
        location: 'ሆሳዕና፣ ኢትዮጵያ',
        home: 'መነሻ',
        section: section?.startsWith('about-') || section === 'director' ||
          section === 'staff-members' || section === 'administration' ||
          section === 'vision-and-mission' ? 'ስለ ሃርቫርድ አካዳሚ' : 'የቅርብ ጊዜ',
        emptyTitle: 'ይህ ገጽ በዝግጅት ላይ ነው',
        emptyDescription:
          'በዚህ ገጽ ላይ ገና መረጃ አልተለቀቀም። ከሃርቫርድ አካዳሚ የሚመጡ ዝማኔዎችን ለማግኘት ቆይተው ይመለሱ።',
        loading: 'የትምህርት ቤቱ መረጃ በመጫን ላይ ነው…',
        loadError: 'ይህን ገጽ አሁን መጫን አልተቻለም።',
        retry: 'እንደገና ይሞክሩ',
        noEntries: 'ገና የታተመ መረጃ የለም።',
        noEntriesDescription: 'እባክዎ ለዝማኔዎች ቆይተው ይመለሱ።',
        contactTitle: 'ትምህርት ቤቱን ይፈልጋሉ?',
        contactDescription: 'ሃርቫርድ አካዳሚ በሆሳዕና፣ ኢትዮጵያ ይገኛል።',
        map: 'ሃርቫርድ አካዳሚን በካርታ ይፈልጉ',
        studentPortal: 'የተማሪ ፖርታል',
        parentPortal: 'የወላጅ ፖርታል',
        contact: 'ያግኙን',
        back: 'ወደ ትምህርት ቤቱ መነሻ ይመለሱ',
      };
  const displayTitle = page?.[language][0] ?? '';
  const displaySubtitle = page?.[language][1] ?? '';
  const documentTitle = `${isContact ? copy.contact : displayTitle} | Harvard Academy`;

  useEffect(() => {
    document.title = language === 'am'
      ? `${isContact ? copy.contact : displayTitle} | ሃርቫርድ አካዳሚ`
      : documentTitle;
  }, [copy.contact, displayTitle, documentTitle, isContact, language]);

  if (!page && !isContact) return <Navigate to="/" replace />;

  return (
    <div className="academy-page min-h-screen bg-[#f5f5f0] text-[#17271f]">
      <div className="academy-topline">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2 px-5 py-2.5 text-xs text-white/75 sm:px-8 lg:px-12">
          <MapPin size={14} className="text-[#c8f169]" aria-hidden="true" />
          {copy.location}
        </div>
      </div>
      <SchoolSiteNavigation
        language={language}
        onToggleLanguage={() => setLanguage((current) => (current === 'en' ? 'am' : 'en'))}
      />

      <main className="academy-info-main">
        <div className="mx-auto max-w-[1120px] px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20">
          <nav aria-label="Breadcrumb" className="academy-info-breadcrumb">
            <Link to="/" className="hover:text-[#315b36]">{copy.home}</Link>
            {!isContact && (
              <>
                <span aria-hidden="true">/</span>
                <span>{copy.section}</span>
              </>
            )}
            <span aria-hidden="true">/</span>
            <span aria-current="page">{isContact ? copy.contact : displayTitle}</span>
          </nav>

          <div className="academy-info-heading">
            <span className="academy-info-icon"><PageIcon size={23} aria-hidden="true" /></span>
            <p className="academy-kicker">{copy.section}</p>
            <h1>{isContact ? copy.contact : displayTitle}</h1>
            <p>{isContact ? copy.contactDescription : displaySubtitle}</p>
          </div>

          {loading ? (
            <section className="academy-info-empty" aria-live="polite">
              <h2>{copy.loading}</h2>
            </section>
          ) : loadError ? (
            <section className="academy-info-empty" role="alert">
              <h2>{copy.loadError}</h2>
              <p>{loadError}</p>
              <button
                type="button"
                className="academy-button academy-button-dark mt-5"
                onClick={() => {
                  const controller = new AbortController();
                  void loadContent(controller.signal);
                }}
              >
                {copy.retry}
              </button>
            </section>
          ) : items.length === 0 ? (
            <section className="academy-info-empty">
              <span className="academy-info-empty-mark"><PageIcon size={27} aria-hidden="true" /></span>
              <div>
                <h2>{copy.emptyTitle}</h2>
                <p>{copy.emptyDescription}</p>
              </div>
            </section>
          ) : (
            <div className="academy-content-list">
              {items.map((item) => {
                const itemTitle = item.title[language] || item.title.en || item.title.am;
                const summary = item.summary?.[language] || item.summary?.en || item.summary?.am;
                const body = item.body?.[language] || item.body?.en || item.body?.am;
                return (
                  <article key={item._id} className="academy-content-card">
                    {item.mediaUrl && item.mediaType === 'image' && (
                      <img className="academy-content-image" src={item.mediaUrl} alt={itemTitle} loading="lazy" />
                    )}
                    {item.mediaUrl && item.mediaType === 'video' && (
                      <a className="academy-content-media-link" href={item.mediaUrl} target="_blank" rel="noreferrer">
                        <Video size={18} aria-hidden="true" />
                        {language === 'en' ? 'Watch video' : 'ቪዲዮውን ይመልከቱ'}
                      </a>
                    )}
                    {itemTitle && <h2>{itemTitle}</h2>}
                    {summary && <p className="academy-content-summary">{summary}</p>}
                    {body && <p className="academy-content-body">{body}</p>}
                    {(item.startsAt || item.location) && (
                      <div className="academy-content-meta">
                        {item.startsAt && (
                          <time dateTime={item.startsAt}>
                            {new Intl.DateTimeFormat(language === 'am' ? 'am-ET' : 'en-ET', {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            }).format(new Date(item.startsAt))}
                          </time>
                        )}
                        {item.location && <span>{item.location}</span>}
                      </div>
                    )}
                    {item.externalUrl && (
                      <a href={item.externalUrl} target="_blank" rel="noreferrer" className="academy-info-back">
                        {language === 'en' ? 'Learn more' : 'ተጨማሪ ይወቁ'}
                        <ArrowRight size={16} aria-hidden="true" />
                      </a>
                    )}
                  </article>
                );
              })}
            </div>
          )}
          {isContact && !loading && !loadError && (
            <a
              href="https://www.google.com/maps/search/?api=1&query=Harvard+Academy%2C+Hossana%2C+Ethiopia"
              target="_blank"
              rel="noreferrer"
              className="academy-button academy-button-dark mt-5"
            >
              <MapPin size={16} aria-hidden="true" />
              {copy.map}
              <ArrowRight size={16} aria-hidden="true" />
            </a>
          )}

          <div className="academy-info-quicklinks">
            <Link to="/student" className="academy-info-quicklink">
              <BookOpen size={18} aria-hidden="true" />
              {copy.studentPortal}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link to="/parent" className="academy-info-quicklink">
              <Users size={18} aria-hidden="true" />
              {copy.parentPortal}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <Link to="/" className="academy-info-back">
            <ArrowRight size={16} aria-hidden="true" className="rotate-180" />
            {copy.back}
          </Link>
        </div>
      </main>

      <footer className="academy-footer">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <span className="text-sm font-extrabold tracking-[0.1em]">HARVARD ACADEMY</span>
          <span className="text-xs text-white/55">{copy.location}</span>
          <Link to="/" className="academy-footer-link">{copy.home}</Link>
        </div>
      </footer>
    </div>
  );
};

export default SchoolInfoPage;
