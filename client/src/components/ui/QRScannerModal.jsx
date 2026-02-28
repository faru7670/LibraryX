import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, QrCode } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScan }) {
    useEffect(() => {
        if (!isOpen) return;

        // Ensure the div exists before initializing
        const scanner = new Html5QrcodeScanner('qr-reader', {
            qrbox: { width: 250, height: 250 },
            fps: 10,
        });

        scanner.render(
            (result) => {
                // When we get a successful scan, clear scanner and call callback
                scanner.clear().then(() => {
                    onScan(result);
                }).catch(err => {
                    console.error("Failed to clear scanner:", err);
                    onScan(result);
                });
            },
            (error) => {
                // Ignore standard scan failures as it scans continuously
            }
        );

        return () => {
            // Cleanup on unmount
            try {
                scanner.clear();
            } catch (e) {
                console.error("Cleanup error:", e);
            }
        };
    }, [isOpen, onScan]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-200/20 dark:border-gray-700/30 flex justify-between items-center bg-violet-500/5">
                    <h3 className="font-bold font-display text-gray-800 dark:text-white flex items-center gap-2">
                        <QrCode className="w-5 h-5 text-violet-500" /> Verify Identity
                    </h3>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-4">
                    {/* The library injects UI here */}
                    <div id="qr-reader" className="w-full overflow-hidden rounded-xl bg-white dark:bg-black/20"></div>
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                        Please point your camera at the user's Library ID QR Code.
                    </p>
                </div>
            </div>
        </div>
    );
}
