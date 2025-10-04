const puppeteer = require('puppeteer');
const path = require('path');

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initializeBrowser() {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        });
        console.log('✅ Puppeteer browser initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Puppeteer browser:', error);
        throw new Error('PDF service initialization failed');
      }
    }
    return this.browser;
  }

  async generateBookingConfirmationPDF(bookingData) {
    try {
      const browser = await this.initializeBrowser();
      const page = await browser.newPage();

      // Generate HTML content for the PDF
      const htmlContent = this.generateBookingConfirmationHTML(bookingData);

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
      
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      await page.close();
      
      // Ensure we return a proper Buffer
      const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
      return pdfBuffer;

    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  generateBookingConfirmationHTML(bookingData) {
    const {
      bookingReference,
      guestDetails,
      roomDetails,
      checkIn,
      checkOut,
      totalAmount,
      status,
      createdAt
    } = bookingData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation - ${bookingReference}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
            }
            
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                background: linear-gradient(135deg, #006bb8, #2fa0df);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 300;
            }
            
            .header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .content {
                padding: 40px 30px;
            }
            
            .confirmation-badge {
                background: #28a745;
                color: white;
                padding: 8px 16px;
                border-radius: 20px;
                font-size: 14px;
                font-weight: bold;
                display: inline-block;
                margin-bottom: 30px;
            }
            
            .booking-info {
                background: #f8f9fa;
                padding: 25px;
                border-radius: 10px;
                margin-bottom: 30px;
                border-left: 4px solid #006bb8;
            }
            
            .info-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
            }
            
            .info-section h3 {
                color: #006bb8;
                margin-bottom: 15px;
                font-size: 18px;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 8px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .info-label {
                font-weight: 600;
                color: #495057;
            }
            
            .info-value {
                color: #212529;
            }
            
            .room-details {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 30px;
            }
            
            .room-details h3 {
                color: #856404;
                margin-bottom: 15px;
            }
            
            .amenities {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 15px;
            }
            
            .amenity-tag {
                background: #e9ecef;
                color: #495057;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .total-section {
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                margin-bottom: 30px;
            }
            
            .total-amount {
                font-size: 24px;
                font-weight: bold;
                color: #155724;
            }
            
            .footer {
                background: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer h4 {
                color: #006bb8;
                margin-bottom: 15px;
            }
            
            .contact-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-top: 20px;
            }
            
            .contact-item {
                text-align: left;
            }
            
            .contact-item strong {
                color: #495057;
            }
            
            .qr-code {
                text-align: center;
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .qr-placeholder {
                width: 120px;
                height: 120px;
                background: #e9ecef;
                border: 2px dashed #adb5bd;
                margin: 0 auto 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #6c757d;
                font-size: 12px;
            }
            
            @media print {
                body { background: white; }
                .container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🏨 Berghaus Bungalow</h1>
                <p>Booking Confirmation</p>
            </div>
            
            <div class="content">
                <div class="confirmation-badge">✅ CONFIRMED</div>
                
                <div class="booking-info">
                    <h3>📋 Booking Information</h3>
                    <div class="info-row">
                        <span class="info-label">Booking Reference:</span>
                        <span class="info-value"><strong>${bookingReference}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Booking Date:</span>
                        <span class="info-value">${new Date(createdAt).toLocaleDateString()}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">${status.toUpperCase()}</span>
                    </div>
                </div>
                
                <div class="info-grid">
                    <div class="info-section">
                        <h3>👤 Guest Information</h3>
                        <div class="info-row">
                            <span class="info-label">Name:</span>
                            <span class="info-value">${guestDetails.firstName} ${guestDetails.lastName}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Email:</span>
                            <span class="info-value">${guestDetails.email}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Phone:</span>
                            <span class="info-value">${guestDetails.phone}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Country:</span>
                            <span class="info-value">${guestDetails.country}</span>
                        </div>
                        ${guestDetails.idType && guestDetails.idNumber ? `
                        <div class="info-row">
                            <span class="info-label">ID Type:</span>
                            <span class="info-value">${guestDetails.idType.replace('_', ' ').toUpperCase()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">ID Number:</span>
                            <span class="info-value">${guestDetails.idNumber}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="info-section">
                        <h3>📅 Stay Details</h3>
                        <div class="info-row">
                            <span class="info-label">Check-in:</span>
                            <span class="info-value">${new Date(checkIn).toLocaleDateString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Check-out:</span>
                            <span class="info-value">${new Date(checkOut).toLocaleDateString()}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Duration:</span>
                            <span class="info-value">${Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))} night(s)</span>
                        </div>
                        ${guestDetails.arrivalTime ? `
                        <div class="info-row">
                            <span class="info-label">Arrival Time:</span>
                            <span class="info-value">${guestDetails.arrivalTime}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="room-details">
                    <h3>🏨 Room Information</h3>
                    <div class="info-row">
                        <span class="info-label">Room Number:</span>
                        <span class="info-value"><strong>${roomDetails.roomNumber}</strong></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Room Type:</span>
                        <span class="info-value">${roomDetails.roomType}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Capacity:</span>
                        <span class="info-value">${roomDetails.capacity} guest(s)</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Price per Night:</span>
                        <span class="info-value">₹${roomDetails.pricePerNight.toLocaleString()}</span>
                    </div>
                    <div class="amenities">
                        ${roomDetails.amenities.map(amenity => `<span class="amenity-tag">${amenity}</span>`).join('')}
                    </div>
                </div>
                
                <div class="total-section">
                    <h3>💰 Total Amount</h3>
                    <div class="total-amount">₹${totalAmount.toLocaleString()}</div>
                    <p style="margin-top: 10px; color: #6c757d;">Payment Status: ${bookingData.paymentStatus || 'Unpaid'}</p>
                </div>
                
                ${guestDetails.specialRequests ? `
                <div class="info-section">
                    <h3>📝 Special Requests</h3>
                    <p style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #006bb8;">
                        ${guestDetails.specialRequests}
                    </p>
                </div>
                ` : ''}
                
                <div class="qr-code">
                    <div class="qr-placeholder">QR Code<br/>${bookingReference}</div>
                    <p style="font-size: 12px; color: #6c757d;">Scan this code at check-in</p>
                </div>
            </div>
            
            <div class="footer">
                <h4>📞 Contact Information</h4>
                <div class="contact-info">
                    <div class="contact-item">
                        <strong>Hotel Address:</strong><br/>
                        123 Mountain View Road<br/>
                        Hill Station, Sri Lanka 20000
                    </div>
                    <div class="contact-item">
                        <strong>Contact Details:</strong><br/>
                        Phone: +94 11 234 5678<br/>
                        Email: info@berghausbungalow.com<br/>
                        Website: www.berghausbungalow.com
                    </div>
                </div>
                <p style="margin-top: 20px; font-size: 12px; color: #6c757d;">
                    This is an automated confirmation. Please keep this document for your records.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async generateBillPDF(billData) {
    let page = null;
    try {
      console.log('🔄 Starting bill PDF generation for:', billData.billId);
      const browser = await this.initializeBrowser();
      page = await browser.newPage();

      // Set page options for better PDF generation
      await page.setViewport({ width: 1200, height: 800 });

      // Generate HTML content for the bill PDF
      const htmlContent = this.generateBillHTML(billData);
      console.log('📄 HTML content generated, setting page content...');

      // Set content and generate PDF
      await page.setContent(htmlContent, { 
        waitUntil: 'networkidle0',
        timeout: 30000
      });
      
      console.log('🖨️ Generating PDF...');
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        },
        timeout: 30000
      });

      console.log('✅ PDF generated successfully, size:', pdfData.length);
      
      // Ensure we return a proper Buffer
      const pdfBuffer = Buffer.isBuffer(pdfData) ? pdfData : Buffer.from(pdfData);
      console.log('📦 Buffer created, isBuffer:', Buffer.isBuffer(pdfBuffer));
      
      return pdfBuffer;
    } catch (error) {
      console.error('❌ Error generating bill PDF:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    } finally {
      if (page) {
        try {
          await page.close();
        } catch (closeError) {
          console.error('Error closing page:', closeError);
        }
      }
    }
  }

  generateBillHTML(billData) {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const formatCurrency = (amount) => {
      return `Rs ${parseFloat(amount).toFixed(2)}`;
    };

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Hotel Bill - ${billData.billId}</title>
        <style>
            body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
                color: #333;
            }
            .bill-container {
                max-width: 800px;
                margin: 0 auto;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }
            .header {
                background: linear-gradient(135deg, #006bb8, #0056a3);
                color: white;
                padding: 30px;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 28px;
                font-weight: bold;
            }
            .header p {
                margin: 5px 0 0 0;
                font-size: 16px;
                opacity: 0.9;
            }
            .content {
                padding: 30px;
            }
            .bill-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 30px;
                flex-wrap: wrap;
            }
            .info-section {
                flex: 1;
                min-width: 250px;
                margin-bottom: 20px;
            }
            .info-section h3 {
                color: #006bb8;
                margin-bottom: 10px;
                font-size: 18px;
                border-bottom: 2px solid #e9ecef;
                padding-bottom: 5px;
            }
            .info-item {
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
            }
            .info-item strong {
                color: #495057;
            }
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin: 30px 0;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table th {
                background: #006bb8;
                color: white;
                padding: 15px;
                text-align: left;
                font-weight: bold;
            }
            .items-table td {
                padding: 12px 15px;
                border-bottom: 1px solid #e9ecef;
            }
            .items-table tr:last-child td {
                border-bottom: none;
            }
            .items-table tr:nth-child(even) {
                background-color: #f8f9fa;
            }
            .total-section {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin-top: 20px;
            }
            .total-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 10px;
                padding: 5px 0;
            }
            .total-row.final {
                border-top: 2px solid #006bb8;
                padding-top: 15px;
                margin-top: 15px;
                font-size: 18px;
                font-weight: bold;
                color: #006bb8;
            }
            .payment-status {
                display: inline-block;
                padding: 8px 16px;
                border-radius: 20px;
                font-weight: bold;
                text-transform: uppercase;
                font-size: 12px;
            }
            .payment-status.paid {
                background: #d4edda;
                color: #155724;
            }
            .payment-status.pending {
                background: #fff3cd;
                color: #856404;
            }
            .footer {
                background: #f8f9fa;
                padding: 20px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .footer p {
                margin: 5px 0;
                color: #6c757d;
                font-size: 14px;
            }
            @media print {
                body { background-color: white; }
                .bill-container { box-shadow: none; }
            }
        </style>
    </head>
    <body>
        <div class="bill-container">
            <div class="header">
                <h1>🏨 Berghaus Bungalow</h1>
                <p>Hotel Management System</p>
            </div>
            
            <div class="content">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h2 style="color: #006bb8; margin: 0;">HOTEL BILL</h2>
                    <p style="color: #6c757d; margin: 5px 0;">Bill ID: ${billData.billId}</p>
                    <p style="color: #6c757d; margin: 5px 0;">Generated on: ${formatDate(billData.createdAt)}</p>
                </div>

                <div class="bill-info">
                    <div class="info-section">
                        <h3>📋 Booking Details</h3>
                        <div class="info-item">
                            <span><strong>Booking Reference:</strong></span>
                            <span>${billData.bookingReference}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Room:</strong></span>
                            <span>${billData.roomNumber} (${billData.roomType})</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Check-in:</strong></span>
                            <span>${formatDate(billData.checkInDate)}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Check-out:</strong></span>
                            <span>${formatDate(billData.checkOutDate)}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Total Nights:</strong></span>
                            <span>${billData.totalNights}</span>
                        </div>
                    </div>

                    <div class="info-section">
                        <h3>👤 Guest Information</h3>
                        <div class="info-item">
                            <span><strong>Name:</strong></span>
                            <span>${billData.guestName}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Email:</strong></span>
                            <span>${billData.guestEmail}</span>
                        </div>
                        <div class="info-item">
                            <span><strong>Payment Status:</strong></span>
                            <span class="payment-status ${billData.paymentStatus}">${billData.paymentStatus}</span>
                        </div>
                    </div>
                </div>

                <h3 style="color: #006bb8; margin-bottom: 15px;">💰 Bill Details</h3>
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th style="text-align: center;">Quantity</th>
                            <th style="text-align: right;">Unit Price</th>
                            <th style="text-align: right;">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${billData.items.map(item => `
                            <tr>
                                <td>${item.description}</td>
                                <td style="text-align: center;">${item.quantity}</td>
                                <td style="text-align: right;">${formatCurrency(item.unitPrice)}</td>
                                <td style="text-align: right;">${formatCurrency(item.total)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="total-section">
                    <div class="total-row">
                        <span><strong>Subtotal:</strong></span>
                        <span>${formatCurrency(billData.subtotal)}</span>
                    </div>
                    <div class="total-row">
                        <span><strong>Tax:</strong></span>
                        <span>${formatCurrency(billData.tax)}</span>
                    </div>
                    <div class="total-row final">
                        <span>TOTAL AMOUNT:</span>
                        <span>${formatCurrency(billData.total)}</span>
                    </div>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for staying with Berghaus Bungalow!</strong></p>
                <p>📞 +94 11 234 5678 | 📧 info@berghausbungalow.com | 🌐 www.berghausbungalow.com</p>
                <p>123 Mountain View Road, Hill Station, Sri Lanka 20000</p>
                <p style="margin-top: 15px; font-size: 12px;">This is a computer-generated bill. No signature required.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new PDFService();
