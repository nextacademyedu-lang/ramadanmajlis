"use client";

import { useState, useRef } from 'react';
import { Scanner, IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { CameraOff, Loader2 } from 'lucide-react';

interface QRScannerProps {
    onScan: (result: string) => void;
    isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const lastScanRef = useRef<number>(0);
    const [paused, setPaused] = useState(false);

    const handleScan = (results: IDetectedBarcode[]) => {
        if (!results || results.length === 0 || paused) return;

        const text = results[0]?.rawValue;
        if (!text) return;

        // Prevent rapid duplicate scans (2.5 sec cooldown)
        const now = Date.now();
        if (now - lastScanRef.current < 2500) return;
        lastScanRef.current = now;

        // Vibration feedback
        if (navigator.vibrate) navigator.vibrate(200);

        // Pause scanning briefly
        setPaused(true);
        onScan(text);

        // Resume after 3 seconds
        setTimeout(() => setPaused(false), 3000);
    };

    if (!isActive) return null;

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-center flex flex-col items-center gap-2">
                    <CameraOff size={24} />
                    <span>{error}</span>
                </div>
            )}

            <div className="relative rounded-2xl overflow-hidden border-2 border-primary/30" style={{ maxWidth: '100%' }}>
                {paused && (
                    <div className="absolute inset-0 z-20 bg-black/60 flex items-center justify-center">
                        <div className="text-center space-y-2">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                            <p className="text-white font-bold">Processing...</p>
                        </div>
                    </div>
                )}
                <Scanner
                    onScan={handleScan}
                    onError={(err) => {
                        console.error('Scanner error:', err);
                        setError('Camera error. Please check permissions.');
                    }}
                    formats={['qr_code']}
                    paused={paused}
                    components={{
                        finder: true,
                    }}
                    styles={{
                        container: {
                            width: '100%',
                        },
                        video: {
                            width: '100%',
                        }
                    }}
                />
            </div>

            {!paused && (
                <p className="text-center text-gray-400 text-sm animate-pulse">
                    📷 Point camera at QR code...
                </p>
            )}
        </div>
    );
}
