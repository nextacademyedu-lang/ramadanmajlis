"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function AdminLogin() {
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin');
                router.refresh(); // Refresh middleware/server components
            } else {
                setError(data.message || 'Invalid Token');
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
                    <div className="mx-auto bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Lock size={24} />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
                    <CardDescription>Enter your secure token to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Secret Token"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                className="bg-black/50 border-white/10 text-center text-lg tracking-widest"
                            />
                        </div>

                        {error && (
                            <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full font-bold"
                            disabled={loading || !token}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Unlock Dashboard'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
