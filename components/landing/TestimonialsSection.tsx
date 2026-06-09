import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    name: 'Aziza Mirzayeva',
    role: 'Computer Science student at WIUT',
    avatar: 'https://i.pravatar.cc/100?u=aziza',
    rating: 5,
    quote:
      'I rewrote my CV with StudentOS and got 3 interview calls in one week. The ATS checker alone was worth it — I had no idea my old CV was scoring 32%.',
  },
  {
    name: 'Jasur Karimov',
    role: 'Engineering student at INHA University',
    avatar: 'https://i.pravatar.cc/100?u=jasur',
    rating: 5,
    quote:
      'The learning plan feature helped me structure my prep for internship season. I went from zero offers to two competing offers in a single semester.',
  },
  {
    name: 'Sofia Lozano',
    role: 'Business student at Turin Polytechnic',
    avatar: 'https://i.pravatar.cc/100?u=sofia',
    rating: 5,
    quote:
      'Plagiarism checker saved me from submitting an essay with accidental similarity. The dashboard makes it so easy to track everything in one place.',
  },
  {
    name: 'Bobur Tashmatov',
    role: 'Finance student at Westminster',
    avatar: 'https://i.pravatar.cc/100?u=bobur',
    rating: 5,
    quote:
      'The scholarship finder helped me discover opportunities I never knew existed. Found three scholarships and successfully applied for two of them.',
  },
];

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-5 h-5 text-[#F59E0B] fill-current" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm font-semibold text-[#111827] ml-1">{count}.0</span>
    </div>
  );
}

function TypewriterHeading() {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const text = 'Words of Appreciation';

  return (
    <h2 ref={ref} className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-tight">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 18 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
          transition={{ duration: 0.28, delay: 0.1 + i * 0.042, ease: 'easeOut' }}
          className="inline-block"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </h2>
  );
}

// Premium white envelope with open flap and brand seal
function EnvelopeSVG() {
  return (
    <svg
      width="340"
      height="210"
      viewBox="0 0 340 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="envelope-svg"
    >
      <defs>
        <linearGradient
          id="flapGrad"
          x1="170"
          y1="0"
          x2="170"
          y2="108"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#f0f0f4" />
          <stop offset="100%" stopColor="#e4e4e9" />
        </linearGradient>
        <linearGradient id="sideL" x1="0" y1="0" x2="170" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5f5f8" />
          <stop offset="100%" stopColor="#ededf1" />
        </linearGradient>
        <linearGradient id="sideR" x1="340" y1="0" x2="170" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f5f5f8" />
          <stop offset="100%" stopColor="#ededf1" />
        </linearGradient>
        <linearGradient
          id="bodyGrad"
          x1="170"
          y1="0"
          x2="170"
          y2="210"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8f8fb" />
        </linearGradient>
      </defs>

      {/* Envelope body */}
      <rect
        width="340"
        height="210"
        rx="18"
        fill="url(#bodyGrad)"
        stroke="#e2e2e8"
        strokeWidth="1.5"
      />

      {/* Left side fold */}
      <path d="M1 1 L170 118 L1 209" fill="url(#sideL)" stroke="#e4e4ea" strokeWidth="0.8" />

      {/* Right side fold */}
      <path d="M339 1 L170 118 L339 209" fill="url(#sideR)" stroke="#e4e4ea" strokeWidth="0.8" />

      {/* Bottom V fold */}
      <path d="M1 209 L170 118 L339 209" fill="#ececf0" stroke="#e2e2e8" strokeWidth="0.8" />

      {/* Open flap — tilted back (pointing up), showing underside */}
      <path d="M3 3 L170 106 L337 3Z" fill="url(#flapGrad)" stroke="#d8d8de" strokeWidth="1.5" />
      {/* Flap crease shadow */}
      <path
        d="M3 3 L170 106 L337 3"
        fill="none"
        stroke="#c8c8ce"
        strokeWidth="0.6"
        strokeDasharray="4 3"
      />

      {/* Brand seal — purple circle at fold centre */}
      <circle cx="170" cy="118" r="14" fill="#7C3AED" opacity="0.12" />
      <circle cx="170" cy="118" r="9" fill="#7C3AED" />
      <text
        x="170"
        y="122"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="800"
        fontFamily="system-ui, sans-serif"
      >
        S
      </text>
    </svg>
  );
}

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  // Three explicit states driven by timeouts (no AnimatePresence phase bug)
  const [showEnvelope, setShowEnvelope] = useState(false);
  const [cardRising, setCardRising] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const inView = useInView(areaRef, { once: true, margin: '-60px' });

  const subRef = useRef<HTMLParagraphElement>(null);
  const subInView = useInView(subRef, { once: true, margin: '-60px' });

  useEffect(() => {
    if (!inView) return;
    // t=0   → envelope enters
    setShowEnvelope(true);
    // t=1.4s → card starts rising from envelope
    const t1 = setTimeout(() => setCardRising(true), 1400);
    // t=4.0s → envelope exits (card is fully out by ~3.0s)
    const t2 = setTimeout(() => setShowEnvelope(false), 4000);
    // t=5.0s → auto-rotate begins
    const t3 = setTimeout(() => setAutoRotate(true), 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [inView]);

  useEffect(() => {
    if (paused || !autoRotate) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused, autoRotate]);

  const prev = () => {
    setDirection(-1);
    setIndex((i) => (i - 1 + testimonials.length) % testimonials.length);
  };

  const next = () => {
    setDirection(1);
    setIndex((i) => (i + 1) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <section className="w-full py-20 px-4 bg-white overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Heading — typewriter on scroll */}
        <div className="text-center mb-14">
          <TypewriterHeading />
          <motion.p
            ref={subRef}
            className="text-gray-400 mt-4 text-base max-w-md mx-auto"
            initial={{ opacity: 0, y: 10 }}
            animate={subInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 1.1 }}
          >
            Thousands of students use StudentOS to build their academic future.
          </motion.p>
        </div>

        {/* Carousel area */}
        <div
          ref={areaRef}
          className="relative flex items-center justify-center min-h-[400px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Decorative background shapes */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-56 h-72 bg-[#f4f4f7] rounded-3xl -rotate-6 opacity-70 pointer-events-none" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72 bg-[#f4f4f7] rounded-3xl rotate-6 opacity-70 pointer-events-none" />

          {/* Envelope — explicit boolean, AnimatePresence handles enter/exit */}
          <AnimatePresence>
            {showEnvelope && (
              <motion.div
                key="envelope"
                className="absolute bottom-2 z-0 pointer-events-none"
                initial={{ opacity: 0, y: 70, scale: 0.82 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{
                  opacity: 0,
                  y: 40,
                  scale: 0.88,
                  transition: { duration: 0.8, ease: 'easeIn' },
                }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <EnvelopeSVG />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card — wipes upward (bottom reveals first) as if rising from envelope */}
          <motion.div
            className="relative w-full max-w-sm z-10"
            initial={{ y: 100, clipPath: 'inset(100% 0 0 0 round 24px)' }}
            animate={
              cardRising
                ? { y: 0, clipPath: 'inset(0% 0 0 0 round 24px)' }
                : { y: 100, clipPath: 'inset(100% 0 0 0 round 24px)' }
            }
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={t.name}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 flex flex-col items-center text-center"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md mb-4">
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-base font-bold text-[#111827]">{t.name}</p>
                  <p className="text-sm text-gray-400 mt-0.5">{t.role}</p>
                  <div className="mt-4">
                    <StarRating count={t.rating} />
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mt-4">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Controls: prev · dots · next */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous testimonial"
            className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[#111827]" />
          </button>

          <div className="flex items-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to testimonial ${i + 1}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === index ? 'w-5 h-2 bg-[#111827]' : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Next testimonial"
            className="w-12 h-12 rounded-full border border-gray-200 bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-[#111827]" />
          </button>
        </div>
      </div>
    </section>
  );
}
