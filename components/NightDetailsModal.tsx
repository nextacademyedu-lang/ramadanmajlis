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
                <div className={`h-32 bg-gradient-to-r ${night.color_theme === 'blue' ? 'from-blue-900 to-slate-900' : night.color_theme === 'amber' ? 'from-amber-900 to-orange-900' : 'from-emerald-900 to-teal-900'} relative p-6 flex flex-col justify-end`}>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-end justify-between">
                         <div>
                            <h2 className="text-3xl font-bold text-white mb-1">{night.title}</h2>
                            <p className="text-white/60 text-sm">{night.subtitle}</p>
                         </div>
                         <div className={`px-4 py-1 rounded-full text-xs font-bold border bg-black/20 ${night.color_theme === 'blue' ? 'border-blue-400 text-blue-400' : night.color_theme === 'amber' ? 'border-amber-400 text-amber-400' : 'border-emerald-400 text-emerald-400'}`}>
                             {new Date(night.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                         </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                    
                    {/* Description */}
                    <div className="text-emerald-100/80 leading-relaxed text-lg">
                        {night.description}
                    </div>

                    {/* Speakers */}
                    {nightSpeakers.length > 0 && (
                         <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <User className="text-amber-400" size={20} />
                                Keynote Speakers
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {nightSpeakers.map((speaker, idx) => (
                                    <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                                        <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-emerald-500/20">
                                            <img 
                                                src={speaker.image_url || "/placeholder-user.jpg"} 
                                                alt={speaker.name} 
                                                className="w-full h-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; }}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm">{speaker.name}</div>
                                            <div className="text-emerald-200/50 text-xs">{speaker.title}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Agenda (If Exists) */}
                    {night.agenda && night.agenda.length > 0 && (
                         <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="text-emerald-400" size={20} />
                                Night Agenda
                            </h3>
                            <div className="space-y-4">
                                {night.agenda.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-4 relative pl-6 border-l border-white/10 pb-4 last:border-0 last:pb-0">
                                        <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#0a201b]" />
                                        <span className="text-amber-400 font-mono text-sm whitespace-nowrap pt-0.5">{item.time}</span>
                                        <div>
                                            <div className="text-white font-medium">{item.title}</div>
                                            {item.description && <div className="text-xs text-white/50 mt-1">{item.description}</div>}
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
