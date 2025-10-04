import React from 'react';

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

interface BookingConfirmationPDFProps {
  bookingData: BookingData;
}

export default function BookingConfirmationPDF({ bookingData }: BookingConfirmationPDFProps) {
  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      maxWidth: '800px', 
      margin: '0 auto', 
      padding: '20px',
      backgroundColor: 'white',
      color: '#333'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#006bb8',
        color: 'white',
        padding: '30px',
        textAlign: 'center',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', fontWeight: '300' }}>
          🏨 Berghaus Bungalow
        </h1>
        <p style={{ margin: '0', fontSize: '16px', opacity: '0.9' }}>
          Booking Confirmation
        </p>
      </div>

      {/* Confirmation Badge */}
      <div style={{
        backgroundColor: '#28a745',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: 'bold',
        display: 'inline-block',
        marginBottom: '30px'
      }}>
        ✅ CONFIRMED
      </div>

      {/* Booking Information */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '25px',
        borderRadius: '10px',
        marginBottom: '30px',
        borderLeft: '4px solid #006bb8'
      }}>
        <h3 style={{ color: '#006bb8', marginBottom: '15px', fontSize: '18px' }}>
          📋 Booking Information
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#006bb8' }}>Booking Reference:</span>
          <span><strong>{bookingData.bookingReference}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#006bb8' }}>Booking Date:</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '5px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#006bb8' }}>Status:</span>
          <span>{bookingData.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
        {/* Guest Information */}
        <div>
          <h3 style={{ color: '#006bb8', marginBottom: '15px', fontSize: '18px', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
            👤 Guest Information
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Name:</span>
            <span>{bookingData.guestDetails.firstName} {bookingData.guestDetails.lastName}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Email:</span>
            <span>{bookingData.guestDetails.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Phone:</span>
            <span>{bookingData.guestDetails.phone}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Country:</span>
            <span>{bookingData.guestDetails.country}</span>
          </div>
          {bookingData.guestDetails.idType && bookingData.guestDetails.idNumber && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 'bold', color: '#495057' }}>ID Type:</span>
                <span>{bookingData.guestDetails.idType.replace('_', ' ').toUpperCase()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span style={{ fontWeight: 'bold', color: '#495057' }}>ID Number:</span>
                <span>{bookingData.guestDetails.idNumber}</span>
              </div>
            </>
          )}
        </div>

        {/* Stay Details */}
        <div>
          <h3 style={{ color: '#006bb8', marginBottom: '15px', fontSize: '18px', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
            📅 Stay Details
          </h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Check-in:</span>
            <span>{new Date(bookingData.checkIn).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Check-out:</span>
            <span>{new Date(bookingData.checkOut).toLocaleDateString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold', color: '#495057' }}>Duration:</span>
            <span>{Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))} night(s)</span>
          </div>
          {bookingData.guestDetails.arrivalTime && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
              <span style={{ fontWeight: 'bold', color: '#495057' }}>Arrival Time:</span>
              <span>{bookingData.guestDetails.arrivalTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Room Details */}
      <div style={{
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#856404', marginBottom: '15px' }}>🏨 Room Information</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>Room Number:</span>
          <span><strong>{bookingData.roomNumber}</strong></span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>Room Type:</span>
          <span>{bookingData.roomType}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>Capacity:</span>
          <span>2 guest(s)</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', padding: '8px 0', borderBottom: '1px solid #eee' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>Price per Night:</span>
          <span>₹{Math.round(bookingData.totalAmount / Math.ceil((new Date(bookingData.checkOut).getTime() - new Date(bookingData.checkIn).getTime()) / (1000 * 60 * 60 * 24))).toLocaleString()}</span>
        </div>
        <div style={{ marginTop: '15px' }}>
          <span style={{ fontWeight: 'bold', color: '#495057' }}>Amenities:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
            {['WiFi', 'TV', 'Air Conditioning', 'Private Bathroom', 'Balcony', 'Mountain View'].map((amenity, index) => (
              <span key={index} style={{
                backgroundColor: '#e9ecef',
                color: '#495057',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px'
              }}>
                {amenity}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Total Amount */}
      <div style={{
        backgroundColor: '#d4edda',
        border: '1px solid #c3e6cb',
        borderRadius: '8px',
        padding: '20px',
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h3 style={{ color: '#155724', marginBottom: '10px' }}>💰 Total Amount</h3>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#155724' }}>
          ₹{bookingData.totalAmount.toLocaleString()}
        </div>
        <p style={{ marginTop: '10px', color: '#6c757d' }}>Payment Status: Unpaid</p>
      </div>

      {/* Special Requests */}
      {bookingData.guestDetails.specialRequests && (
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ color: '#006bb8', marginBottom: '15px', fontSize: '18px' }}>📝 Special Requests</h3>
          <p style={{
            backgroundColor: '#f8f9fa',
            padding: '15px',
            borderRadius: '5px',
            borderLeft: '4px solid #006bb8',
            margin: 0
          }}>
            {bookingData.guestDetails.specialRequests}
          </p>
        </div>
      )}

      {/* QR Code Placeholder */}
      <div style={{
        textAlign: 'center',
        margin: '20px 0',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px'
      }}>
        <div style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#e9ecef',
          border: '2px dashed #adb5bd',
          margin: '0 auto 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6c757d',
          fontSize: '12px'
        }}>
          QR Code<br/>{bookingData.bookingReference}
        </div>
        <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>Scan this code at check-in</p>
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '30px',
        textAlign: 'center',
        borderTop: '1px solid #e9ecef',
        marginTop: '30px'
      }}>
        <h4 style={{ color: '#006bb8', marginBottom: '15px' }}>📞 Contact Information</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ color: '#495057' }}>Hotel Address:</strong><br/>
            123 Mountain View Road<br/>
            Hill Station, Sri Lanka 20000
          </div>
          <div style={{ textAlign: 'left' }}>
            <strong style={{ color: '#495057' }}>Contact Details:</strong><br/>
            Phone: +94 11 234 5678<br/>
            Email: info@berghausbungalow.com<br/>
            Website: www.berghausbungalow.com
          </div>
        </div>
        <p style={{ marginTop: '20px', fontSize: '12px', color: '#6c757d' }}>
          This is an automated confirmation. Please keep this document for your records.
        </p>
      </div>
    </div>
  );
}
