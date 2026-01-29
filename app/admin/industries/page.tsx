"use client";

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast'; // Assuming you have a toast hook, or use simple alerting

// Simple Toast replacement if not exists, or I'll implement basic error state
// Let's assume standard alerting for simplicity if hooks are missing
const useLocalToast = () => {
    return { toast: (props: any) => console.log(props) }
}

export default function IndustriesPage() {
    const [industries, setIndustries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        color_code: '#ffffff',
        zone_name: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchIndustries();
    }, []);

    const fetchIndustries = async () => {
        try {
            const res = await fetch('/api/admin/industries');
            if (res.ok) {
                const data = await res.json();
                setIndustries(data);
            }
        } catch (e) {
            console.error("Failed to fetch industries");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/admin/industries', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || "Failed to save");

            // Success
            setIsDialogOpen(false);
            fetchIndustries(); // Refresh
            resetForm();
        } catch (err: any) {
            alert(err.message); // Simple alert for admin
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This might affect existing bookings linked to this industry.")) return;

        try {
            const res = await fetch(`/api/admin/industries?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchIndustries();
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (e) {
            alert("Delete failed");
        }
    };

    const startEdit = (ind: any) => {
        setEditingId(ind.id);
        setFormData({
            name: ind.name,
            color_code: ind.color_code,
            zone_name: ind.zone_name || ''
        });
        setIsDialogOpen(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({ name: '', color_code: '#ffffff', zone_name: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Industries & Zones</h1>
                <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-primary text-black hover:bg-primary/90">
                    <Plus size={18} className="mr-2" /> Add Industry
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <div className="text-gray-500">Loading...</div>
                ) : industries.map((ind) => (
                    <Card key={ind.id} className="bg-white/5 border-white/10 overflow-hidden relative group">
                        <div
                            className="absolute left-0 top-0 bottom-0 w-2"
                            style={{ backgroundColor: ind.color_code }}
                        />
                        <CardContent className="p-5 pl-7 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-white">{ind.name}</h3>
                                <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                                    {ind.zone_name || 'No Zone Assigned'}
                                </div>
                                <div className="text-xs text-gray-600 mt-2 font-mono">{ind.color_code}</div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => startEdit(ind)}>
                                    <Pencil size={16} className="text-blue-400" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => handleDelete(ind.id)}>
                                    <Trash2 size={16} className="text-red-400" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-black/90 border-white/20 backdrop-blur-xl text-white">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Industry' : 'New Industry'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Industry Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Real Estate"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Zone Name / Location</Label>
                            <Input
                                value={formData.zone_name}
                                onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                                placeholder="e.g. Zone A - Left Wing"
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Color Code</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={formData.color_code}
                                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                    className="w-12 h-10 p-1 bg-white/5 border-white/10"
                                />
                                <Input
                                    value={formData.color_code}
                                    onChange={(e) => setFormData({ ...formData, color_code: e.target.value })}
                                    placeholder="#RRGGBB"
                                    className="flex-1 bg-white/5 border-white/10 font-mono"
                                />
                            </div>
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
