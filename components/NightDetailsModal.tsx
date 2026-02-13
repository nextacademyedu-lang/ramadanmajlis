import { useRef } from "react";
import { motion } from "framer-motion";
import { X, Calendar, Clock, MapPin, User, Star, Utensils, Users, Mic2, Moon, ArrowDown } from "lucide-react";

interface NightDetailsModalProps {
    night: any;
    speakers: any[];
    onClose: () => void;
}

export default function NightDetailsModal({ night, speakers, onClose }: NightDetailsModalProps) {
    const agendaRef = useRef<HTMLDivElement>(null);
    
    // Filter speakers for this night
    const nightSpeakers = speakers.filter(s => s.night_id === night.id);

    // Contextual Icon Helper
    const getAgendaIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes('suhoor') || lowerTitle.includes('dinner') || lowerTitle.includes('iftar')) return <Utensils className="w-5 h-5 text-amber-500" />;
        if (lowerTitle.includes('networking')) return <Users className="w-5 h-5 text-blue-400" />;
        if (lowerTitle.includes('panel') || lowerTitle.includes('talk') || lowerTitle.includes('session')) return <Mic2 className="w-5 h-5 text-emerald-400" />;
        if (lowerTitle.includes('closing')) return <Moon className="w-5 h-5 text-purple-400" />;
        return <Clock className="w-5 h-5 text-emerald-600" />;
    };

    // Sorting helper
    const sortAgendaItems = (items: any[]) => {
        return [...items].sort((a, b) => {
            if (!a.time) return 1;
            if (!b.time) return -1;
            const getMinutes = (timeStr: string) => {
                const [h, m] = timeStr.includes(':') ? timeStr.split(':').map(Number) : [0, 0];
                if (isNaN(h)) return 0;
                const adjustedH = h < 10 ? h + 24 : h;
                return adjustedH * 60 + (m || 0);
            };
            return getMinutes(a.time) - getMinutes(b.time);
        });
    };

    // Time formatting helper
    const formatTime = (timeStr: string) => {
        if (!timeStr) return "";
        if (timeStr.includes('M')) return timeStr; // Legacy handling
        const [h, m] = timeStr.split(':').map(Number);
        if (isNaN(h)) return timeStr;
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const scrollToAgenda = () => {
        agendaRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const sortedAgenda = night.agenda ? sortAgendaItems(night.agenda) : [];

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
                <div className="p-4 sm:p-8 pb-0">
                    <div className="flex justify-between items-start gap-3 mb-1">
                        <h2 className="text-xl sm:text-3xl font-bold text-white leading-tight font-serif">{night.title}</h2>
                        <div className="shrink-0 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
                             {new Date(night.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                        </div>
                    </div>
                    <p className="text-emerald-100/60 text-xs sm:text-base">{night.subtitle}</p>

                    {/* Scroll to Agenda Button */}
                    {sortedAgenda.length > 0 && (
                        <div className="flex justify-center mt-3 sm:mt-6">
                            <button 
                                onClick={scrollToAgenda}
                                className="group relative px-4 py-1.5 sm:px-6 sm:py-2 bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 flex items-center gap-1.5 sm:gap-2 animate-pulse hover:animate-none hover:scale-105"
                            >
                                <span className="uppercase tracking-wider text-[10px] sm:text-xs">Explore Night Agenda</span>
                                <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-y-1 transition-transform" />
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 scrollbar-hide">
                    
                    {/* Description */}
                    <div className="text-emerald-100/80 leading-relaxed text-sm sm:text-base bg-white/5 p-4 rounded-xl border border-white/5">
                        {night.description}
                    </div>

                    {/* Panel Details */}
                    {(night.panel_title || night.panel_description) && (
                        <div className="bg-gradient-to-br from-emerald-900/40 to-black p-4 rounded-xl border border-emerald-500/20">
                            {night.panel_title && (
                                <h3 className="text-xl font-bold text-amber-400 mb-2 font-serif">{night.panel_title}</h3>
                            )}
                            {night.panel_description && (
                                <p className="text-emerald-100/70 text-sm leading-relaxed">{night.panel_description}</p>
                            )}
                        </div>
                    )}

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
                                                {speaker.speaker_topic && (
                                                    <div className="text-amber-400/80 text-xs mt-1 font-medium line-clamp-2">
                                                        "{speaker.speaker_topic}"
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Agenda */}
                    {sortedAgenda.length > 0 && (
                         <div ref={agendaRef} className="scroll-mt-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Clock className="text-emerald-400 w-5 h-5" />
                                Night Agenda
                            </h3>
                            <div className="space-y-0 relative">
                                {/* Vertical Line */}
                                <div className="absolute left-[20px] top-4 bottom-4 w-px bg-white/10" />

                                {sortedAgenda.map((item: any, idx: number) => {
                                    let linkedSpeakers: any[] = [];
                                    if (item.speaker_ids && Array.isArray(item.speaker_ids)) {
                                        linkedSpeakers = item.speaker_ids.map((id: string) => speakers.find((s: any) => s.id === id)).filter(Boolean);
                                    } else if (item.speaker_id) {
                                        const s = speakers.find((s: any) => s.id === item.speaker_id);
                                        if (s) linkedSpeakers = [s];
                                    }

                                    return (
                                        <div key={idx} className="flex gap-4 relative pb-10 last:pb-0">
                                            {/* Icon Bubble */}
                                            <div className="relative z-10 w-10 h-10 rounded-full bg-[#031d16] border-2 border-emerald-500 flex items-center justify-center shrink-0">
                                                {getAgendaIcon(item.title)}
                                            </div>
                                            
                                            <div className="flex-1 pt-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 mb-2">
                                                    <span className="text-amber-400 font-mono text-sm font-bold shrink-0">
                                                        {formatTime(item.time)}
                                                        {item.end_time && ` - ${formatTime(item.end_time)}`}
                                                    </span>
                                                    <h4 className="text-white font-bold text-lg leading-tight">{item.title}</h4>
                                                </div>

                                                {/* Large Speaker Display */}
                                                {linkedSpeakers.length > 0 && (
                                                    <div className="flex flex-wrap gap-4 mt-3 mb-3">
                                                        {linkedSpeakers.map((speaker, sIdx) => {
                                                            const customRole = item.speaker_roles?.[speaker.id];
                                                            return (
                                                                <div key={sIdx} className="flex items-center gap-3 bg-white/5 pr-4 rounded-full border border-white/10">
                                                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-emerald-500/30">
                                                                        <img
                                                                            src={speaker.image_url || "/placeholder-user.jpg"}
                                                                            alt={speaker.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; }}
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-white text-sm">{speaker.name}</div>
                                                                        {customRole && (
                                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-medium uppercase tracking-wider block w-fit mt-1 ${
                                                                                customRole === 'Moderator' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                                                customRole === 'Host' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
                                                                                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                                                            }`}>
                                                                                {customRole}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}

                                                {item.description && (
                                                    <div className="text-emerald-100/60 text-sm leading-relaxed bg-black/20 p-3 rounded-lg border-l-2 border-emerald-500/30">
                                                        {item.description}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
