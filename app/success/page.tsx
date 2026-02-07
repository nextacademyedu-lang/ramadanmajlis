"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Calendar, MapPin, User, Star, ArrowLeft, Download, Share2 } from "lucide-react";
import Link from "next/link";

interface BookingData {
    name: string;
    title: string;
    company: string;
    date: string;
    night: string;
    location: string;
    photo: string;
}

export default function SuccessPage() {
    const [bookingData, setBookingData] = useState<BookingData>({
        name: 'Guest',
        title: 'Entrepreneur',
        company: '',
        date: 'Ramadan 2026',
        night: 'Ramadan Majlis',
        location: 'Creativa Innovation Hub',
        photo: ''
    });

    const [copied, setCopied] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    useEffect(() => {
        // Load booking data from localStorage
        const data: BookingData = {
            name: localStorage.getItem('booking_name') || 'Guest',
            title: localStorage.getItem('booking_title') || 'Entrepreneur',
            company: localStorage.getItem('booking_company') || '',
            date: localStorage.getItem('booking_date') || 'Ramadan 2026',
            night: localStorage.getItem('booking_night_title') || 'Ramadan Majlis',
            location: localStorage.getItem('booking_location') || 'Creativa Innovation Hub',
            photo: localStorage.getItem('booking_photo') || '',
        };
        setBookingData(data);
        
        // Auto-scroll to share section
        setTimeout(() => {
            document.getElementById('share-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 1000);
    }, []);

    // Generate the shareable poster URL
    const posterUrl = useMemo(() => {
        const params = new URLSearchParams();
        params.set('name', bookingData.name);
        params.set('title', bookingData.title);
        params.set('company', bookingData.company);
        params.set('night', bookingData.night);
        params.set('location', bookingData.location);
        if (bookingData.photo) {
            params.set('photo', bookingData.photo);
        }
        return `/api/og/social-share?${params.toString()}`;
    }, [bookingData]);

    const shareText = `Officially registered for Ramadan Majlis 2026! 🌙

Three transformative Thursday nights with 12 world-class experts, strategic networking over premium Suhoor, and hands-on learning circles.

📍 Night 1: Tolip Hotel, New Cairo | 🗓 Feb 26 – The Compass
📍 Night 2: Hyatt Regency, 6th October | 🗓 Mar 5 – The Resilience
📍 Night 3: Pyramids Hotel, Dokki | 🗓 Mar 12 – The Legacy

Register: https://ramadanmajlis.nextacademyedu.com/

https://www.facebook.com/profile.php?id=61575666404676
https://www.facebook.com/Eventocity1

#RamadanMajlis2026 #TheMajlis #NextAcademy`;

    const handleCopyText = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleShareLinkedIn = () => {
        const shareUrl = `https://ramadanmajlis.nextacademyedu.com/`;
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=600'
        );
    };

    const handleShareFacebook = () => {
        const shareUrl = `https://ramadanmajlis.nextacademyedu.com/`;
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
            '_blank',
            'width=600,height=600'
        );
    };

    const handleShareTwitter = () => {
        const tweetText = `Officially registered for Ramadan Majlis 2026! 🌙 Three transformative nights with world-class experts. Join me! https://ramadanmajlis.nextacademyedu.com/ #RamadanMajlis2026`;
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
            '_blank',
            'width=600,height=400'
        );
    };

    const handleShareWhatsApp = () => {
        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            '_blank'
        );
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-[#064e3b] via-[#065f46] to-[#022c22] relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 py-12 relative z-10">
                {/* Back Button */}
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-emerald-300 hover:text-white transition-colors mb-8"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Home</span>
                </Link>

                <div className="max-w-4xl mx-auto">
                    {/* Success Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <div className="w-24 h-24 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-emerald-500/40">
                            <CheckCircle className="w-14 h-14 text-emerald-400" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Booking Confirmed! 🎉
                        </h1>
                        <p className="text-xl text-emerald-200/80">
                            We can&apos;t wait to see you at Ramadan Majlis 2026
                        </p>
                    </motion.div>

                    {/* Share Poster Section - Priority First */}
                    <motion.div
                        id="share-section"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="bg-[#0a201b]/80 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-6 md:p-8 mb-8"
                    >
                        {/* 10% Discount Banner */}
                        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl p-4 mb-6">
                            <p className="text-amber-200 font-semibold text-center flex items-center justify-center gap-2 flex-wrap">
                                <Star className="w-5 h-5 text-amber-400" />
                                Share on social media to unlock <span className="text-amber-400 font-bold">10% OFF</span> your next booking!
                            </p>
                        </div>

                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Share2 className="w-5 h-5 text-emerald-400" />
                            Share Your Attendance
                        </h2>

                        {/* Poster Preview with Loading State */}
                        <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden border border-emerald-500/30 mb-6 bg-[#064e3b] shadow-2xl">
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-[#064e3b] z-10">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                        <p className="text-emerald-200/60 text-sm animate-pulse">Generating your personalized ticket...</p>
                                    </div>
                                </div>
                            )}
                            <img
                                src={posterUrl}
                                alt="Share Poster"
                                className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                                onLoad={() => setImageLoading(false)}
                            />
                        </div>

                        {/* Caption Text Area */}
                        <div className="mb-6 space-y-2">
                            <label className="text-sm text-emerald-200/60 font-medium ml-1">Caption Text</label>
                            <div className="relative">
                                <textarea
                                    readOnly
                                    value={shareText}
                                    className="w-full h-32 bg-black/30 border border-emerald-500/20 rounded-xl p-4 text-emerald-100/80 text-sm resize-none focus:outline-none focus:border-emerald-500/50"
                                />
                                <button
                                    onClick={handleCopyText}
                                    className="absolute top-2 right-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg flex items-center gap-1.5"
                                >
                                    {copied ? <CheckCircle size={14} /> : <Share2 size={14} />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        {/* Download Poster Button */}
                        <a
                            href={posterUrl}
                            download={`ramadan-majlis-${bookingData.name.replace(/\s+/g, '-').toLowerCase()}.png`}
                            target="_blank"
                            className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-bold rounded-xl mb-8 hover:from-emerald-500 hover:to-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Download className="w-5 h-5" />
                            Download Poster Image
                        </a>

                        {/* Share Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <button
                                onClick={handleShareLinkedIn}
                                className="flex items-center justify-center gap-2 bg-[#0077b5] hover:bg-[#006399] text-white py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                </svg>
                                LinkedIn
                            </button>

                            <button
                                onClick={handleShareFacebook}
                                className="flex items-center justify-center gap-2 bg-[#1877f2] hover:bg-[#166fe5] text-white py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </button>

                            <button
                                onClick={handleShareTwitter}
                                className="flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                                Twitter
                            </button>

                            <button
                                onClick={handleShareWhatsApp}
                                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white py-3 rounded-xl font-semibold transition-all hover:scale-105 shadow-lg"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                                WhatsApp
                            </button>
                        </div>
                    </motion.div>

                    {/* Booking Details Card - Moved Below */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-[#0a201b]/80 backdrop-blur-sm border border-emerald-500/20 rounded-3xl p-8 mb-8"
                    >
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-emerald-400" />
                            Your Booking Details
                        </h2>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-200/60 mb-1">Name</p>
                                    <p className="text-white font-medium">{bookingData.name}</p>
                                    {bookingData.title && (
                                        <p className="text-emerald-200/60 text-sm">{bookingData.title}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                    <Star className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-200/60 mb-1">Night</p>
                                    <p className="text-white font-medium">{bookingData.night}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-200/60 mb-1">Location</p>
                                    <p className="text-white font-medium">{bookingData.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-200/60 mb-1">Date</p>
                                    <p className="text-white font-medium">{bookingData.date}</p>
                                </div>
                            </div>
                        </div>

                        {/* Email Notice */}
                        <div className="mt-8 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                            <p className="text-emerald-200 text-center">
                                📧 <strong>Your ticket has been sent to your email!</strong>
                                <br />
                                <span className="text-sm text-emerald-200/70">Please check your inbox (and spam folder) for confirmation</span>
                            </p>
                        </div>
                    </motion.div>

                    {/* Back to Home */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="text-center"
                    >
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-emerald-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Home
                        </Link>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
