"use client";

import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QRScannerProps {
    onScan: (result: string) => void;
    isActive: boolean;
}

export default function QRScanner({ onScan, isActive }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Check camera permission on mount
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(() => setPermissionGranted(true))
            .catch(() => setPermissionGranted(false));

        return () => {
            // Cleanup on unmount
            if (scannerRef.current && isScanning) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, []);

    const startScanning = async () => {
        if (!containerRef.current) return;

        setError(null);
        
        try {
            const html5QrCode = new Html5Qrcode("qr-reader");
            scannerRef.current = html5QrCode;

            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                },
                (decodedText) => {
                    // Success callback
                    onScan(decodedText);
                    // Optionally stop after successful scan
                    // stopScanning();
                },
                () => {
                    // Error callback - ignore continuous errors during scanning
                }
            );

            setIsScanning(true);
        } catch (err) {
            console.error("QR Scanner error:", err);
            setError("Failed to start camera. Please check permissions.");
            setIsScanning(false);
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                setIsScanning(false);
            } catch (err) {
                console.error("Error stopping scanner:", err);
            }
        }
    };

    if (permissionGranted === null) {
        return (
            <div className="flex items-center justify-center p-8 text-gray-400">
                <Loader2 className="animate-spin mr-2" />
                Checking camera permissions...
            </div>
        );
    }

    if (permissionGranted === false) {
        return (
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                <CameraOff className="mx-auto mb-2" size={32} />
                <p>Camera permission denied.</p>
                <p className="text-sm text-gray-400 mt-2">Please allow camera access in your browser settings.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-center gap-4">
                {!isScanning ? (
                    <Button 
                        onClick={startScanning} 
                        className="bg-primary text-black font-bold"
                        disabled={!isActive}
                    >
                        <Camera className="mr-2" />
                        Start Camera Scanner
                    </Button>
                ) : (
                    <Button 
                        onClick={stopScanning} 
                        variant="destructive"
                    >
                        <CameraOff className="mr-2" />
                        Stop Scanner
                    </Button>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-center">
                    {error}
                </div>
            )}

            <div 
                ref={containerRef}
                id="qr-reader" 
                className={`mx-auto rounded-xl overflow-hidden ${isScanning ? 'border-2 border-primary/50' : ''}`}
                style={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    minHeight: isScanning ? '300px' : '0'
                }}
            />

            {isScanning && (
                <p className="text-center text-gray-400 text-sm animate-pulse">
                    📷 Point camera at QR code...
                </p>
            )}
        </div>
    );
}
