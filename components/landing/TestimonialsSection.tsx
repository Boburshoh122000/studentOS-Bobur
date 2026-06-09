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

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const envelopeRef = useRef<HTMLDivElement>(null);
  const envelopeInView = useInView(envelopeRef, { once: true, margin: '-60px' });

  const subRef = useRef<HTMLParagraphElement>(null);
  const subInView = useInView(subRef, { once: true, margin: '-60px' });

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

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
          ref={envelopeRef}
          className="relative flex items-center justify-center min-h-[340px]"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Decorative background cards */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-56 h-72 bg-[#f4f4f7] rounded-3xl -rotate-6 opacity-70 pointer-events-none" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-56 h-72 bg-[#f4f4f7] rounded-3xl rotate-6 opacity-70 pointer-events-none" />

          {/* Envelope reveal wrapper — card wipes upward from bottom slot */}
          <motion.div
            className="relative w-full max-w-sm z-10"
            initial={{ y: 90, clipPath: 'inset(100% 0 0 0 round 24px)' }}
            animate={
              envelopeInView
                ? { y: 0, clipPath: 'inset(0% 0 0 0 round 24px)' }
                : { y: 90, clipPath: 'inset(100% 0 0 0 round 24px)' }
            }
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Inner overflow-hidden so horizontal slide stays clipped */}
            <div className="overflow-hidden rounded-3xl">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={t.name}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
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
