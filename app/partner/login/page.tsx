"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function PartnerLogin() {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/partner/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/partner');
                router.refresh(); 
            } else {
                setError(data.message || 'Invalid Access Code');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white/5 border-white/10 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-blue-500/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-blue-500">
                        <Lock size={24} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Partner Access</CardTitle>
                    <CardDescription>Enter your access code to view bookings</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-4">
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                    type="password"
                                    placeholder="Access Code"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 bg-black/50 border-white/10"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-bold bg-blue-600 hover:bg-blue-700"
                            disabled={loading || !password}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Enter Dashboard'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
