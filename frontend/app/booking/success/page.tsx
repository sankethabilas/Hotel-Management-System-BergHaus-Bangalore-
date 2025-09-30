'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  Download,
  Home,
  FileText,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import BookingConfirmationPDF from '@/components/BookingConfirmationPDF';

interface BookingData {
  bookingReference: string;
  reservationId: string;
  checkIn: string;
  checkOut: string;
  roomNumber: string;
  roomType: string;
  totalAmount: number;
  status: string;
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    idType?: string;
    idNumber?: string;
    arrivalTime?: string;
    specialRequests?: string;
  };
}

export default function BookingSuccessPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Get booking data from localStorage
    const successData = localStorage.getItem('bookingSuccessData');
    if (successData) {
      try {
        const parsedData = JSON.parse(successData);
        setBookingData(parsedData);
      } catch (error) {
        console.error('Error parsing booking data:', error);
      }
    }
  }, []);

  const handleDownloadPDF = async () => {
    if (!bookingData) return;

    setIsDownloading(true);
    try {
      // Import PDF generation libraries
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      // Create a temporary container for PDF generation
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '800px';
      tempContainer.style.backgroundColor = 'white';
      document.body.appendChild(tempContainer);

      // Render the PDF component
      const { createRoot } = await import('react-dom/client');
      const root = createRoot(tempContainer);
      root.render(<BookingConfirmationPDF bookingData={bookingData} />);

      // Wait for rendering to complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Generate canvas from the temporary container
      const canvas = await html2canvas(tempContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempContainer.scrollHeight
      });

      // Clean up
      root.unmount();
      document.body.removeChild(tempContainer);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add new pages if content is longer than one page
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Download the PDF
      pdf.save(`booking-confirmation-${bookingData.bookingReference}.pdf`);
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      // Fallback to print functionality
      try {
        window.print();
      } catch (printError) {
        alert('Failed to generate PDF. Please use your browser\'s print function (Ctrl+P) to save as PDF.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .container { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .bg-gray-50 { background: white !important; }
          .py-8 { padding: 0 !important; }
          .mb-6 { margin-bottom: 20px !important; }
          .mb-8 { margin-bottom: 30px !important; }
        }
        .print-only { display: none; }
      `}</style>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
        {/* Print Header */}
        <div className="print-only text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🏨 HMS Hotel Management System</h1>
          <h2 className="text-xl text-gray-700">Booking Confirmation</h2>
          <div className="border-b border-gray-300 my-4"></div>
        </div>

        {/* Success Header */}
        <div className="text-center mb-8 no-print">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600 text-lg">
            Your reservation has been successfully confirmed. You will receive a confirmation email shortly.
          </p>
        </div>

        {/* Booking Details Card */}
        <Card id="booking-details" className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Booking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">HMS Hotel</h3>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Colombo, Sri Lanka</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Confirmed
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Check-in: </span>
                    <span className="font-semibold ml-1">Dec 20, 2024</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">Check-out: </span>
                    <span className="font-semibold ml-1">Dec 22, 2024</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">+94 11 234 5678</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm">info@hmshotel.com</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Booking Reference</h4>
                  <p className="text-sm font-mono bg-gray-100 px-3 py-1 rounded">
                    HMS-2024-001234
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Important Information</h3>
            <ul className="text-sm text-blue-700 space-y-2">
              <li>• Please arrive at the hotel between 2:00 PM - 10:00 PM for check-in</li>
              <li>• Check-out time is 11:00 AM</li>
              <li>• Bring a valid ID for verification</li>
              <li>• Payment will be collected at the property</li>
              <li>• Free cancellation available up to 24 hours before check-in</li>
            </ul>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="flex items-center"
            disabled={!bookingData || isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            {isDownloading ? 'Generating PDF...' : 'Download Confirmation'}
          </Button>
          
          <Link href="/">
            <Button className="flex items-center bg-hms-primary hover:bg-hms-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </Button>
          </Link>
          
          <Link href="/availability">
            <Button variant="outline" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Book Another Stay
            </Button>
          </Link>
        </div>

        {/* Help Section */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-2">Need help with your booking?</p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="tel:+94112345678" className="text-hms-primary hover:underline">
              Call us: +94 11 234 5678
            </a>
            <a href="mailto:info@hmshotel.com" className="text-hms-primary hover:underline">
              Email us: info@hmshotel.com
            </a>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
