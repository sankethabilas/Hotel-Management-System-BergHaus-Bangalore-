'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Download, Home, Calendar, User, Mail, Phone, CreditCard } from 'lucide-react';

interface Booking {
  _id: string;
  bookingReference: string;
  roomId: {
    _id: string;
    roomNumber: string;
    roomType: string;
    capacity: number;
    amenities: string[];
  };
  guestId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalNights: number;
  roomPrice: number;
  totalAmount: number;
  taxAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  specialRequests: string;
  bookingDate: string;
}

export default function BookingConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingReference = searchParams?.get('ref');

  useEffect(() => {
    if (bookingReference) {
      fetchBookingDetails();
    } else {
      setLoading(false);
      toast({
        title: "Error",
        description: "No booking reference provided.",
        variant: "destructive"
      });
    }
  }, [bookingReference]);

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/bookings/${bookingReference}`);
      const data = await response.json();

      if (data.success) {
        setBooking(data.data.booking);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch booking details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Fetch booking error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch booking details.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!booking) {
      toast({
        title: "Error",
        description: "No booking data available for download.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Download Started",
        description: "Your booking receipt is being prepared for download.",
      });

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
      tempContainer.style.padding = '20px';
      document.body.appendChild(tempContainer);

      // Generate HTML content for the receipt
      const receiptHTML = generateReceiptHTML(booking);
      tempContainer.innerHTML = receiptHTML;

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
      pdf.save(`booking-receipt-${booking.bookingReference}.pdf`);
      
      toast({
        title: "Download Complete",
        description: "Your booking receipt PDF has been downloaded.",
      });
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      
      // Fallback to HTML download
      try {
        const receiptHTML = generateReceiptHTML(booking);
        const blob = new Blob([receiptHTML], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `booking-receipt-${booking.bookingReference}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast({
          title: "Download Complete",
          description: "Your booking receipt has been downloaded as HTML file.",
        });
      } catch (fallbackError) {
        console.error('Fallback download failed:', fallbackError);
        toast({
          title: "Download Failed",
          description: "Failed to download receipt. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const generateReceiptHTML = (booking: Booking) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Receipt - ${booking.bookingReference}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 25px; }
            .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
            .label { font-weight: bold; }
            .total { font-size: 18px; font-weight: bold; color: #2c5aa0; text-align: center; margin-top: 20px; padding: 15px; background: #f0f8ff; border-radius: 5px; }
            .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏨 Berghaus Bungalow</h1>
            <h2>Booking Receipt</h2>
            <p>Reference: <strong>${booking.bookingReference}</strong></p>
        </div>

        <div class="section">
            <h3>Guest Information</h3>
            <div class="info-row">
                <span class="label">Name:</span>
                <span>${booking.guestName}</span>
            </div>
            <div class="info-row">
                <span class="label">Email:</span>
                <span>${booking.guestEmail}</span>
            </div>
            <div class="info-row">
                <span class="label">Phone:</span>
                <span>${booking.guestPhone}</span>
            </div>
        </div>

        <div class="section">
            <h3>Booking Details</h3>
            <div class="info-row">
                <span class="label">Room Number:</span>
                <span>${booking.roomId.roomNumber}</span>
            </div>
            <div class="info-row">
                <span class="label">Room Type:</span>
                <span>${booking.roomId.roomType}</span>
            </div>
            <div class="info-row">
                <span class="label">Check-in:</span>
                <span>${new Date(booking.checkInDate).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="label">Check-out:</span>
                <span>${new Date(booking.checkOutDate).toLocaleDateString()}</span>
            </div>
            <div class="info-row">
                <span class="label">Number of Guests:</span>
                <span>${booking.numberOfGuests}</span>
            </div>
            <div class="info-row">
                <span class="label">Total Nights:</span>
                <span>${booking.totalNights}</span>
            </div>
        </div>

        <div class="section">
            <h3>Payment Summary</h3>
            <div class="info-row">
                <span class="label">Room Rate (${booking.totalNights} nights):</span>
                <span>$${(booking.roomPrice * booking.totalNights).toFixed(2)}</span>
            </div>
            <div class="info-row">
                <span class="label">Tax (10%):</span>
                <span>$${booking.taxAmount.toFixed(2)}</span>
            </div>
            <div class="info-row">
                <span class="label">Payment Method:</span>
                <span>${booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}</span>
            </div>
            <div class="info-row">
                <span class="label">Payment Status:</span>
                <span>${booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}</span>
            </div>
        </div>

        <div class="total">
            Total Amount: $${booking.totalAmount.toFixed(2)}
        </div>

        ${booking.specialRequests ? `
        <div class="section">
            <h3>Special Requests</h3>
            <p>${booking.specialRequests}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Thank you for choosing Berghaus Bungalow!</p>
            <p>Booking Date: ${new Date(booking.bookingDate).toLocaleDateString()}</p>
            <p>For any queries, please contact us at info@berghausbungalow.com</p>
        </div>
    </body>
    </html>
    `;
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPaymentStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-500 mb-4">
              <CheckCircle className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Booking Not Found</h2>
            <p className="text-gray-600 mb-4">
              The booking reference you provided could not be found.
            </p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-600">
            Your reservation has been successfully created. You will receive a confirmation email shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Booking Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Booking Reference</Label>
                    <p className="text-lg font-semibold text-[#006bb8]">{booking.bookingReference}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Booking Date</Label>
                    <p className="text-lg">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Status</Label>
                    <div className="mt-1">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                    <div className="mt-1">
                      <Badge variant={getPaymentStatusBadgeVariant(booking.paymentStatus)}>
                        {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Room Details */}
            <Card>
              <CardHeader>
                <CardTitle>Room Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Room Number</Label>
                    <p className="text-lg font-semibold">Room {booking.roomId.roomNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Room Type</Label>
                    <p className="text-lg">{booking.roomId.roomType.charAt(0).toUpperCase() + booking.roomId.roomType.slice(1)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Capacity</Label>
                    <p className="text-lg">{booking.roomId.capacity} {booking.roomId.capacity === 1 ? 'Guest' : 'Guests'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Total Nights</Label>
                    <p className="text-lg">{booking.totalNights} {booking.totalNights === 1 ? 'Night' : 'Nights'}</p>
                  </div>
                </div>
                
                {booking.roomId.amenities && booking.roomId.amenities.length > 0 && (
                  <div className="mt-4">
                    <Label className="text-sm font-medium text-gray-500">Amenities</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {booking.roomId.amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guest Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Guest Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Guest Name</Label>
                    <p className="text-lg">{booking.guestName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Email</Label>
                    <p className="text-lg">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Phone</Label>
                    <p className="text-lg">{booking.guestPhone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Number of Guests</Label>
                    <p className="text-lg">{booking.numberOfGuests}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Special Requests */}
            {booking.specialRequests && (
              <Card>
                <CardHeader>
                  <CardTitle>Special Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{booking.specialRequests}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Booking Summary Sidebar */}
          <div className="space-y-6">
            {/* Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Stay Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Check-in</Label>
                  <p className="text-lg font-semibold">{new Date(booking.checkInDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">3:00 PM</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Check-out</Label>
                  <p className="text-lg font-semibold">{new Date(booking.checkOutDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">11:00 AM</p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Room Rate ({booking.totalNights} nights)</span>
                  <span>${(booking.roomPrice * booking.totalNights).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (10%)</span>
                  <span>${booking.taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>${booking.totalAmount.toFixed(2)}</span>
                </div>
                <div className="mt-3">
                  <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                  <p className="text-sm">{booking.paymentMethod.charAt(0).toUpperCase() + booking.paymentMethod.slice(1)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
              <CardContent className="p-4 space-y-3">
                <Button 
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center gap-2"
                  variant="outline"
                >
                  <Download className="w-4 h-4" />
                  Download Receipt
                </Button>
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Return to Home
                </Button>
              </CardContent>
            </Card>

            {/* Important Information */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Important Information</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Check-in: 3:00 PM</li>
                  <li>• Check-out: 11:00 AM</li>
                  <li>• Bring valid ID</li>
                  <li>• Free cancellation up to 24 hours before check-in</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}