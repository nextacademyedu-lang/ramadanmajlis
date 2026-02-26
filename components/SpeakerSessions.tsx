import { Mic2 } from "lucide-react";
import { motion } from "framer-motion";

interface Speaker {
    id: string;
    name: string;
    title: string;
    role: string;
    company?: string;
    image_url: string | null;
    speaker_topic?: string;
    night_id?: string;
    panel_key?: string;
}

interface SpeakerSessionsProps {
    speakers: Speaker[];
    nights?: any[];
    title?: string;
}

const PANEL_LABELS: Record<string, string> = {
    compass: "Compass Panel",
    resilience: "Resilience Panel",
    ai: "AI & Innovation Panel",
    legacy: "Legacy Panel",
    mega: "Mega Panel",
};

export default function SpeakerSessions({ speakers, title = "Elite Speakers" }: SpeakerSessionsProps) {
    if (speakers.length === 0) return null;

    // Group by panel_key
    const panelOrder = ["compass", "resilience", "ai", "legacy", "mega"];
    const grouped = panelOrder
        .map(key => ({ key, label: PANEL_LABELS[key], speakers: speakers.filter(s => s.panel_key === key) }))
        .filter(g => g.speakers.length > 0);

    const ungrouped = speakers.filter(s => !s.panel_key || !panelOrder.includes(s.panel_key));

    const renderCard = (speaker: Speaker, idx: number = 0) => (
        <motion.div
            key={speaker.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.08 }}
            className="group bg-white/5 border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 flex flex-col"
        >
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 md:gap-4 mb-3 text-center md:text-left">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-emerald-500/20 group-hover:border-emerald-500 transition-colors shrink-0">
                    <img
                        src={speaker.image_url || "/placeholder-user.jpg"}
                        alt={speaker.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-user.jpg"; }}
                    />
                </div>
                <div>
                    <h3 className="text-white font-bold text-xs md:text-sm leading-tight line-clamp-1">{speaker.name}</h3>
                    <p className="text-emerald-200/60 text-[9px] md:text-[11px] mt-0.5 line-clamp-2">{speaker.title}</p>
                </div>
            </div>

            <div className="flex-1 text-center md:text-left">
                {speaker.speaker_topic ? (
                    <>
                        <div className="inline-flex items-center gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] md:text-xs font-medium mb-2 border border-emerald-500/20">
                            <Mic2 className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span>Topic</span>
                        </div>
                        <h4 className="text-xs md:text-sm font-serif text-white/90 font-medium italic leading-snug line-clamp-2">
                            &quot;{speaker.speaker_topic}&quot;
                        </h4>
                    </>
                ) : (
                    <p className="text-emerald-100/50 text-[10px] md:text-xs leading-snug italic line-clamp-2">
                        {speaker.company || "Industry Leader"}
                    </p>
                )}
            </div>
        </motion.div>
    );

    return (
        <section className="py-24 relative overflow-hidden bg-[#022c22]">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 max-w-7xl relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title}</h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent mx-auto rounded-full opacity-50" />
                </div>

                <div className="space-y-16">
                    {grouped.map(({ key, label, speakers: panelSpeakers }) => (
                        <div key={key}>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="h-px bg-white/10 flex-1" />
                                <h3 className="text-xl md:text-2xl font-bold text-amber-400 font-serif px-4">{label}</h3>
                                <div className="h-px bg-white/10 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                {panelSpeakers.map((s, i) => renderCard(s, i))}
                            </div>
                        </div>
                    ))}

                    {ungrouped.length > 0 && (
                        <div>
                            {grouped.length > 0 && (
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="h-px bg-white/10 flex-1" />
                                    <h3 className="text-xl font-bold text-emerald-200/50 font-serif px-4">General</h3>
                                    <div className="h-px bg-white/10 flex-1" />
                                </div>
                            )}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                                {ungrouped.map((s, i) => renderCard(s, i))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
