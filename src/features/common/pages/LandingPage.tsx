import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Compass,
  GraduationCap,
  HeartHandshake,
  MapPin,
  MoveUpRight,
  Sparkles,
} from 'lucide-react';
import SchoolSiteNavigation, {
  type SchoolSiteLanguage,
} from '../components/SchoolSiteNavigation';
import './LandingPage.css';

const content = {
  en: {
    homeLabel: 'Harvard Academy home',
    location: 'Hossana, Ethiopia',
    portal: 'School portal',
    tagline: 'Learning with purpose. Growing together.',
    eyebrow: 'A different kind of school day',
    heroLineOne: 'Big ideas.',
    heroLineTwo: 'Bright futures.',
    heroDescription:
      'A place to ask bold questions, build lasting foundations, and discover what you are capable of.',
    explore: 'Explore Harvard Academy',
    familyPortal: 'Family & student portal',
    scroll: 'Scroll to discover',
    marquee: 'CURIOSITY · CONFIDENCE · COMMUNITY · POSSIBILITY',
    photoLabel: 'A glimpse of learning · illustrative photo',
    photoNumberLabel: 'Show classroom photo',
    photoCaption: 'Room to wonder. Space to grow.',
    approachLabel: 'Our belief',
    approachTitle: 'The future belongs to curious minds.',
    approachDescription:
      'Education should do more than prepare students for a test. It should help them understand the world, find their voice, and imagine what they can make possible.',
    approachLink: 'How we think about learning',
    values: [
      {
        number: '01',
        title: 'Every learner is known',
        description:
          'Learning starts with seeing the person behind the potential: their questions, strengths, and next steps.',
      },
      {
        number: '02',
        title: 'Curiosity has a place here',
        description:
          'Thoughtful questions and fresh perspectives are part of how we make sense of the world.',
      },
      {
        number: '03',
        title: 'We grow better together',
        description:
          'Kindness, respect, and shared responsibility make a stronger school community.',
      },
    ],
    learningLabel: 'A richer kind of learning',
    learningTitle: 'Knowledge is a beginning. Not the finish line.',
    learningDescription:
      'We want students to leave each lesson with more than an answer: the confidence to think, the tools to explore, and the motivation to keep learning.',
    pillars: [
      {
        number: '01',
        title: 'Think deeply',
        description:
          'Build strong foundations and learn to connect ideas, solve problems, and think for yourself.',
        icon: BookOpen,
      },
      {
        number: '02',
        title: 'Stay curious',
        description:
          'Follow questions into new interests, creative work, and meaningful discoveries.',
        icon: Compass,
      },
      {
        number: '03',
        title: 'Find your direction',
        description:
          'Grow confidence, resilience, and the character to take your next step.',
        icon: GraduationCap,
      },
    ],
    communityLabel: 'A school is its people',
    communityTitle: 'A place to belong, contribute, and become.',
    communityDescription:
      'Students do their best when they feel seen and supported. We value the partnership between learners, families, and educators that helps a school community thrive.',
    communityLink: 'Come get to know us',
    visitLabel: 'Your next chapter',
    visitTitle: 'Come see what is possible.',
    visitDescription:
      'We would love to welcome you to Harvard Academy. Find us in Hossana and start a conversation about your child’s learning journey.',
    findUs: 'Find us in Hossana',
    openPortal: 'Open school portal',
    footerLine: 'Learning with purpose. Growing together.',
    previousPhoto: 'Previous classroom photo',
    nextPhoto: 'Next classroom photo',
    photoAlt: 'Students learning together in a classroom',
    communityAlt: 'A teacher helping students work together',
    illustrationNote: 'Illustrative photography',
  },
  am: {
    homeLabel: 'መነሻ፣ ሃርቫርድ አካዳሚ',
    location: 'ሆሳዕና፣ ኢትዮጵያ',
    portal: 'የትምህርት ቤት መግቢያ',
    tagline: 'በዓላማ መማር። አብሮ ማደግ።',
    eyebrow: 'የተለየ የትምህርት ቀን',
    heroLineOne: 'ታላላቅ ሐሳቦች።',
    heroLineTwo: 'ብሩህ ወደፊት።',
    heroDescription:
      'ደፋር ጥያቄዎችን ለመጠየቅ፣ ጠንካራ መሠረት ለመገንባት እና ችሎታዎን ለማወቅ የሚያግዝ ቦታ።',
    explore: 'ሃርቫርድ አካዳሚን ይወቁ',
    familyPortal: 'የቤተሰብና የተማሪ መግቢያ',
    scroll: 'ለማወቅ ወደ ታች ይሂዱ',
    marquee: 'ጉጉት · መተማመን · ማኅበረሰብ · ዕድል',
    photoLabel: 'የመማር ቅኝት · ምሳሌያዊ ምስል',
    photoNumberLabel: 'የክፍል ምስል አሳይ',
    photoCaption: 'ለማሰብ ቦታ። ለማደግ ዕድል።',
    approachLabel: 'እምነታችን',
    approachTitle: 'የወደፊቱ ዓለም ለጠያቂ አእምሮዎች ነው።',
    approachDescription:
      'ትምህርት ተማሪዎችን ለፈተና ብቻ ማዘጋጀት የለበትም። ዓለምን እንዲረዱ፣ ድምፃቸውን እንዲያገኙ እና ምን ማሳካት እንደሚችሉ እንዲያስቡ ማገዝ አለበት።',
    approachLink: 'ስለ ትምህርት ያለን አመለካከት',
    values: [
      {
        number: '01',
        title: 'እያንዳንዱ ተማሪ ይታወቃል',
        description:
          'መማር ከተማሪውን እንደ ሰው ከማወቅ ይጀምራል፤ ጥያቄዎቹን፣ ጥንካሬዎቹን እና ቀጣይ እርምጃዎቹን።',
      },
      {
        number: '02',
        title: 'ጉጉትዎ የሚበረታታበት ቦታ',
        description:
          'ጥልቅ ጥያቄዎችና አዳዲስ አመለካከቶች ዓለምን እንድንረዳ ይረዱናል።',
      },
      {
        number: '03',
        title: 'አብረን ስናድግ የተሻልን ነን',
        description:
          'ደግነት፣ መከባበርና የጋራ ኃላፊነት ጠንካራ የትምህርት ቤት ማኅበረሰብ ይፈጥራሉ።',
      },
    ],
    learningLabel: 'የበለጠ የበለፀገ ትምህርት',
    learningTitle: 'ዕውቀት መጀመሪያ ነው፤ መድረሻ አይደለም።',
    learningDescription:
      'ተማሪዎች ከእያንዳንዱ ትምህርት መልስ ብቻ ሳይሆን የማሰብ እምነት፣ የመመርመር ችሎታና የመማር ፍላጎት እንዲያገኙ እንፈልጋለን።',
    pillars: [
      {
        number: '01',
        title: 'በጥልቀት ማሰብ',
        description:
          'ጠንካራ መሠረት ይገንቡ፤ ሐሳቦችን ማገናኘትን፣ ችግር መፍታትንና በራስ መተማመንን ይማሩ።',
        icon: BookOpen,
      },
      {
        number: '02',
        title: 'ጉጉትን መጠበቅ',
        description:
          'ጥያቄዎችን ወደ አዳዲስ ፍላጎቶች፣ ፈጠራና ጠቃሚ ግኝቶች ይቀይሩ።',
        icon: Compass,
      },
      {
        number: '03',
        title: 'አቅጣጫዎን ማግኘት',
        description:
          'ወደ ቀጣዩ እርምጃ የሚያደርሱ መተማመንን፣ ጽናትንና ባህሪን ያዳብሩ።',
        icon: GraduationCap,
      },
    ],
    communityLabel: 'ትምህርት ቤት ማለት ሰዎች ማለት ነው',
    communityTitle: 'የሚቀላቀሉበት፣ የሚያበረክቱበትና የሚያድጉበት ቦታ።',
    communityDescription:
      'ተማሪዎች ሲታወቁና ድጋፍ ሲያገኙ በተሻለ ሁኔታ ይማራሉ። የተማሪዎች፣ የቤተሰቦችና የአስተማሪዎች ትብብር ማኅበረሰባችንን እንዲያድግ ያግዛል።',
    communityLink: 'ትምህርት ቤታችንን ይወቁ',
    visitLabel: 'ቀጣዩ ምዕራፍዎ',
    visitTitle: 'ምን ማሳካት እንደሚቻል ይመልከቱ።',
    visitDescription:
      'በሃርቫርድ አካዳሚ ልንቀበልዎ ደስ ይለናል። በሆሳዕና ይገኙና ስለ ልጅዎ የትምህርት ጉዞ ይወያዩ።',
    findUs: 'በሆሳዕና ያግኙን',
    openPortal: 'የትምህርት ቤት መግቢያ',
    footerLine: 'በዓላማ መማር። አብሮ ማደግ።',
    previousPhoto: 'ወደ ቀዳሚው ምስል',
    nextPhoto: 'ወደ ቀጣዩ ምስል',
    photoAlt: 'ተማሪዎች በክፍል ውስጥ አብረው ሲማሩ',
    communityAlt: 'አስተማሪ ተማሪዎችን አብረው እንዲሠሩ ሲያግዝ',
    illustrationNote: 'ምሳሌያዊ ፎቶግራፍ',
  },
} as const;

const heroPhotos = [
  {
    src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1500&q=85',
    position: 'center',
  },
  {
    src: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1500&q=85',
    position: 'center',
  },
  {
    src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1500&q=85',
    position: 'center',
  },
];

const LandingPage = () => {
  const [language, setLanguage] = useState<SchoolSiteLanguage>(() => {
    const savedLanguage = window.localStorage.getItem('school-site-language');
    return savedLanguage === 'am' ? 'am' : 'en';
  });
  const [photoIndex, setPhotoIndex] = useState(0);
  const text = content[language];

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem('school-site-language', language);
    document.title =
      language === 'am'
        ? 'ሃርቫርድ አካዳሚ | ሆሳዕና፣ ኢትዮጵያ'
        : 'Harvard Academy | Hossana, Ethiopia';
  }, [language]);

  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('[data-reveal]');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const scrollableHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;
      document.documentElement.style.setProperty('--page-progress', String(progress));
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  const changePhoto = (direction: -1 | 1) => {
    setPhotoIndex((current) => (current + direction + heroPhotos.length) % heroPhotos.length);
  };

  const toggleLanguage = () => {
    setLanguage((current) => (current === 'en' ? 'am' : 'en'));
  };

  const photo = heroPhotos[photoIndex];

  return (
    <main lang={language} className="academy-page min-h-screen overflow-hidden bg-[#f5f5f0] text-[#17271f]">
      <div className="academy-progress" aria-hidden="true" />

      <div className="academy-topline">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-5 py-2.5 sm:px-8 lg:px-12">
          <p className="flex items-center gap-2 text-xs text-white/75">
            <MapPin size={14} className="text-[#c8f169]" aria-hidden="true" />
            <span>{text.location}</span>
          </p>
          <p className="hidden text-xs text-white/60 sm:block">{text.tagline}</p>
          <Link to="/login" className="academy-toplink">
            {text.portal} <MoveUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>

      <SchoolSiteNavigation language={language} onToggleLanguage={toggleLanguage} />

      <section id="top" className="academy-hero">
        <div className="academy-hero-visual academy-enter">
          <div className="academy-photo-frame">
            <img
              key={photo.src}
              src={photo.src}
              alt={text.photoAlt}
              className="academy-hero-photo"
              style={{ objectPosition: photo.position }}
            />
            <div className="academy-photo-shade" />
            <div className="academy-photo-topline">
              <span className="academy-live-dot" />
              {text.location}
            </div>
            <div className="academy-photo-caption">
              <span>{text.illustrationNote}</span>
              <h2>{text.photoCaption}</h2>
            </div>
          </div>
        </div>
        <div className="academy-hero-grid mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="academy-hero-copy">
            <p className="academy-eyebrow academy-enter">
              <Sparkles size={15} aria-hidden="true" />
              {text.eyebrow}
            </p>
            <h1 className="academy-display academy-enter academy-delay-1">
              {text.heroLineOne}
              <br />
              <span>{text.heroLineTwo}</span>
            </h1>
            <p className="academy-hero-description academy-enter academy-delay-2">
              {text.heroDescription}
            </p>
            <div className="academy-hero-actions academy-enter academy-delay-3">
              <a href="#approach" className="academy-button academy-button-lime">
                {text.explore} <ArrowRight size={17} aria-hidden="true" />
              </a>
              <Link to="/login" className="academy-button academy-button-glass">
                {text.familyPortal} <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <a href="#approach" className="academy-scroll-hint">
              <span className="academy-scroll-icon"><ArrowDown size={15} /></span>
              {text.scroll}
            </a>
          </div>
        </div>
        <div
          className="academy-photo-controls"
          role="group"
          aria-label={text.photoLabel}
        >
          <button
            type="button"
            onClick={() => changePhoto(-1)}
            aria-label={text.previousPhoto}
          >
            <ChevronLeft size={17} />
          </button>
          <div className="flex items-center gap-1.5">
            {heroPhotos.map((item, index) => (
              <button
                key={item.src}
                type="button"
                className={`academy-photo-dot ${photoIndex === index ? 'is-active' : ''}`}
                onClick={() => setPhotoIndex(index)}
                aria-label={`${text.photoNumberLabel} ${index + 1}`}
                aria-pressed={photoIndex === index}
              />
            ))}
          </div>
          <button type="button" onClick={() => changePhoto(1)} aria-label={text.nextPhoto}>
            <ChevronRight size={17} />
          </button>
        </div>
      </section>

      <div className="academy-marquee" aria-hidden="true">
        <div className="academy-marquee-track">
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>
              {text.marquee.split(' · ').map((word, wordIndex) => (
                <span key={`${index}-${wordIndex}`}>
                  {word} <Sparkles size={15} />{' '}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <section id="approach" className="academy-section academy-approach">
        <div className="academy-section-grid mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="academy-section-heading" data-reveal>
            <p className="academy-kicker">{text.approachLabel}</p>
            <h2>{text.approachTitle}</h2>
            <p>{text.approachDescription}</p>
            <a href="#learning" className="academy-text-link">
              {text.approachLink} <ArrowDownRight size={17} aria-hidden="true" />
            </a>
          </div>
          <div className="academy-values">
            {text.values.map((value, index) => {
              const ValueIcon = [BookOpen, Compass, HeartHandshake][index];
              return (
                <article
                  key={value.number}
                  className="academy-value-card"
                  data-reveal
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <span className="academy-value-number">{value.number}</span>
                  <span className="academy-value-icon"><ValueIcon size={19} /></span>
                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.description}</p>
                  </div>
                  <ArrowUpRight className="academy-value-arrow" size={17} aria-hidden="true" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="learning" className="academy-section academy-learning">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div className="academy-learning-heading" data-reveal>
            <div>
              <p className="academy-kicker">{text.learningLabel}</p>
              <h2>{text.learningTitle}</h2>
            </div>
            <p>{text.learningDescription}</p>
          </div>
          <div className="academy-pillar-grid">
            {text.pillars.map((pillar, index) => {
              const PillarIcon = pillar.icon;
              return (
                <article
                  key={pillar.number}
                  className={`academy-pillar-card academy-pillar-${index + 1}`}
                  data-reveal
                  style={{ transitionDelay: `${index * 120}ms` }}
                >
                  <div className="academy-pillar-top">
                    <span className="academy-pillar-icon"><PillarIcon size={22} /></span>
                    <span className="academy-pillar-number">{pillar.number}</span>
                  </div>
                  <div className="academy-pillar-copy">
                    <h3>{pillar.title}</h3>
                    <p>{pillar.description}</p>
                  </div>
                  <span className="academy-pillar-graphic" aria-hidden="true">
                    <PillarIcon />
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="community" className="academy-community">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 sm:px-8 md:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:px-12">
          <div className="academy-community-visual" data-reveal>
            <img
              src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=1200&q=85"
              alt={text.communityAlt}
              loading="lazy"
            />
            <div className="academy-community-image-tag">
              <span className="academy-live-dot" />
              {text.illustrationNote}
            </div>
            <span className="academy-community-outline" aria-hidden="true" />
          </div>
          <div className="academy-community-copy" data-reveal>
            <p className="academy-kicker">{text.communityLabel}</p>
            <h2>{text.communityTitle}</h2>
            <p className="academy-community-description">{text.communityDescription}</p>
            <a href="#visit" className="academy-button academy-button-dark">
              {text.communityLink} <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section id="visit" className="academy-visit">
        <div className="academy-visit-glow" aria-hidden="true" />
        <div className="academy-visit-inner mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-12">
          <div data-reveal>
            <p className="academy-kicker academy-kicker-light">{text.visitLabel}</p>
            <h2>{text.visitTitle}</h2>
            <p className="academy-visit-description">{text.visitDescription}</p>
          </div>
          <div className="academy-visit-actions" data-reveal>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Harvard+Academy%2C+Hossana%2C+Ethiopia"
              target="_blank"
              rel="noreferrer"
              className="academy-button academy-button-lime"
            >
              <MapPin size={17} aria-hidden="true" /> {text.findUs}
              <MoveUpRight size={15} aria-hidden="true" />
            </a>
            <Link to="/login" className="academy-button academy-button-glass">
              {text.openPortal} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <span className="academy-visit-monogram" aria-hidden="true">H</span>
        </div>
      </section>

      <footer className="academy-footer">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 px-5 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
          <a href="#top" className="academy-brand" aria-label={text.homeLabel}>
            <span className="academy-monogram academy-monogram-small">H</span>
            <span>
              <span className="block text-sm font-extrabold tracking-[0.1em]">HARVARD ACADEMY</span>
              <span className="mt-0.5 block text-[10px] text-white/50">{text.location}</span>
            </span>
          </a>
          <p className="text-xs text-white/50">{text.footerLine}</p>
          <Link to="/login" className="academy-footer-link">
            {text.portal} <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
