"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles } from "lucide-react";

const PRIZES = [
    { label: "20%", value: 20, weight: 35, codes: ['RM26-20X9', 'RM26-20K4', 'RM26-20M1'] },
    { label: "40%", value: 40, weight: 25, codes: ['RM26-40B7', 'RM26-40D2', 'RM26-40R8'] },
    { label: "50%", value: 50, weight: 20, codes: ['RM26-50V3', 'RM26-50L6', 'RM26-50C9'] },
    { label: "60%", value: 60, weight: 10, codes: ['RM26-60N5', 'RM26-60F2', 'RM26-60W7'] },
    { label: "70%", value: 70, weight: 5, codes: ['RM26-70T4', 'RM26-70P8', 'RM26-70H1'] },
    { label: "80%", value: 80, weight: 3, codes: ['RM26-80S6', 'RM26-80Y3', 'RM26-80E9'] },
    { label: "90%", value: 90, weight: 1.5, codes: ['RM26-90J2', 'RM26-90A5', 'RM26-90G8'] },
    { label: "100%", value: 100, weight: 0.5, codes: ['RM26-MAX100', 'RM26-FREE100'] },
];

export default function RoulettePopup() {
    const [showPopup, setShowPopup] = useState(false);
    const [isSpinning, setIsSpinning] = useState(false);
    const [hasSpun, setHasSpun] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [wonPrize, setWonPrize] = useState<any>(null);
    const [wonCode, setWonCode] = useState<string | null>(null);

    useEffect(() => {
        // Check local storage and cookie for previous spin
        const spunBefore = localStorage.getItem('has_spun_roulette');
        const cookieSpun = document.cookie.includes('has_spun_roulette=true');

        if (spunBefore || cookieSpun) {
            setHasSpun(true);
            return;
        }

        const t = setTimeout(() => {
            setShowPopup(true);
        }, 3000);

        return () => clearTimeout(t);
    }, []);

    const spin = async () => {
        if (isSpinning || hasSpun) return;
        setIsSpinning(true);

        try {
            const res = await fetch('/api/roulette/spin', { method: 'POST' });
            const data = await res.json();

            if (!data.success) {
                setIsSpinning(false);
                return;
            }

            const { prizeIndex, prize, code } = data;
            const sliceAngle = 360 / PRIZES.length;

            // Target the center of the slice (start angle + half slice)
            const targetAngle = prizeIndex * sliceAngle + sliceAngle / 2;
            const extraRotations = 5 * 360;

            // Add a random offset within the safe bounds of the slice (10 degrees margin total)
            const offset = (Math.random() - 0.5) * (sliceAngle - 10);

            // Since the wheel pointer is at 0 degrees, finding the slice offset requires
            // rotating it backwards by targetAngle and the offset.
            const newRotation = rotation + extraRotations - targetAngle - offset;

            setRotation(newRotation);

            setTimeout(() => {
                setIsSpinning(false);
                setHasSpun(true);
                setWonPrize(prize);
                setWonCode(code);

                // Dispatch global event so BookingForm can auto-apply it
                const event = new CustomEvent('roulette-win', { detail: { code } });
                window.dispatchEvent(event);

                // Save state
                localStorage.setItem('has_spun_roulette', 'true');
                document.cookie = "has_spun_roulette=true; max-age=31536000; path=/";
            }, 5000); // 5 seconds spin duration
        } catch (error) {
            console.error('Spin failed:', error);
            setIsSpinning(false);
        }
    };

    const close = () => {
        setShowPopup(false);
        if (!hasSpun) {
            // If they close without spinning, maybe they can't spin again to prevent annoyance?
            // Or let them spin next time. Let's let them spin next time.
            // For now, we only block if they actually spun.
        }
    };

    if (!showPopup) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-linear-to-br from-[#0a201b] to-[#022c22] border border-amber-500/30 rounded-3xl p-6 md:p-8 text-center shadow-2xl overflow-hidden"
                >
                    {/* Close Button */}
                    {!isSpinning && !wonPrize && (
                        <button onClick={close} className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors z-10">
                            <X className="w-5 h-5 text-white/50 hover:text-white" />
                        </button>
                    )}

                    {!wonPrize ? (
                        <>
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-4">
                                    <Gift className="w-8 h-8 text-amber-400" />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 font-serif">Spin & Win!</h3>
                                <p className="text-emerald-200/70 text-sm">Spin the wheel for a chance to get up to 100% OFF your ticket.</p>
                            </div>

                            {/* Roulette Wheel */}
                            <div className="relative w-64 h-64 md:w-72 md:h-72 mx-auto mb-8">
                                {/* Pointer */}
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-0 h-0 border-l-15 border-l-transparent border-r-15 border-r-transparent border-t-25 border-t-amber-400 z-20 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />

                                {/* Wheel Container */}
                                <div className="w-full h-full rounded-full border-4 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.2)] overflow-hidden relative bg-[#0a201b]">
                                    <motion.div
                                        className="w-full h-full relative"
                                        animate={{ rotate: rotation }}
                                        transition={{ duration: 5, ease: [0.2, 0.8, 0.2, 1] }} // smooth deceleration
                                    >
                                        {PRIZES.map((prize, index) => {
                                            const sliceAngle = 360 / PRIZES.length;
                                            const rotationAngle = index * sliceAngle;
                                            const isAlternate = index % 2 === 0;

                                            return (
                                                <div
                                                    key={index}
                                                    className="absolute w-[50%] h-[50%] origin-bottom-right"
                                                    style={{
                                                        top: 0,
                                                        left: 0,
                                                        transform: `rotate(${rotationAngle}deg)`,
                                                        // A simple way to draw slices using clip-path or simply rotating boxes inside a rounded overflow hidden
                                                        // This is a simplified CSS trick for pie slices
                                                    }}
                                                >
                                                    <div
                                                        className="w-[200%] h-[200%] origin-center absolute flex items-center justify-center pt-8 pb-32"
                                                        style={{
                                                            left: '-100%',
                                                            transform: `rotate(${sliceAngle / 2}deg)`,
                                                            background: isAlternate ? 'linear-gradient(45deg, #059669, #047857)' : 'linear-gradient(45deg, #d97706, #b45309)',
                                                            clipPath: `polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)` // Requires more math for exact slices, let's use a simpler SVG approach 
                                                        }}
                                                    >

                                                    </div>
                                                </div>
                                            )
                                        })}

                                        {/* Render Slices as SVG for cleaner look */}
                                        <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 transform -rotate-90">
                                            {PRIZES.map((prize, index) => {
                                                const sliceAngle = 360 / PRIZES.length;
                                                const startAngle = index * sliceAngle;
                                                const endAngle = (index + 1) * sliceAngle;

                                                // Path math
                                                const x1 = 50 + 50 * Math.cos(Math.PI * startAngle / 180);
                                                const y1 = 50 + 50 * Math.sin(Math.PI * startAngle / 180);
                                                const x2 = 50 + 50 * Math.cos(Math.PI * endAngle / 180);
                                                const y2 = 50 + 50 * Math.sin(Math.PI * endAngle / 180);

                                                const largeArcFlag = sliceAngle > 180 ? 1 : 0;
                                                const pathData = [
                                                    `M 50 50`,
                                                    `L ${x1} ${y1}`,
                                                    `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                    `Z`
                                                ].join(' ');

                                                return (
                                                    <g key={index}>
                                                        <path
                                                            d={pathData}
                                                            fill={index % 2 === 0 ? '#065f46' : '#b45309'} // emerald-800 vs amber-700
                                                            stroke="rgba(255,255,255,0.1)"
                                                            strokeWidth="0.5"
                                                        />
                                                        {/* Text positioning requires calculating center of slice */}
                                                        <text
                                                            x={50 + 35 * Math.cos(Math.PI * (startAngle + sliceAngle / 2) / 180)}
                                                            y={50 + 35 * Math.sin(Math.PI * (startAngle + sliceAngle / 2) / 180)}
                                                            fill="white"
                                                            fontSize="6"
                                                            fontWeight="bold"
                                                            textAnchor="middle"
                                                            dominantBaseline="middle"
                                                            transform={`rotate(${startAngle + sliceAngle / 2 + 90}, ${50 + 35 * Math.cos(Math.PI * (startAngle + sliceAngle / 2) / 180)}, ${50 + 35 * Math.sin(Math.PI * (startAngle + sliceAngle / 2) / 180)})`}
                                                        >
                                                            {prize.label}
                                                        </text>
                                                    </g>
                                                )
                                            })}
                                        </svg>
                                        {/* Center Dot */}
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-900 rounded-full border-4 border-amber-500 z-10 shadow-inner flex items-center justify-center">
                                            <Sparkles className="w-4 h-4 text-amber-400" />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            <button
                                onClick={spin}
                                disabled={isSpinning || hasSpun}
                                className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:shadow-[0_0_30px_rgba(251,191,36,0.5)] active:scale-95 text-lg"
                            >
                                {isSpinning ? "Spinning..." : "SPIN NOW"}
                            </button>
                            <p className="text-xs text-white/30 mt-4 text-center">Only one spin allowed per user.</p>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-4"
                        >
                            <div className="text-6xl mb-4 text-center">🎉</div>
                            <h3 className="text-2xl font-bold text-white mb-2 font-serif">Congratulations!</h3>
                            <p className="text-emerald-200/80 mb-6 text-lg">You won <span className="text-amber-400 font-bold text-2xl">{wonPrize.label} OFF</span> your ticket!</p>

                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-6">
                                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Your Exclusive Promo Code</p>
                                <div
                                    onClick={() => navigator.clipboard?.writeText(wonCode || '')}
                                    className="cursor-pointer bg-amber-400/10 border-2 border-dashed border-amber-400/60 rounded-xl py-4 px-6 group hover:bg-amber-400/20 transition-all relative overflow-hidden"
                                >
                                    <div className="text-3xl font-bold font-mono text-amber-400 tracking-wider">{wonCode}</div>
                                    <div className="text-xs text-amber-400/60 mt-2 group-hover:text-amber-400 transition-colors">Click to copy</div>

                                    {/* Shine effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-linear-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl transition-all shadow-lg text-lg"
                            >
                                Claim Discount Now
                            </button>
                        </motion.div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
