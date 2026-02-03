"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type NightOption = {
    id: string;
    title: string;
    date: string;
};

type Speaker = {
    id: string;
    name: string;
    title: string | null;
    image_url: string | null;
    night_id: string | null;
    display_order: number | null;
};

export default function SpeakersPage() {
    const [speakers, setSpeakers] = useState<Speaker[]>([]);
    const [nights, setNights] = useState<NightOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [fetchError, setFetchError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        title: "",
        image_url: "",
        night_id: "",
        display_order: 0
    });

    useEffect(() => {
        fetchSpeakers();
        fetchNights();
    }, []);

    const fetchSpeakers = async () => {
        setLoading(true);
        try {
            setFetchError(null);
            const res = await fetch("/api/admin/speakers");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch speakers");
            setSpeakers(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch speakers";
            setFetchError(message);
        } finally {
            setLoading(false);
        }
    };

    const fetchNights = async () => {
        try {
            const res = await fetch("/api/admin/nights");
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to fetch nights");
            setNights(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to fetch nights";
            setFetchError(message);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            name: "",
            title: "",
            image_url: "",
            night_id: "",
            display_order: 0
        });
    };

    const startEdit = (speaker: Speaker) => {
        setEditingId(speaker.id);
        setFormData({
            name: speaker.name || "",
            title: speaker.title || "",
            image_url: speaker.image_url || "",
            night_id: speaker.night_id || "",
            display_order: speaker.display_order || 0
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = editingId ? "PUT" : "POST";
            const payload = {
                ...formData,
                night_id: formData.night_id || null,
                id: editingId || undefined
            };
            const res = await fetch("/api/admin/speakers", {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to save");
            setIsDialogOpen(false);
            resetForm();
            fetchSpeakers();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to save";
            alert(message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this speaker?")) return;
        try {
            const res = await fetch(`/api/admin/speakers?id=${id}`, { method: "DELETE" });
            if (res.ok) fetchSpeakers();
            else {
                const data = await res.json();
                alert(data.message);
            }
        } catch {
            alert("Delete failed");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Speakers</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary text-black hover:bg-primary/90">
                    <Plus size={18} className="mr-2" /> Add Speaker
                </Button>
            </div>
            {fetchError && (
                <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm">
                    {fetchError}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="text-gray-500">Loading...</div>
                ) : speakers.map((speaker) => (
                    <Card key={speaker.id} className="bg-white/5 border-white/10 overflow-hidden">
                        <CardContent className="p-5 flex gap-4">
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border border-white/10 bg-white/5 shrink-0">
                                {speaker.image_url ? (
                                    <Image src={speaker.image_url} alt={speaker.name} fill className="object-cover" />
                                ) : null}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg text-white">{speaker.name}</h3>
                                <p className="text-sm text-gray-400">{speaker.title || "No title"}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {nights.find(n => n.id === speaker.night_id)?.title || "No night assigned"}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={() => startEdit(speaker)}>
                                        <Pencil size={16} className="text-blue-400 mr-1" /> Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={() => handleDelete(speaker.id)}>
                                        <Trash2 size={16} className="text-red-400 mr-1" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-black/90 border-white/20 backdrop-blur-xl text-white">
                    <DialogHeader>
                        <DialogTitle>{editingId ? "Edit Speaker" : "New Speaker"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Speaker name"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Speaker title"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Image URL</Label>
                            <Input
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="/speakers/..."
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Night</Label>
                            <Select
                                value={formData.night_id || "none"}
                                onValueChange={(val: string) => setFormData({ ...formData, night_id: val === "none" ? "" : val })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Assign to a night" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="none">No Night</SelectItem>
                                        {nights.map((n) => (
                                            <SelectItem key={n.id} value={n.id}>
                                                {n.title} - {new Date(n.date).toLocaleDateString()}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Display Order</Label>
                            <Input
                                type="number"
                                value={formData.display_order}
                                onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-primary text-black">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={16} />}
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
