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
                className="w-full max-w-2xl bg-[#031d16] border border-emerald-500/20 rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-colors z-20"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="p-6 sm:p-8 pb-0">
                    <div className="flex justify-between items-start gap-4 mb-2">
                        <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">{night.title}</h2>
                        <div className="shrink-0 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                             {new Date(night.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                    <p className="text-emerald-100/60 text-sm sm:text-base">{night.subtitle}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide">
                    
                    {/* Description */}
                    <div className="text-emerald-100/80 leading-relaxed text-sm sm:text-base bg-white/5 p-4 rounded-xl border border-white/5">
                        {night.description}
                    </div>

                    {/* Speakers Grouped by Role */}
                    {['Keynote Speaker', 'Panel Speaker', 'Host', 'Moderator', 'VIP Guest'].map(role => {
                        const roleSpeakers = nightSpeakers.filter(s => (s.role || 'Keynote Speaker') === role);
                        if (roleSpeakers.length === 0) return null;
                        
                        return (
                            <div key={role}>
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <User className="text-amber-400 w-5 h-5" />
                                    {role === 'Keynote Speaker' ? 'Keynote Speakers' : role === 'VIP Guest' ? 'VIP Guests' : `${role}s`}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {roleSpeakers.map((speaker, idx) => (
                                        <div key={idx} className="flex items-center gap-4 bg-[#0a2720] p-4 rounded-2xl border border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-emerald-500/20">
                                                <img 
                                                    src={speaker.image_url || "/placeholder-user.jpg"} 
                                                    alt={speaker.name} 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; }}
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-white text-base truncate">{speaker.name}</div>
                                                <div className="text-emerald-200/50 text-xs truncate">{speaker.title}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Agenda */}
                    {night.agenda && night.agenda.length > 0 && (
                         <div>
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="text-emerald-400 w-5 h-5" />
                                Night Agenda
                            </h3>
                            <div className="space-y-0 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[7px] top-2 bottom-4 w-px bg-white/10" />

                                {night.agenda.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 relative pb-8 last:pb-0">
                                        <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[#031d16] border-2 border-emerald-500 z-10" />
                                        <div className="pl-4">
                                            <span className="text-amber-400 font-mono text-sm font-bold block mb-1">{item.time}</span>
                                            <div className="text-white font-bold text-base">{item.title}</div>
                                            {item.description && <div className="text-emerald-100/50 text-sm mt-1 leading-relaxed">{item.description}</div>}
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
