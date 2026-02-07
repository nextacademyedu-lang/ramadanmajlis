"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Trash2, Tag, Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function PromosPage() {
    const [promos, setPromos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percentage', // percentage | fixed
        discount_value: 0,
        usage_limit: 100,
        sales_agent: '',
        is_active: true,
        target_nights: [] as string[],
        is_package_exclusive: false
    });
    const [saving, setSaving] = useState(false);

    const [nights, setNights] = useState<any[]>([]);

    useEffect(() => {
        fetchPromos();
        fetchNights();
    }, []);

    const fetchNights = async () => {
        const { data } = await supabase.from('event_nights').select('id, title, date').order('date');
        if (data) setNights(data);
    };

    const fetchPromos = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/promos');
            if (res.ok) {
                const data = await res.json();
                setPromos(data);
            }
        } catch (err) {
            console.error("Failed to fetch promos");
        } finally {
            setLoading(false);
        }
    };

    const [editingId, setEditingId] = useState<string | null>(null);

    const handleEdit = (promo: any) => {
        setEditingId(promo.id);
        setFormData({
            code: promo.code,
            discount_type: promo.discount_type,
            discount_value: promo.discount_value,
            usage_limit: promo.usage_limit,
            sales_agent: promo.sales_agent || '',
            is_active: promo.is_active,
            target_nights: promo.target_nights || [],
            is_package_exclusive: promo.is_package_exclusive || false
        });
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = { ...formData };
            let res;
            
            if (editingId) {
                // Update
                res = await fetch('/api/admin/promos', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...updates })
                });
            } else {
                // Create
                res = await fetch('/api/admin/promos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updates)
                });
            }

            if (res.ok) {
                fetchPromos();
                setIsDialogOpen(false);
                setEditingId(null);
                setFormData({
                    code: '', discount_type: 'percentage', discount_value: 0,
                    usage_limit: 100, sales_agent: '', is_active: true,
                    target_nights: [], is_package_exclusive: false
                });
            } else {
                alert("Failed to save promo");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this code?")) return;
        await fetch(`/api/admin/promos?id=${id}`, { method: 'DELETE' });
        fetchPromos();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Promo Codes</h1>
                <Button onClick={() => setIsDialogOpen(true)} className="bg-primary text-black">
                    <Plus size={18} className="mr-2" /> Create Code
                </Button>
            </div>

            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10">
                                <TableHead className="text-gray-300">Code</TableHead>
                                <TableHead className="text-gray-300">Discount</TableHead>
                                <TableHead className="text-gray-300">Usage</TableHead>
                                <TableHead className="text-gray-300">Agent</TableHead>
                                <TableHead className="text-gray-300">Target</TableHead>
                                <TableHead className="text-gray-300">Status</TableHead>
                                <TableHead className="text-right text-gray-300">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
                            ) : promos.map((promo) => (
                                <TableRow key={promo.id} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="font-bold font-mono text-lg text-primary">
                                        {promo.code}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="border-white/20">
                                            {promo.discount_value} {promo.discount_type === 'percentage' ? '%' : 'EGP'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-400">
                                        {promo.usage_count} / {promo.usage_limit}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            {promo.is_package_exclusive && (
                                                <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                                                    Package Only
                                                </Badge>
                                            )}
                                            {promo.target_nights && promo.target_nights.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {promo.target_nights.map((nId: string) => {
                                                        const n = nights.find(x => x.id === nId);
                                                        return (
                                                            <Badge key={nId} variant="secondary" className="text-xs">
                                                                {n ? n.title : 'Night'}
                                                            </Badge>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                            {!promo.is_package_exclusive && (!promo.target_nights || promo.target_nights.length === 0) && (
                                                <span className="text-gray-500 text-xs">All</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className={`w-2 h-2 rounded-full ${promo.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleEdit(promo)}>
                                            <Tag size={16} className="text-blue-400" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}>
                                            <Trash2 size={16} className="text-red-400" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="bg-black/90 border-white/20 text-white">
                    <DialogHeader>
                        <DialogTitle>{editingId ? 'Edit Promo Code' : 'Create Promo Code'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Promo Code (e.g. SUMMER20)</Label>
                            <Input
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type</Label>
                                <Select
                                    value={formData.discount_type}
                                    onValueChange={(v: string) => setFormData({ ...formData, discount_type: v })}
                                >
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                                        <SelectItem value="fixed">Fixed Amount (EGP)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Value</Label>
                                <Input
                                    type="number"
                                    value={formData.discount_value}
                                    onChange={(e) => setFormData({ ...formData, discount_value: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Usage Limit</Label>
                                <Input
                                    type="number"
                                    value={formData.usage_limit}
                                    onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Sales Agent Name</Label>
                                <Input
                                    value={formData.sales_agent}
                                    onChange={(e) => setFormData({ ...formData, sales_agent: e.target.value })}
                                    placeholder="Optional"
                                    className="bg-white/5 border-white/10"
                                />
                            </div>
                        </div>
                        
                        <div className="space-y-4 pt-2 border-t border-white/10">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="packageExclusive"
                                    checked={formData.is_package_exclusive}
                                    onChange={(e) => setFormData({ 
                                        ...formData, 
                                        is_package_exclusive: e.target.checked,
                                        target_nights: e.target.checked ? [] : formData.target_nights 
                                    })}
                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <Label htmlFor="packageExclusive" className="cursor-pointer">
                                    Exclusive to Full Package?
                                </Label>
                            </div>

                            {!formData.is_package_exclusive && (
                                <div className="space-y-2">
                                    <Label>Applicable Nights (Select specific nights, or leave empty for all)</Label>
                                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-white/5 rounded-md border border-white/10">
                                        {nights.map(night => (
                                            <div key={night.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    id={`night-${night.id}`}
                                                    checked={formData.target_nights.includes(night.id)}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            target_nights: checked
                                                                ? [...prev.target_nights, night.id]
                                                                : prev.target_nights.filter(id => id !== night.id)
                                                        }));
                                                    }}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <Label htmlFor={`night-${night.id}`} className="text-sm cursor-pointer truncate">
                                                    {night.title}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => { setIsDialogOpen(false); setEditingId(null); setFormData({
                            code: '', discount_type: 'percentage', discount_value: 0,
                            usage_limit: 100, sales_agent: '', is_active: true,
                            target_nights: [], is_package_exclusive: false
                        }); }}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-primary text-black">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={16} />}
                            {editingId ? 'Update' : 'Save'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
