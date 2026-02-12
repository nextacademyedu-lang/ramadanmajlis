"use client";

import { motion } from "framer-motion";
import { X, Calendar, Clock, MapPin, User, Star } from "lucide-react";

interface NightDetailsModalProps {
    night: any;
    speakers: any[];
    onClose: () => void;
}

export default function NightDetailsModal({ night, speakers, onClose }: NightDetailsModalProps) {
    // Filter speakers for this night
    const nightSpeakers = speakers.filter(s => s.night_id === night.id);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
                layoutId={`night-${night.id}`}
                className={`w-full max-w-2xl bg-[#0a201b] border ${night.color_theme === 'blue' ? 'border-blue-500/30' : night.color_theme === 'amber' ? 'border-amber-500/30' : 'border-emerald-500/50'} rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]`}
            >
                {/* Header Image / Gradient */}
                <div className={`shrink-0 h-28 sm:h-32 bg-gradient-to-r ${night.color_theme === 'blue' ? 'from-blue-900 to-slate-900' : night.color_theme === 'amber' ? 'from-amber-900 to-orange-900' : 'from-emerald-900 to-teal-900'} relative p-4 sm:p-6 flex flex-col justify-end`}>
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors z-20"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-end justify-between gap-2">
                         <div>
                            <h2 className="text-xl sm:text-3xl font-bold text-white mb-1 leading-tight">{night.title}</h2>
                            <p className="text-white/60 text-xs sm:text-sm line-clamp-1">{night.subtitle}</p>
                         </div>
                         <div className={`shrink-0 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border bg-black/20 ${night.color_theme === 'blue' ? 'border-blue-400 text-blue-400' : night.color_theme === 'amber' ? 'border-amber-400 text-amber-400' : 'border-emerald-400 text-emerald-400'}`}>
                             {new Date(night.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 sm:space-y-8 scrollbar-hide">
                    
                    {/* Description */}
                    <div className="text-emerald-100/80 leading-relaxed text-sm sm:text-lg">
                        {night.description}
                    </div>

                    {/* Speakers Grouped by Role */}
                    {['Host', 'Keynote Speaker', 'Moderator', 'Panel Speaker'].map(role => {
                        const roleSpeakers = nightSpeakers.filter(s => (s.role || 'Keynote Speaker') === role);
                        if (roleSpeakers.length === 0) return null;
                        
                        return (
                            <div key={role} className="mb-6 sm:mb-8 last:mb-0">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                    <User className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5" />
                                    {role === 'Keynote Speaker' ? 'Keynote Speakers' : `${role}s`}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                    {roleSpeakers.map((speaker, idx) => (
                                        <div key={idx} className="flex items-center gap-3 sm:gap-4 bg-white/5 p-2 sm:p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-emerald-500/20">
                                                <img 
                                                    src={speaker.image_url || "/placeholder-user.jpg"} 
                                                    alt={speaker.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white text-sm truncate">{speaker.name}</div>
                                                <div className="text-emerald-200/50 text-[10px] sm:text-xs truncate">{speaker.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Agenda (If Exists) */}
                    {night.agenda && night.agenda.length > 0 && (
                         <div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                                <Clock className="text-emerald-400 w-4 h-4 sm:w-5 sm:h-5" />
                                Night Agenda
                            </h3>
                            <div className="space-y-4">
                                {night.agenda.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-3 sm:gap-4 relative pl-4 sm:pl-6 border-l border-white/10 pb-4 last:border-0 last:pb-0">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0a201b]" />
                                        <span className="text-amber-400 font-mono text-xs sm:text-sm whitespace-nowrap pt-0.5">{item.time}</span>
                                        <div>
                                            <div className="text-white font-medium text-sm sm:text-base">{item.title}</div>
                                            {item.description && <div className="text-[10px] sm:text-xs text-white/50 mt-1 leading-relaxed">{item.description}</div>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </motion.div>
        </div>
    );
}
