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
        is_active: true
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchPromos();
    }, []);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            // We use API route potentially if we want strict admin checks, 
            // but for now let's use client-side insert if RLS allows or if we assume local admin
            // ACTUALLY, we should use a server action or API route for security if RLS is strict.
            // Let's rely on the Anon key which only allows SELECT by default? 
            // We need a server route for writing if RLS is strict.
            // Wait, we didn't create a specific Promo API route yet.
            // I'll assume we can use the `industries` pattern or just direct insert if policy allows authenticated users.
            // Since we don't have auth context on client, we MUST use a server route with the Service Key if RLS blocks Anon.
            // Let's create a quick server action/API implicitly or just reuse the logic from Industries?
            // No, good practice: Use API. I'll create one? Or just Client Side + Service Key?
            // NO. Client Side + Service Key is bad.
            // I will Assume RLS for 'promo_codes' allows INSERT for anon for now just to make it work,
            // OR I should create `/api/admin/promos` real quick. 
            // Let's create `api/admin/promos/route.ts` quickly after this.

            const res = await fetch('/api/admin/promos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchPromos();
                setIsDialogOpen(false);
                setFormData({
                    code: '', discount_type: 'percentage', discount_value: 0,
                    usage_limit: 100, sales_agent: '', is_active: true
                });
            } else {
                alert("Failed to create promo");
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
                                    <TableCell>{promo.sales_agent || '-'}</TableCell>
                                    <TableCell>
                                        <div className={`w-2 h-2 rounded-full ${promo.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                                    </TableCell>
                                    <TableCell className="text-right">
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
                        <DialogTitle>Create Promo Code</DialogTitle>
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
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving} className="bg-primary text-black">
                            {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={16} />}
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
