"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Calendar, MapPin, ChevronDown, Crown, Award, Star, CheckCircle, Phone, Mail, X, Download } from "lucide-react";
import BookingForm from '@/components/BookingForm';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import NightDetailsModal from '@/components/NightDetailsModal';

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
  const router = useRouter();

  useEffect(() => {
    const checkPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      
      // Paymob Return Parameters
      const success = params.get('success');
      const transactionId = params.get('id');
      const bookingId = params.get('merchant_order_id');

      if (success === 'false') {
        // Payment Declined
        alert("Payment Declined. Please try again.");
        router.replace('/'); 
        return;
      }

      if (success === 'true' && transactionId) {
        setIsLoading(true);
        try {
          const res = await fetch('/api/verify-transaction', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
              transactionId, 
              bookingId 
            })
          });
          const data = await res.json();
          
          if (data.success) {
            router.replace('/success');
            return;
          } else {
            console.error("Verification Failed Details:", data);
            alert(data.message || "Payment Verification Failed");
            router.replace('/');
            return;
          }
        } catch (err) {
          console.error("Verification error", err);
          alert("Something went wrong verifying your payment.");
          router.replace('/');
          return;
        } finally {
          setIsLoading(false);
        }
      }

      // Legacy check - remove or keep as fallback? 
      // Removing it is safer to prevent the reported bug.
      /*
      if (params.get('status') === 'success') {
        router.replace('/success');
        return;
      }
      */

      setStars(generateStars(60));
    };

    checkPayment();
  }, [router]);



  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const [nights, setNights] = useState<any[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [speakers, setSpeakers] = useState<any[]>([]); 
  const [eventConfig, setEventConfig] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [activeNight, setActiveNight] = useState<any>(null);

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
        if (speakersData) setSpeakers(speakersData);

        // Fetch Event Config (Package Price)
        const { data: eventData, error: eventError } = await supabase.from('events').select('*').eq('slug', 'Ramadan Majlis Package').single();
        if (eventError) console.error("Event Config Error:", eventError);
        if (eventData) setEventConfig(eventData);

      } catch (err: any) {
        console.error("Supabase Error:", err);
        setFetchError(err.message || "Failed to load data");
      } finally {
        // Add a small delay for smoother transition
        setTimeout(() => setIsLoading(false), 500);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden font-sans">
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
                    {eventConfig?.start_date ? (
                        <>
                        {new Date(eventConfig.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {' - '}
                        {new Date(eventConfig.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </>
                    ) : "Date TBD"}
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

      {/* ========== NIGHTS SECTION ========== */}
      <SectionSeparator />
      <section className="py-24 bg-[#0a352a]/20 relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Nights</h2>
            <p className="text-emerald-200/60 max-w-2xl mx-auto">A comprehensive journey designed to cover all aspects of success</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {nights.length > 0 ? nights.map((night, idx) => (
              <motion.div
                key={night.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                onClick={() => setActiveNight(night)}
                 className={`group cursor-pointer relative p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-amber-500/40 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(245,158,11,0.15)] transition-all duration-500 overflow-hidden`}
              >
                {/* Hover Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${night.color_theme === 'blue' ? 'from-blue-500/10' : night.color_theme === 'amber' ? 'from-amber-500/10' : 'from-emerald-500/10'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 w-fit mb-6 ${night.color_theme === 'blue' ? 'text-blue-300' : night.color_theme === 'amber' ? 'text-amber-300' : 'text-emerald-300'} group-hover:scale-110 transition-transform duration-500`}>
                  <span className="text-2xl font-bold font-serif">{idx + 1}</span>
                </div>
                <h4 className="text-3xl font-bold text-white mb-2 font-serif group-hover:text-amber-400 transition-colors duration-300">{night.title}</h4>
                <p className="text-emerald-100/60 font-medium mb-4 text-sm uppercase tracking-widest">{night.subtitle}</p>
                <p className="text-emerald-100/80 text-sm leading-relaxed mb-8 line-clamp-3">{night.description}</p>
                
                <div className="pt-6 border-t border-white/5 flex justify-between items-center relative z-10">
                  <div>
                    <span className="text-amber-400 font-bold block text-lg font-serif">{night.price} {night.currency}</span>
                    <span className="text-xs text-emerald-200/40">{night.capacity} Seats</span>
                  </div>
                  <button className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-amber-500 hover:text-black text-white text-xs font-bold tracking-wide transition-all duration-300 uppercase border border-white/10 hover:border-amber-500">
                    Show Details
                  </button>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-3 text-center text-emerald-200/50">
                {fetchError ? (
                  <span className="text-red-400">Error loading data: {fetchError}</span>
                ) : (
                  "Loading nights..."
                )}
              </div>
            )}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={scrollToBooking}
              className="bg-amber-400 hover:bg-amber-500 text-black text-lg px-8 py-3 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(251,191,36,0.4)] hover:shadow-[0_0_30px_rgba(251,191,36,0.6)]"
            >
              Secure Your Seat
            </button>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {activeNight && (
            <NightDetailsModal 
                night={activeNight} 
                speakers={speakers} 
                onClose={() => setActiveNight(null)} 
            />
        )}
      </AnimatePresence>

      {/* ========== SPEAKERS SECTION ========== */}
      <SectionSeparator />
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Elite Speakers</h2>
        </div>

        <div className="flex flex-col gap-12 overflow-hidden w-full relative group" dir="ltr">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#022c22] to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#022c22] to-transparent z-10" />

          {speakers.length > 0 ? (
            <>
              {/* Row 1: Left Direction */}
              <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["0%", "-50%"] }}
                transition={{ ease: "linear", duration: 45, repeat: Infinity }}
              >
                {[...speakers, ...speakers].map((speaker, idx) => {
                  const isVIP = speaker.role === 'VIP Guest';
                  return (
                    <div key={`row1-${speaker.id}-${idx}`} className={`${isVIP ? 'w-[160px]' : 'w-[200px]'} text-center flex-shrink-0`}>
                      <div className={`${isVIP ? 'w-24 h-24 border-amber-500/30' : 'w-32 h-32 border-emerald-500/20'} mx-auto rounded-full overflow-hidden border-2 mb-4 bg-emerald-900/20 relative group-hover:scale-105 transition-transform duration-300`}>
                        <img 
                          src={speaker.image_url || "/placeholder-user.jpg"} 
                          alt={speaker.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; 
                          }}
                        />
                      </div>
                      <h3 className={`text-white font-bold ${isVIP ? 'text-sm' : 'text-base'}`}>{speaker.name}</h3>
                      <p className={`${isVIP ? 'text-amber-400/80' : 'text-emerald-400'} text-xs font-semibold mb-0.5`}>{speaker.role || 'Keynote Speaker'}</p>
                      <p className="text-emerald-200/50 text-xs">{speaker.title}</p>
                      {!isVIP && <p className="text-emerald-200/30 text-[10px] mt-1">{speaker.company}</p>}
                    </div>
                  )
                })}
              </motion.div>

              {/* Row 2: Right Direction (Reverse) */}
              <motion.div
                className="flex gap-8 w-max"
                animate={{ x: ["-50%", "0%"] }}
                transition={{ ease: "linear", duration: 50, repeat: Infinity }}
              >
                {[...speakers, ...speakers].map((speaker, idx) => {
                  const isVIP = speaker.role === 'VIP Guest';
                  return (
                    <div key={`row2-${speaker.id}-${idx}`} className={`${isVIP ? 'w-[160px]' : 'w-[200px]'} text-center flex-shrink-0`}>
                      <div className={`${isVIP ? 'w-24 h-24 border-amber-500/30' : 'w-32 h-32 border-emerald-500/20'} mx-auto rounded-full overflow-hidden border-2 mb-4 bg-emerald-900/20 relative group-hover:scale-105 transition-transform duration-300`}>
                        <img 
                          src={speaker.image_url || "/placeholder-user.jpg"} 
                          alt={speaker.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; 
                          }}
                        />
                      </div>
                      <h3 className={`text-white font-bold ${isVIP ? 'text-sm' : 'text-base'}`}>{speaker.name}</h3>
                      <p className={`${isVIP ? 'text-amber-400/80' : 'text-emerald-400'} text-xs font-semibold mb-0.5`}>{speaker.role || 'Keynote Speaker'}</p>
                      <p className="text-emerald-200/50 text-xs">{speaker.title}</p>
                      {!isVIP && <p className="text-emerald-200/30 text-[10px] mt-1">{speaker.company}</p>}
                    </div>
                  )
                })}
              </motion.div>
            </>
          ) : (
            <div className="text-center text-emerald-200/40 py-12">Loading Speakers...</div>
          )}
        </div>
      </section>

      {/* ========== PARTNERS SECTION ========== */}
      <SectionSeparator />
      <section className="py-20 bg-[#064e3b]/20">
        <div className="container mx-auto px-4 max-w-7xl text-center">
          <p className="text-emerald-200/40 text-sm uppercase tracking-widest mb-10">Our Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
            <img src="/Eventocity.png" alt="Eventocity" className="h-16 md:h-20 w-auto object-contain" />
            <img src="/ex.png" alt="Experience" className="h-16 md:h-20 w-auto object-contain" />
          </div>
        </div>
      </section>
      
      <SectionSeparator />
      <SponsorshipSection />
      
      <SectionSeparator />
      <FaqSection />
      
      <SectionSeparator />
      <Footer />

    </main>
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
      tickets: "10 تذاكر",
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
                whileHover={{ y: -10 }}
                className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 group cursor-pointer"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="p-8 text-center relative z-10">
                  <h3 className={`text-2xl font-bold bg-gradient-to-r ${plan.color} bg-clip-text text-transparent mb-2`}>
                    {plan.name}
                  </h3>
                  <div className="my-6 py-4 border-y border-white/10">
                    <span className="text-3xl font-bold text-white block">{plan.price}</span>
                    <span className="text-emerald-200/50 text-sm">EGP</span>
                  </div>
                  <div className="inline-block px-4 py-1 rounded-full bg-white/10 text-white text-sm mb-6">
                    {plan.tickets}
                  </div>
                  <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white border-0 rounded-lg transition-colors">
                    View Details
                  </button>
                </div>
              </motion.div>
            ))}
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
                      onClick={() => window.open(`https://wa.me/201505822735?text=${encodeURIComponent(`Hello, I am interested in the ${activePlan.name} sponsorship package for Ramadan Majlis.`)}`, '_blank')}
                      className="w-full flex items-center justify-center h-12 text-lg bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl transition-colors"
                    >
                      <Phone className="w-5 h-5 ml-2" />
                      Contact via WhatsApp
                    </button>

                    <button
                      onClick={() => window.location.href = `mailto:contact@nextacademyedu.com?subject=${encodeURIComponent(`Sponsorship Inquiry - ${activePlan.name} Package`)}`}
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
