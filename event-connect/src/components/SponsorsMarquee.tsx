import { motion } from 'motion/react';

const SPONSORS = [
  { src: '/sponsors/1.png', alt: 'Sponsor 1' },
  { src: '/sponsors/3.png', alt: 'Sponsor 3' },
  { src: '/sponsors/4.png', alt: 'Sponsor 4' },
  { src: '/sponsors/6.png', alt: 'Sponsor 6' },
  { src: '/sponsors/7.png', alt: 'Sponsor 7' },
  { src: '/sponsors/8.png', alt: 'Sponsor 8' },
  { src: '/sponsors/WhatsApp Image 2026-03-11 at 3.13.02 AM.jpeg', alt: 'Sponsor' },
  { src: '/sponsors/WhatsApp Image 2026-03-11 at 3.11.50 AM.jpeg', alt: 'Sponsor' },
  { src: '/coachu.jpg', alt: 'CoachU' },
  { src: '/ex.png', alt: 'X Agency' },
  { src: '/sapika.jpg', alt: 'Sapika' },
];

// Duplicate for seamless loop
const ITEMS = [...SPONSORS, ...SPONSORS];

export default function SponsorsMarquee() {
  return (
    <div className="w-full overflow-hidden border-t border-b border-white/5 py-3 bg-white/[0.02]">
      <motion.div
        className="flex gap-8 w-max"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ ease: 'linear', duration: 25, repeat: Infinity }}
      >
        {ITEMS.map((s, i) => (
          <div
            key={i}
            className="flex-shrink-0 h-10 w-24 flex items-center justify-center opacity-50 hover:opacity-90 transition-opacity duration-300"
          >
            <img
              src={s.src}
              alt={s.alt}
              className="max-h-full max-w-full object-contain transition-all duration-300"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
