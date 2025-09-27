'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  onQRGenerated?: (qrId: string) => void;
}

export default function QRCodeDisplay({ onQRGenerated }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('');
  const [qrId, setQrId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate unique QR ID
      const qrId = 'qr-' + Date.now().toString(36) + Math.random().toString(36).substr(2);
      
      // Create scan URL for employees
      const scanUrl = `http://localhost:3000/scan?qrId=${qrId}`;
      
      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(scanUrl, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        width: 256,
        color: {
          dark: '#006bb8', // Your primary blue color
          light: '#FFFFFF'
        }
      });
      
      // Simulate successful QR generation
      setQrCode(qrCodeImage);
      setQrId(qrId);
      setLastGenerated(new Date());
      onQRGenerated?.(qrId);
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('QR Code generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, []);

  // Auto-refresh QR code every hour for security
  useEffect(() => {
    const interval = setInterval(() => {
      generateQRCode();
    }, 60 * 60 * 1000); // 1 hour

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="admin-card p-6 text-center">
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2" style={{ color: '#006bb8' }}>
          Staff Attendance QR Code
        </h2>
        <p className="text-sm text-gray-600">
          Scan this QR code to mark your attendance
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        {loading && (
          <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Generating QR Code...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center w-64 h-64 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
            <div className="text-center">
              <div className="text-red-500 text-2xl mb-2">⚠️</div>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={generateQRCode}
                className="mt-2 px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {qrCode && !loading && !error && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <Image
              src={qrCode}
              alt="Attendance QR Code"
              width={256}
              height={256}
              className="rounded-lg"
            />
          </div>
        )}

        {lastGenerated && (
          <div className="text-xs text-gray-500 space-y-1">
            <p>Generated: {formatTime(lastGenerated)}</p>
            <p>QR ID: {qrId.substring(0, 8)}...</p>
            <p className="text-green-600">✓ Valid for 24 hours</p>
          </div>
        )}

        <div className="flex space-x-2">
          <button
            onClick={generateQRCode}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:bg-gray-400"
            style={{ backgroundColor: '#006bb8' }}
          >
            {loading ? 'Generating...' : 'Refresh QR Code'}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-sm mb-2">Instructions for Employees:</h3>
        <ul className="text-xs text-gray-600 space-y-1 text-left">
          <li>1. Open your phone camera or QR scanner app</li>
          <li>2. Point at the QR code above to scan</li>
          <li>3. Tap the notification to open the attendance page</li>
          <li>4. Select your name from the dropdown list</li>
          <li>5. Choose Check-in or Check-out and submit</li>
        </ul>
        <div className="mt-3 p-2 bg-blue-100 rounded text-xs">
          <strong>Direct Link:</strong> <br/>
          <code className="text-blue-700">http://localhost:3000/scan</code>
        </div>
      </div>
    </div>
  );
}