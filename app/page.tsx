"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, ChevronDown, Crown, Award, Star, CheckCircle, Phone, Mail, X, Download, Users, Mic2, Clock } from "lucide-react";
import SpeakerSessions from '@/components/SpeakerSessions';
import BookingForm from '@/components/BookingForm';
import { ScrollVelocityContainer, ScrollVelocityRow } from '@/registry/magicui/scroll-based-velocity';
import { cn } from '@/lib/utils';
import { AnimatedList } from '@/registry/magicui/animated-list';
import { supabase } from "@/lib/supabase";

// Generate stars
const generateStars = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 60,
    size: 1 + Math.random() * 3,
    isGold: i % 3 === 0,
    duration: 2 + Math.random() * 3,
    delay: Math.random() * 2,
  }));

export default function Home() {
  const [stars, setStars] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [showSticky, setShowSticky] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [seatsLeft] = useState(() => Math.floor(Math.random() * 15) + 30);
  const [showPopup, setShowPopup] = useState(false);
  const POPUP_CODES = ['MAJLIS50A', 'MAJLIS50B', 'MAJLIS50C', 'MAJLIS50D', 'MAJLIS50E'];
  const [popupCode] = useState(() => POPUP_CODES[Math.floor(Math.random() * POPUP_CODES.length)]);

  useEffect(() => {
    const onScroll = () => {
      setShowSticky(window.scrollY > 600);
      const el = document.documentElement;
      setScrollProgress((window.scrollY / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem('popup_shown')) return;
    const t = setTimeout(() => { setShowPopup(true); sessionStorage.setItem('popup_shown', '1'); }, 3000);
    return () => clearTimeout(t);
  }, []);

  // Payment verification is now handled in /payment-success page
  useEffect(() => {
    // Only generate stars, payment check moved
    setStars(generateStars(60));
  }, []);



  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [nights, setNights] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]);
  const [eventConfig, setEventConfig] = useState<any>(null);


  useEffect(() => {
    if (!eventConfig?.start_date) return;

    const targetDate = new Date(eventConfig.start_date).getTime();
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      const d = Math.floor(difference / (1000 * 60 * 60 * 24));
      const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days: d > 0 ? d : 0, hours: h > 0 ? h : 0, minutes: m > 0 ? m : 0, seconds: s > 0 ? s : 0 });
    }, 1000);
    return () => clearInterval(interval);
  }, [eventConfig]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Nights
        const { data: nightsData, error: nightsError } = await supabase.from('event_nights').select('*').order('date', { ascending: true });
        if (nightsError) throw nightsError;
        if (nightsData) setNights(nightsData);

        // Fetch Industries
        const { data: industriesData, error: industriesError } = await supabase.from('industries').select('name').order('name');
        if (industriesError) console.error("Industries Fetch Error:", industriesError);
        if (industriesData) setIndustries(industriesData.map(i => i.name));

        // Fetch Speakers
        const { data: speakersData, error: speakersError } = await supabase.from('speakers').select('*').order('display_order', { ascending: true });
        if (speakersError) console.error("Speakers Fetch Error:", speakersError);
        if (speakersData) {
          // Sort speakers by Night Date
          const sortedSpeakers = [...speakersData].sort((a, b) => {
            const nightA = nightsData?.find((n: any) => n.id === a.night_id);
            const dateA = nightA ? new Date(nightA.date).getTime() : Number.MAX_SAFE_INTEGER; // Put speakers without night at the end

            const nightB = nightsData?.find((n: any) => n.id === b.night_id);
            const dateB = nightB ? new Date(nightB.date).getTime() : Number.MAX_SAFE_INTEGER;

            if (dateA !== dateB) {
              return dateA - dateB;
            }
            return (a.display_order || 0) - (b.display_order || 0);
          });
          setSpeakers(sortedSpeakers);
        }

        // Fetch Event Config (Package Price)
        const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('slug', 'Ramadan Majlis Package').single();
        if (eventError) console.error("Event Config Error:", eventError);
        if (eventData) setEventConfig(eventData);

      } catch (err: any) {
        console.error("Supabase Error:", err);
        console.error(err.message);
      } finally {
        // Add a small delay for smoother transition
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
      {/* ========== SCROLL PROGRESS BAR ========== */}
      <div className="fixed top-0 inset-x-0 z-50 h-0.5 bg-white/5 pointer-events-none">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-[width] duration-100" style={{ width: `${scrollProgress}%` }} />
      </div>

      {/* ========== PROMO POPUP ========== */}
      <AnimatePresence>
        {showPopup && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPopup(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="pointer-events-auto w-full max-w-md bg-[#0a201b] border border-amber-500/40 rounded-3xl p-8 text-center shadow-2xl relative"
              >
                <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors"><X className="w-4 h-4 text-white" /></button>
                <div className="text-5xl mb-4">🎁</div>
                <h3 className="text-2xl font-bold text-white mb-2 font-serif">Special Welcome Offer</h3>
                <p className="text-emerald-200/70 mb-6 text-sm">Use this code at checkout to get <span className="text-amber-400 font-bold text-lg">50% OFF</span> your ticket!</p>
                <div
                  onClick={() => navigator.clipboard?.writeText(popupCode)}
                  className="cursor-pointer bg-amber-400/10 border-2 border-dashed border-amber-400/60 rounded-2xl py-4 px-6 mb-6 group hover:bg-amber-400/20 transition-all"
                >
                  <div className="text-3xl font-bold font-mono text-amber-400 tracking-widest">{popupCode}</div>
                  <div className="text-xs text-amber-400/60 mt-1 group-hover:text-amber-400 transition-colors">Click to copy</div>
                </div>
                <button onClick={() => { setShowPopup(false); scrollToBooking(); }} className="w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 rounded-full transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  Reserve Now &amp; Save 50%
                </button>
                <p className="text-xs text-white/30 mt-3">Limited time offer · {seatsLeft} seats remaining</p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#022c22]"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"
              />
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-emerald-100 font-medium text-lg"
              >
                Loading Ramadan Majlis...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none -z-20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#022c22] opacity-80" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </div>

      {/* Animated Stars Background */}
      <div className="absolute inset-0 -z-10">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
            style={{
              left: `${star.left}%`,
              top: `${star.top}%`,
              width: star.size,
              height: star.size,
              backgroundColor: star.isGold ? '#fbbf24' : '#fff',
            }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [1, 1.5, 1] }}
            transition={{ duration: star.duration, repeat: Infinity, delay: star.delay }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 md:py-16 relative z-10">

        {/* Header / Nav Placeholder (Simple) */}
        <div className="flex justify-between items-center mb-12">
          <div className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="bg-amber-500 text-black px-2 py-1 rounded-md text-sm">2026</span>
            Ramadan Majlis
          </div>
          <button
            onClick={scrollToBooking}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
          >
            Reserve Now
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Right Content (Text) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left lg:sticky lg:top-24 space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 font-medium text-sm">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>The Premier Ramadan Event of 2026</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight font-serif">
              {eventConfig?.name?.split(' ')[0] || "Ramadan"} <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-300 via-yellow-200 to-amber-400">{eventConfig?.name?.split(' ').slice(1).join(' ') || "Majlis"}</span>
              <br />
              <span className="text-3xl md:text-5xl font-light text-emerald-100/90 mt-2 block font-sans">{eventConfig?.subtitle || "For Entrepreneurs"}</span>
            </h1>

            {/* Countdown Timer */}
            <div className="flex justify-center lg:justify-start gap-4" dir="ltr">
              {[
                { label: "Days", value: timeLeft.days },
                { label: "Hours", value: timeLeft.hours },
                { label: "Mins", value: timeLeft.minutes },
                { label: "Secs", value: timeLeft.seconds }
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm mb-2">
                    <span className="text-2xl md:text-3xl font-bold text-white">{String(item.value).padStart(2, '0')}</span>
                  </div>
                  <span className="text-[10px] md:text-xs text-emerald-200/60 uppercase tracking-widest">{item.label}</span>
                </div>
              ))}
            </div>

            <p className="text-lg text-emerald-100/70 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {eventConfig?.description || (
                <>
                  Join us for an exceptional experience combining the spirituality of the Holy Month with the ambition of future leaders.
                  <span className="text-amber-300 font-semibold mx-1">and Networking</span>
                  in a luxurious atmosphere worthy of you.
                </>
              )}
            </p>

            <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-sm text-emerald-200/60">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <Calendar size={16} className="text-amber-400" />
                <span>
                  {eventConfig?.start_date
                    ? new Date(eventConfig.start_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
                    : "Date TBD"}
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
                <a
                  href={eventConfig?.location_url || "#"}
                  target={eventConfig?.location_url ? "_blank" : "_self"}
                  className="flex items-center gap-2 hover:text-emerald-400 transition-colors"
                >
                  <MapPin size={16} className="text-emerald-400" />
                  <span>{eventConfig?.location_name || "Location TBD"}</span>
                </a>
              </div>
            </div>

          </motion.div>

          {/* Left Content (Form) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full -z-10" />

            <div className="relative" id="booking-form">
              <BookingForm nights={nights} packagePrice={eventConfig?.package_price} industries={industries} />
            </div>
          </motion.div>

        </div>

      </div>

      {/* ========== SCROLL VELOCITY ========== */}
      <div className="relative -my-2 overflow-hidden" style={{ transform: 'rotate(-5deg) scaleX(1.1)', transformOrigin: 'center' }}>
        <ScrollVelocityContainer className="text-xl font-semibold tracking-widest uppercase text-white/25 py-3">
          <ScrollVelocityRow baseVelocity={80} direction={1}>
            Elite Networking · Strategic Partnerships · Business Growth · Expert Panels · Exclusive Access ·
          </ScrollVelocityRow>
          <ScrollVelocityRow baseVelocity={80} direction={-1}>
            Leadership Insights · AI & Innovation · Financial Mastery · Brand Building · Legacy Creation ·
          </ScrollVelocityRow>
        </ScrollVelocityContainer>
      </div>

      {/* ========== SOCIAL PROOF STRIP ========== */}
      <div className="py-8 border-y border-white/5 bg-white/[0.02]">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {[
              { icon: Mic2, value: '15+', label: 'Elite Speakers' },
              { icon: Users, value: '500+', label: 'Attendees' },
              { icon: Clock, value: '1', label: 'Night Only' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-amber-400" />
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-emerald-200/50 text-sm">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========== GRAND SUMMIT AGENDA ========== */}
      <SectionSeparator />
      {nights.find(n => n.title === 'Grand Summit') && <GrandSummitAgenda night={nights.find(n => n.title === 'Grand Summit')} onBook={scrollToBooking} speakers={speakers} />}

      {/* CTA after Agenda */}
      <div className="text-center py-6">
        <button onClick={scrollToBooking} className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg hover:shadow-emerald-500/20">
          Reserve Your Seat Now
        </button>
      </div>

      {/* ========== ELITE SPEAKERS SECTION ========== */}
      <SectionSeparator />
      <SpeakerSessions
        speakers={speakers.filter(s => s.role !== 'VIP Guest' && s.role !== 'Moderator')}
        title="Elite Speakers"
      />

      {/* CTA after Speakers */}
      <div className="text-center py-6 -mt-8">
        <button onClick={scrollToBooking} className="bg-amber-400 hover:bg-amber-500 text-black px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          Secure Your Spot
        </button>
      </div>

      {/* ========== VIP GUESTS SECTION (NOW MARQUEE) ========== */}
      {speakers.filter(s => s.role === 'VIP Guest').length > 0 && (
        <>
          <section className="pt-0 pb-24 relative overflow-hidden bg-amber-900/10">
            <div className="container mx-auto px-4 mb-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">VIP Guests</h2>
              <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full opacity-50"></div>
            </div>

            <div className="overflow-hidden w-full relative group" dir="ltr">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#022c22] to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#022c22] to-transparent z-10" />

              <motion.div
                className="flex gap-12 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 40, repeat: Infinity }}
              >
                {[...speakers.filter(s => s.role === 'VIP Guest'), ...speakers.filter(s => s.role === 'VIP Guest')].map((speaker, idx) => (
                  <div key={`vip-marquee-${speaker.id}-${idx}`} className="w-[300px] text-center flex-shrink-0 group/card">
                    <div className="w-48 h-48 border-2 border-amber-500/50 mx-auto rounded-full overflow-hidden mb-6 bg-emerald-900/20 relative shadow-[0_0_20px_rgba(245,158,11,0.2)] group-hover/card:scale-105 group-hover/card:border-amber-400 group-hover/card:shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-500">
                      <img
                        src={speaker.image_url || "/placeholder-user.jpg"}
                        alt={speaker.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder-user.jpg";
                        }}
                      />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 font-serif">{speaker.name}</h3>
                    <p className="text-amber-400 font-semibold mb-1 uppercase tracking-wider text-sm">{speaker.role}</p>
                    <p className="text-emerald-200/60 text-sm">{speaker.title}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>
        </>
      )}

      {/* ========== PARTNERS SECTION ========== */}

      <SponsorshipSection />

      <SectionSeparator />
      <FaqSection />

      <SectionSeparator />
      <Footer />

      {/* ========== WHATSAPP FLOAT BUTTON ========== */}
      <a
        href="https://wa.me/201505822735"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-5 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] rounded-full flex items-center justify-center shadow-lg hover:shadow-[#25D366]/40 transition-all duration-300 hover:scale-110"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
      </a>

      {/* ========== STICKY CTA BAR ========== */}
      <AnimatePresence>
        {showSticky && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed bottom-0 inset-x-0 z-40 bg-[#022c22]/95 backdrop-blur-md border-t border-emerald-500/30 px-4 py-4"
          >
            <div className="container mx-auto flex items-center justify-between gap-4 max-w-3xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                <div className="flex items-center gap-2 text-sm text-emerald-200/70">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-white font-semibold">
                    {String(timeLeft.days).padStart(2, '0')}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
                <span className="hidden sm:block text-white/20">·</span>
                <span className="text-xs text-emerald-200/50">Only <span className="text-amber-400 font-bold">{seatsLeft}</span> seats left</span>
              </div>
              <motion.button
                onClick={scrollToBooking}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                animate={{ boxShadow: ['0 0 15px rgba(251,191,36,0.3)', '0 0 30px rgba(251,191,36,0.6)', '0 0 15px rgba(251,191,36,0.3)'] }}
                transition={{ boxShadow: { duration: 2, repeat: Infinity } }}
                className="bg-amber-400 hover:bg-amber-500 text-black font-bold px-8 py-3 rounded-full text-base"
              >
                Reserve Your Seat
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}

function GrandSummitAgenda({ night, onBook, speakers }: { night: any; onBook: () => void; speakers: any[] }) {
  const agenda: { time: string; title: string; type?: string; panel_key?: string }[] = (night.agenda || []).filter((item: any) => item.type !== 'activity');

  const speakersByPanel: Record<string, any[]> = {};
  speakers.forEach(s => { if (s.panel_key) { (speakersByPanel[s.panel_key] ??= []).push(s); } });

  const typeColor: Record<string, string> = {
    panel: 'border-amber-500/40 bg-amber-500/5',
    activity: 'border-emerald-500/30 bg-emerald-500/5',
    welcome: 'border-emerald-500/30 bg-emerald-500/5',
    suhoor: 'border-purple-500/30 bg-purple-500/5',
  };

  const [y, m, d] = (night.date as string).split('-').map(Number);
  const nightDate = new Date(y, m - 1, d);

  return (
    <section className="py-24 bg-[#0a352a]/20 relative overflow-hidden">
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            One Night Only
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 font-serif">{night.title}</h2>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-200/60 mt-4">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-400" />
              {nightDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            <a href="https://maps.app.goo.gl/aU81FrqETdqqM7Mh8" target="_blank" className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400" />{night.location}
            </a>
          </div>
        </div>

        <div className="relative">
          <AnimatedList delay={400}>
            {agenda.map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative w-full cursor-default overflow-hidden rounded-2xl p-4",
                  "transition-all duration-200 hover:scale-[1.02]",
                  "dark:bg-transparent dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset] dark:backdrop-blur-md dark:[border:1px_solid_rgba(255,255,255,.1)]",
                  typeColor[item.type || ''] || 'border-white/10 bg-white/5'
                )}
              >
                <div className="flex flex-row items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-lg"
                    style={{ backgroundColor: item.type === 'panel' ? '#92400e' : item.type === 'suhoor' ? '#4c1d95' : '#064e3b' }}
                  >
                    {item.type === 'panel' ? '🎙' : item.type === 'activity' ? '⚡' : item.type === 'welcome' ? '☕' : '🌙'}
                  </div>
                  <div className="flex flex-col overflow-hidden flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white truncate">{item.title}</span>
                      {item.type !== 'panel' && (
                        <><span className="text-white/30">·</span>
                          <span className="text-xs text-amber-400 font-mono whitespace-nowrap">{item.time}</span></>
                      )}
                    </div>
                    {item.type === 'panel' && item.panel_key && speakersByPanel[item.panel_key] && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {speakersByPanel[item.panel_key].map(s => (
                          <div key={s.id} className="flex items-center gap-1 bg-white/5 rounded-full px-2 py-0.5">
                            <img
                              src={s.image_url || '/placeholder-user.jpg'}
                              alt={s.name}
                              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-user.jpg'; }}
                              className="w-4 h-4 rounded-full object-cover border border-white/20"
                            />
                            <span className="text-[10px] text-emerald-200/70 whitespace-nowrap">{s.name.trim()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </AnimatedList>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a352a]/60 to-transparent" />
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={onBook}
            className="bg-amber-400 hover:bg-amber-500 text-black text-lg px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]"
          >
            Secure Your Seat
          </button>
        </div>
      </div>
    </section>
  );
}

function SectionSeparator() {
  return (
    <div className="relative py-8 flex items-center justify-center">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-emerald-500/10"></div>
      </div>
      <div className="relative flex justify-center">
        <div className="bg-[#022c22] px-4">
          <div className="w-3 h-3 rotate-45 bg-amber-500/20 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"></div>
        </div>
      </div>
    </div>
  );
}

function SponsorshipSection() {
  const [activePlan, setActivePlan] = useState<any>(null);

  const sponsorshipPlans = [
    {
      id: 'platinum',
      name: "Platinum",
      price: "50,000",
      tickets: "10 Tickets",
      color: "from-slate-200 via-slate-100 to-slate-300",
      borderColor: "border-slate-300",
      icon: Crown,
      features: [
        "Top-tier logo placement on all materials",
        "Dedicated spotlight during the event program",
        "Speaking opportunity (short brand message)",
        "Exclusive branding within the venue",
        "10 VIP Tickets",
        "Full social media campaign collaboration"
      ]
    },
    {
      id: 'golden',
      name: "Golden",
      price: "40,000",
      tickets: "5 Tickets",
      color: "from-amber-300 via-yellow-200 to-amber-400",
      borderColor: "border-amber-400",
      icon: Award,
      features: [
        "Prominent logo placement across all visuals",
        "Dedicated social media post highlighting the sponsor",
        "Roll-up banner & branded table at venue",
        "Verbal brand mention during all three nights",
        "5 VIP Tickets",
        "Opportunity to include branded items in gift bags"
      ]
    },
    {
      id: 'silver',
      name: "Silver",
      price: "30,000",
      tickets: "3 Tickets",
      color: "from-gray-300 via-gray-200 to-gray-400",
      borderColor: "border-gray-400",
      icon: Star,
      features: [
        "Logo placement on all event materials",
        "Social media brand mentions before and during the event",
        "Roll-up banner placement at venue",
        "Brand mention during two event nights",
        "3 VIP Tickets"
      ]
    },
    {
      id: 'bronze',
      name: "Bronze",
      price: "20,000",
      tickets: "2 Tickets",
      color: "from-amber-700 via-amber-600 to-amber-800",
      borderColor: "border-amber-700",
      icon: CheckCircle,
      features: [
        "Logo placement on event visual materials",
        "Logo inclusion on social media announcements",
        "Brand mention during two event nights",
        "2 complimentary tickets"
      ]
    }
  ];

  return (
    <>
      <section id="sponsorship" className="py-24 bg-[#0a352a]/30">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Sponsorship Packages</h2>
            <p className="text-emerald-200/60 mb-8">Partner in success and showcase your brand to the elite.</p>
            <a
              href="/Ramadan Majlis Package  SPONSER1 (1).pdf"
              download
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/10 border border-amber-500/50 text-amber-400 hover:bg-amber-500 hover:text-black transition-all duration-300 font-bold"
            >
              <Download className="w-5 h-5" />
              Download Full Package PDF
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sponsorshipPlans.map((plan, idx) => (
              <motion.div
                key={idx}
                layoutId={`sponsor-${plan.id}`}
                onClick={() => setActivePlan(plan)}
                whileHover={{ y: -8 }}
                className="relative rounded-3xl overflow-hidden bg-[#0c1220] border border-white/5 group cursor-pointer h-full transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-900/20"
              >
                {/* Gradient Border Effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b ${plan.color.replace('from-', 'from-').replace('via-', 'via-').replace('to-', 'to-')} p-[1px] rounded-3xl -z-10`} />

                {/* Top Shine */}
                <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${plan.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />

                <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${plan.color} bg-opacity-10 border border-white/5`}>
                      <plan.icon className="w-8 h-8 text-white" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-emerald-200/70 font-mono">
                      {plan.tickets}
                    </div>
                  </div>

                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-2 group-hover:scale-105 transition-transform origin-left group-hover:text-slate-900`}>
                    {plan.name}
                  </h3>

                  <div className="flex items-baseline gap-1 my-4">
                    <span className="text-3xl md:text-4xl font-bold text-white tracking-tight group-hover:text-slate-900 transition-colors">{plan.price}</span>
                    <span className="text-emerald-200/50 text-sm font-medium group-hover:text-slate-500 transition-colors">EGP</span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.slice(0, 3).map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-400 group-hover:text-slate-700 transition-colors">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-gradient-to-r ${plan.color} group-hover:from-slate-700 group-hover:to-slate-900 transition-colors`} />
                        <span className="leading-snug font-medium">{feature}</span>
                      </li>
                    ))}
                    {plan.features.length > 3 && (
                      <li className="text-xs text-white/30 italic pl-3 group-hover:text-slate-500 transition-colors">+ {plan.features.length - 3} more privileges</li>
                    )}
                  </ul>

                  <button className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 
                    bg-gradient-to-r ${plan.color} text-black opacity-90 hover:opacity-100 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]`}>
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Our Partners */}
          <div className="mt-20 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Our Partners</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full opacity-50 mb-10"></div>
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 w-48 h-32 flex items-center justify-center shadow-lg hover:border-emerald-500/30 hover:bg-white/10 transition-all duration-300 group"
              >
                <img src="/Eventocity.png" alt="Eventocity" className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            </div>
          </div>

          {/* Our Sponsors */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Our Sponsors</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto rounded-full opacity-50 mb-10"></div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {[
                { src: "/coachu.jpg", alt: "CoachU" },
                { src: "/ex.png", alt: "X's Agency" },
                { src: "/sapika.jpg", alt: "Sapika" },
              ].map((sponsor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-4 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shadow-lg hover:border-amber-500/30 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <img src={sponsor.src} alt={sponsor.alt} className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Media Partner */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Media Partner</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full opacity-50 mb-10"></div>
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl p-4 w-36 h-36 md:w-44 md:h-44 flex items-center justify-center shadow-lg shadow-black/20 hover:scale-105 transition-transform duration-300"
              >
                <img src="/sponsor1.jpg" alt="Tawseq" className="max-w-full max-h-full object-contain" />
              </motion.div>
            </div>
          </div>

          {/* Community Partners */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Community Partners</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent mx-auto rounded-full opacity-50 mb-10"></div>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
              {[
                { src: "/cpmmuinty partner/1bassemschool.png", alt: "1 Bassem School" },
                { src: "/cpmmuinty partner/BusinessWithMo2.png", alt: "Business With Mo" },
                { src: "/cpmmuinty partner/TBT LOGO (1).svg", alt: "TBT" },
                { src: "/cpmmuinty partner/WhatsApp Image 2026-02-27 at 11.37.13 PM.jpeg", alt: "Community Partner 4" },
                { src: "/cpmmuinty partner/WhatsApp Image 2026-02-27 at 11.37.14 PM.jpeg", alt: "Community Partner 5" },
                { src: "/cpmmuinty partner/WhatsApp Image 2026-02-27 at 11.37.15 PM.jpeg", alt: "Community Partner 6" },
              ].map((sponsor, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white rounded-2xl p-4 w-32 h-32 md:w-40 md:h-40 flex items-center justify-center shadow-lg shadow-black/20 hover:border-blue-500/30 hover:scale-105 transition-all duration-300 group overflow-hidden"
                >
                  <img src={sponsor.src} alt={sponsor.alt} className="max-w-full max-h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Tech Partner */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">Tech Partner</h3>
            <div className="w-16 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full opacity-50 mb-10"></div>
            <div className="flex items-center justify-center">
              <a href="https://muhammedmekky.com" target="_blank" rel="noopener noreferrer">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-6 w-48 h-24 md:w-56 md:h-28 flex items-center justify-center shadow-lg shadow-black/20 hover:border-emerald-500/30 hover:bg-white/10 hover:scale-105 transition-all duration-300 group"
                >
                  <img src="/tech_partner.svg" alt="Tech Partner" className="max-w-full max-h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activePlan && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActivePlan(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                layoutId={`sponsor-${activePlan.id}`}
                className={`w-full max-w-lg bg-[#0a201b] border ${activePlan.borderColor} rounded-3xl shadow-2xl pointer-events-auto max-h-[90vh] overflow-y-auto relative scrollbar-hide`}
              >
                <div className="relative p-8 text-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActivePlan(null); }}
                    className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white transition-colors z-50 sticky"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className={`mx-auto w-20 h-20 rounded-full bg-gradient-to-br ${activePlan.color} p-5 mb-6`}>
                    <activePlan.icon className="w-full h-full text-white" />
                  </div>

                  <h3 className={`text-3xl font-bold bg-gradient-to-r ${activePlan.color} bg-clip-text text-transparent mb-2`}>
                    {activePlan.name}
                  </h3>
                  <div className="text-2xl font-bold text-white mb-8">{activePlan.price} <span className="text-sm font-normal text-white/50">EGP</span></div>

                  <div className="text-left space-y-4 mb-8 bg-white/5 rounded-2xl p-6">
                    <h4 className="text-white font-bold mb-4 text-center">Package Benefits</h4>
                    {activePlan.features.map((feature: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className={`w-5 h-5 shrink-0 ${activePlan.name === 'Platinum' ? 'text-slate-300' : activePlan.name === 'Golden' ? 'text-amber-400' : 'text-emerald-500'}`} />
                        <span className="text-emerald-100/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'Contact', {
                            content_name: `WhatsApp - ${activePlan.name} Package`,
                            content_category: 'Sponsorship'
                          });
                        }
                        window.open(`https://wa.me/201505822735?text=${encodeURIComponent(`Hello, I am interested in the ${activePlan.name} sponsorship package for Ramadan Majlis.`)}`, '_blank')
                      }}
                      className="w-full flex items-center justify-center h-12 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl transition-colors"
                    >
                      <Phone className="w-5 h-5 ml-2" />
                      Contact via WhatsApp
                    </button>

                    <button
                      onClick={() => {
                        if (typeof window !== 'undefined' && window.fbq) {
                          window.fbq('track', 'Contact', {
                            content_name: `Email - ${activePlan.name} Package`,
                            content_category: 'Sponsorship'
                          });
                        }
                        window.location.href = `mailto:contact@nextacademyedu.com?subject=${encodeURIComponent(`Sponsorship Inquiry - ${activePlan.name} Package`)}`
                      }}
                      className="w-full flex items-center justify-center h-12 text-lg bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
                    >
                      <Mail className="w-5 h-5 ml-2" />
                      Contact via Email
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "Is there parking available?", a: "Yes, free Valet Parking is available for all attendees for your convenience." },
    { q: "What is the refund policy?", a: "Tickets are fully refundable up to 7 days before the event. After that, they are non-refundable." },
    { q: "What is the Dress Code?", a: "Smart Casual or elegant Ramadan attire (Kaftan/Abaya) to match the atmosphere." },
    { q: "Are there group discounts?", a: "Yes, we offer special discounts for groups and companies. Please contact us for a quote." }
  ];

  return (
    <section className="py-24 bg-[#0a352a]/20 border-t border-emerald-500/10">
      <div className="container mx-auto px-4 max-w-3xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((item, idx) => (
            <div
              key={idx}
              className="bg-[#064e3b]/30 rounded-2xl overflow-hidden border border-emerald-500/10"
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#064e3b]/50 transition-colors"
              >
                <span className="font-bold text-white text-lg">{item.q}</span>
                <ChevronDown className={`w-5 h-5 text-emerald-400 transition-transform duration-300 ${openFaq === idx ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-emerald-100/70 leading-relaxed border-t border-white/5">
                      {item.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 bg-[#022c22] border-t border-emerald-900">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-center md:text-left flex flex-col md:flex-row items-center gap-6">
            <div className="flex items-center gap-6">
              <img src="/logo.svg" alt="Next Academy" className="h-12 w-auto brightness-0 invert opacity-90" />
              <div className="h-8 w-px bg-white/20 hidden md:block" />
              <img src="/Eventocity.png" alt="Eventocity" className="h-10 w-auto brightness-0 invert opacity-90" />
            </div>
            <p className="text-emerald-200/40 text-sm md:mr-4 mt-4 md:mt-0">All Rights Reserved © 2026</p>
            <a href="https://muhammedmekky.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 mt-2 opacity-60 hover:opacity-100 transition-opacity">
              <span className="text-emerald-200/40 text-xs">Tech Partner</span>
              <img src="/tech_partner.svg" alt="Muhammed Mekky" className="h-16 w-auto" />
            </a>
          </div>

          <div className="flex gap-6">
            <a href="#" className="text-emerald-200/60 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-emerald-200/60 hover:text-white transition-colors">Terms & Conditions</a>
            <a href="#" className="text-emerald-200/60 hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
