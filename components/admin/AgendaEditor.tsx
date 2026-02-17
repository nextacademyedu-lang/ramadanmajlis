"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type AgendaItem = {
    time: string; // Start Time (24h format HH:mm)
    end_time?: string; // End Time (24h format HH:mm)
    title: string;
    description: string;
    speaker_ids?: string[];
    speaker_id?: string; // Legacy/Singular support
    speaker_roles?: Record<string, string>; // Map speaker_id -> role name (e.g. "Moderator", "Host")
};

type Speaker = {
    id: string;
    name: string;
    image_url: string | null;
    role?: string | null;
};

interface AgendaEditorProps {
    initialAgenda: AgendaItem[];
    speakers: Speaker[];
    onSave: (agenda: AgendaItem[]) => void;
    onCancel: () => void;
}

// Helper to sort times considering crossing midnight (e.g., 2 AM is after 11 PM)
const sortAgendaItems = (items: AgendaItem[]) => {
    return [...items].sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return -1;
        
        const getMinutes = (timeStr: string) => {
            const [h, m] = timeStr.split(':').map(Number);
            // Treat hours 00-09 as next day (24+h) to handle late night events
            const adjustedH = h < 10 ? h + 24 : h;
            return adjustedH * 60 + m;
        };

        return getMinutes(a.time) - getMinutes(b.time);
    });
};

export default function AgendaEditor({ initialAgenda, speakers, onSave, onCancel }: AgendaEditorProps) {
    // Normalize function to handle speaker_id -> speaker_ids conversion
    const normalizeAgenda = (items: AgendaItem[]) => {
        return (items || []).map(item => ({
            ...item,
            speaker_ids: item.speaker_ids || (item.speaker_id ? [item.speaker_id] : []),
            speaker_roles: item.speaker_roles || {}
        }));
    };

    const [agenda, setAgenda] = useState<AgendaItem[]>(normalizeAgenda(initialAgenda));

    // Update state when initialAgenda changes (e.g. reopening modal)
    useEffect(() => {
        setAgenda(normalizeAgenda(initialAgenda));
    }, [initialAgenda]);

    const addAppendaItem = () => {
        const newItem: AgendaItem = { time: "", title: "", description: "", speaker_ids: [], speaker_roles: {} };
        // Determine sensible default time?
        setAgenda([...agenda, newItem]);
    };

    const updateItem = (index: number, field: keyof AgendaItem, value: any) => {
        const newAgenda = [...agenda];
        newAgenda[index] = { ...newAgenda[index], [field]: value };
        setAgenda(newAgenda);
    };

    const ROLE_OPTIONS = Array.from(new Set([
        "Moderator", "Host", "Panelist", "Guest", "Speaker", "VIP Guest", "Keynote Speaker", "Panel Speaker",
        ...speakers.map(s => (s as any).role).filter(Boolean)
    ])).sort();

    const toggleSpeaker = (index: number, speakerId: string) => {
        const item = agenda[index];
        const currentSpeakers = item.speaker_ids || [];
        const newSpeakers = currentSpeakers.includes(speakerId)
            ? currentSpeakers.filter(id => id !== speakerId)
            : [...currentSpeakers, speakerId];
        
        const newRoles = { ...(item.speaker_roles || {}) };
        
        if (!currentSpeakers.includes(speakerId)) {
            // Adding speaker: Auto-assign their DB role if exists
            const speaker = speakers.find(s => s.id === speakerId);
            if (speaker && (speaker as any).role) {
                newRoles[speakerId] = (speaker as any).role;
            }
        } else {
            // Removing speaker
            delete newRoles[speakerId];
        }

        const newAgenda = [...agenda];
        newAgenda[index] = { ...newAgenda[index], speaker_ids: newSpeakers, speaker_roles: newRoles };
        setAgenda(newAgenda);
    };

    const setSpeakerRole = (index: number, speakerId: string, role: string) => {
        const item = agenda[index];
        const newRoles = { ...(item.speaker_roles || {}) };
        if (role === 'None') {
            delete newRoles[speakerId];
        } else {
            newRoles[speakerId] = role;
        }
        updateItem(index, "speaker_roles", newRoles);
    };

    const removeItem = (index: number) => {
        setAgenda(agenda.filter((_, i) => i !== index));
    };

    const handleSort = () => {
        setAgenda(sortAgendaItems(agenda));
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-2">
                 <Button onClick={handleSort} variant="outline" size="sm" className="text-xs h-7 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10">
                    Sort by Time
                </Button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {agenda.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="mt-2 text-gray-500 cursor-grab">
                            <GripVertical size={16} />
                        </div>
                        <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-4 sm:col-span-3">
                                    <label className="text-xs text-gray-400 mb-1 block">Time Range</label>
                                    <div className="flex items-center gap-1">
                                        <Input
                                            type="time"
                                            value={item.time}
                                            onChange={(e) => updateItem(index, "time", e.target.value)}
                                            className="bg-black/20 border-white/10 text-xs px-2 h-8"
                                            title="Start Time"
                                        />
                                        <span className="text-gray-500">-</span>
                                        <Input
                                            type="time"
                                            value={item.end_time || ""}
                                            onChange={(e) => updateItem(index, "end_time", e.target.value)}
                                            className="bg-black/20 border-white/10 text-xs px-2 h-8"
                                            title="End Time"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-8 sm:col-span-9">
                                    <label className="text-xs text-gray-400 mb-1 block">Title</label>
                                    <Input
                                        value={item.title}
                                        onChange={(e) => updateItem(index, "title", e.target.value)}
                                        placeholder="Opening Ceremony"
                                        className="bg-black/20 border-white/10 h-8"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-xs text-gray-400 mb-1 block">Description</label>
                                <Textarea
                                    value={item.description}
                                    onChange={(e) => updateItem(index, "description", e.target.value)}
                                    placeholder="Details about this session..."
                                    className="bg-black/20 border-white/10 min-h-[60px]"
                                />
                            </div>

                            <div>
                                <label className="text-xs text-gray-400 mb-2 block">Linked Speakers & Roles</label>
                                <div className="flex flex-wrap gap-2">
                                    {(item.speaker_ids || []).map(id => {
                                        const s = speakers.find(sp => sp.id === id);
                                        if (!s) return null;
                                        const currentRole = item.speaker_roles?.[id];

                                        return (
                                            <div key={id} className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full pl-1 pr-2 py-1">
                                                {s.image_url ? (
                                                    <img src={s.image_url} alt={s.name} className="w-6 h-6 rounded-full object-cover" />
                                                ) : (
                                                    <User className="w-6 h-6 p-1 bg-emerald-500/20 rounded-full" />
                                                )}
                                                <div className="flex flex-col leading-none">
                                                    <span className="text-xs font-medium">{s.name}</span>
                                                    {/* Role Selector */}
                                                    <select 
                                                        className="text-[9px] bg-transparent text-emerald-300/80 border-none p-0 h-auto focus:ring-0 cursor-pointer mt-0.5"
                                                        value={currentRole || 'None'}
                                                        onChange={(e) => setSpeakerRole(index, id, e.target.value)}
                                                    >
                                                        <option value="None" className="bg-black text-gray-400">No Role</option>
                                                        {ROLE_OPTIONS.map(r => (
                                                            <option key={r} value={r} className="bg-black text-emerald-400">{r}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button onClick={() => toggleSpeaker(index, id)} className="ml-1 text-red-400 hover:text-red-300">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                    
                                    <Select onValueChange={(val: string) => toggleSpeaker(index, val)}>
                                        <SelectTrigger className="w-[140px] h-8 text-xs bg-black/20 border-white/10 rounded-full border-dashed">
                                            <SelectValue placeholder="+ Add" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {speakers.filter(s => !(item.speaker_ids || []).includes(s.id)).map((s) => (
                                                <SelectItem key={s.id} value={s.id}>
                                                    <div className="flex items-center gap-2">
                                                        {s.name}
                                                        {typeof (s as any).role === 'string' && (
                                                            <span className="text-[10px] text-emerald-400/70 ml-1 border border-emerald-500/20 px-1 rounded">
                                                                {(s as any).role}
                                                            </span>
                                                        )}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(index)}
                            className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
                ))}
            </div>

            <Button onClick={addAppendaItem} variant="outline" className="w-full border-dashed border-white/20 hover:bg-white/5">
                <Plus className="mr-2 h-4 w-4" /> Add Agenda Item
            </Button>

            <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <Button variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button onClick={() => onSave(sortAgendaItems(agenda))} className="bg-emerald-600 hover:bg-emerald-700">
                    Save Agenda
                </Button>
            </div>
        </div>
    );
}
