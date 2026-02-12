"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Loader2, Calendar, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

type Speaker = {
    id: string;
    name: string;
    title: string | null;
    image_url: string | null;
    role: string | null;
};

type Night = {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    date: string;
    color_theme: string;
    price: number;
    currency: string;
    capacity: number;
    speakers: Speaker[];
};

export default function AdminNightsPage() {
    const [nights, setNights] = useState<Night[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedNight, setSelectedNight] = useState<Night | null>(null);

    useEffect(() => {
        fetchNights();
    }, []);

    const fetchNights = async () => {
        try {
            const res = await fetch("/api/admin/nights");
            const data = await res.json();
            if (res.ok) setNights(data);
        } catch (error) {
            console.error("Failed to fetch nights", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Event Nights</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {nights.map((night) => (
                    <Card 
                        key={night.id} 
                        className={`cursor-pointer hover:border-emerald-500/50 transition-all ${
                            night.color_theme === 'blue' ? 'bg-blue-900/10 border-blue-500/20' : 
                            night.color_theme === 'amber' ? 'bg-amber-900/10 border-amber-500/20' : 
                            'bg-emerald-900/10 border-emerald-500/20'
                        }`}
                        onClick={() => setSelectedNight(night)}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <Badge variant="outline" className="mb-2">
                                    {format(new Date(night.date), "MMM d, yyyy")}
                                </Badge>
                                <Badge className={
                                    night.color_theme === 'blue' ? 'bg-blue-500' : 
                                    night.color_theme === 'amber' ? 'bg-amber-500 text-black' : 
                                    'bg-emerald-500'
                                }>
                                    {night.color_theme}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl">{night.title}</CardTitle>
                            <CardDescription className="line-clamp-2">{night.subtitle}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-between text-sm text-gray-400 mb-4">
                                <span>{night.capacity} Seats</span>
                                <span>{night.price} {night.currency}</span>
                            </div>
                            <div className="flex -space-x-2 overflow-hidden">
                                {night.speakers.slice(0, 5).map((speaker) => (
                                    <div key={speaker.id} className="relative inline-block h-8 w-8 rounded-full ring-2 ring-black bg-gray-800">
                                        {speaker.image_url ? (
                                            <img src={speaker.image_url} alt={speaker.name} className="h-full w-full object-cover rounded-full" />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xs">?</div>
                                        )}
                                    </div>
                                ))}
                                {night.speakers.length > 5 && (
                                    <div className="relative inline-block h-8 w-8 rounded-full ring-2 ring-black bg-gray-700 flex items-center justify-center text-xs text-white">
                                        +{night.speakers.length - 5}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={!!selectedNight} onOpenChange={(open) => !open && setSelectedNight(null)}>
                <DialogContent className="max-w-3xl bg-[#0a201b] border-white/10 text-white max-h-[90vh] overflow-y-auto">
                    {selectedNight && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="text-2xl">{selectedNight.title}</DialogTitle>
                                <div className="text-emerald-400 font-medium">{selectedNight.subtitle}</div>
                            </DialogHeader>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
                                <div className="space-y-4 md:col-span-2">
                                    <div className="text-gray-300 leading-relaxed">
                                        {selectedNight.description}
                                    </div>

                                    {['Host', 'Keynote Speaker', 'Moderator', 'Panel Speaker'].map(role => {
                                        const roleSpeakers = selectedNight.speakers.filter(s => (s.role || 'Keynote Speaker') === role);
                                        if (roleSpeakers.length === 0) return null;
                                        return (
                                            <div key={role} className="mt-6">
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <User size={18} className="text-amber-400" />
                                                    {role === 'Keynote Speaker' ? 'Keynote Speakers' : `${role}s`}
                                                </h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {roleSpeakers.map(speaker => (
                                                        <div key={speaker.id} className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                                                            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-800 shrink-0">
                                                                {speaker.image_url && <img src={speaker.image_url} alt={speaker.name} className="h-full w-full object-cover" />}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-sm">{speaker.name}</div>
                                                                <div className="text-xs text-gray-400 line-clamp-1">{speaker.title}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="space-y-4 border-l border-white/10 pl-6 h-fit">
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Date</div>
                                        <div className="font-medium flex items-center gap-2">
                                            <Calendar size={16} className="text-emerald-500" />
                                            {format(new Date(selectedNight.date), "EEEE, MMM d")}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Capacity</div>
                                        <div className="font-medium">{selectedNight.capacity} Attendees</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Price</div>
                                        <div className="font-medium text-amber-400">{selectedNight.price} {selectedNight.currency}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Theme</div>
                                        <Badge variant="secondary" className="capitalize">{selectedNight.color_theme}</Badge>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
