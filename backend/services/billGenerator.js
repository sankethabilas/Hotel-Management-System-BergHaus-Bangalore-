const PDFDocument = require('pdfkit');

const generatePDF = async (bill) => {
  try {
    console.log('Generating PDF for bill:', bill?.billNumber || 'Unknown');
    
    // Create a new PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });
    
    // Collect PDF data
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    
    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      doc.on('error', reject);
      
      // Generate PDF content
      generatePDFContent(doc, bill);
      doc.end();
    });
    
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
};

const generatePDFContent = (doc, bill) => {
  // Safe data extraction with fallbacks
  const billNumber = bill?.billNumber || 'N/A';
  const orderNumber = bill?.orderNumber || 'N/A';
  const customerName = bill?.customerInfo?.name || 'N/A';
  const roomNumber = bill?.customerInfo?.roomNumber || 'N/A';
  const phone = bill?.customerInfo?.phone || 'N/A';
  const email = bill?.customerInfo?.email || 'N/A';
  const paymentMethod = bill?.paymentMethod || 'cash';
  const status = bill?.status || 'generated';
  
  const items = bill?.items || [];
  const pricing = bill?.pricing || {};
  
  const subtotal = pricing?.subtotal || 0;
  const serviceCharge = pricing?.serviceCharge || 0;
  const vat = pricing?.vat || 0;
  const discount = pricing?.discount || 0;
  const total = pricing?.total || 0;
  
  const date = bill?.generatedAt || bill?.createdAt || new Date();
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedTime = new Date(date).toLocaleTimeString();

  // Header
  doc.fontSize(24)
     .fillColor('#2563eb')
     .text('BERGHAUS HOTEL', 50, 50, { align: 'center' });
  
  doc.fontSize(14)
     .fillColor('#555')
     .text('Food & Beverage Bill', 50, 80, { align: 'center' });
  
  // Bill details
  doc.fontSize(12)
     .fillColor('#000')
     .text(`Bill No: ${billNumber}`, 50, 120)
     .text(`Order No: ${orderNumber}`, 50, 140)
     .text(`Date: ${formattedDate}`, 50, 160)
     .text(`Time: ${formattedTime}`, 50, 180);
  
  // Customer information
  doc.text(`Customer: ${customerName}`, 300, 120)
     .text(`Room: ${roomNumber}`, 300, 140)
     .text(`Phone: ${phone}`, 300, 160)
     .text(`Email: ${email}`, 300, 180);
  
  // Items table header
  let yPosition = 220;
  doc.fontSize(10)
     .fillColor('#000')
     .text('Item', 50, yPosition)
     .text('Qty', 300, yPosition)
     .text('Unit Price', 350, yPosition)
     .text('Total', 450, yPosition);
  
  // Draw line under header
  yPosition += 15;
  doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
  yPosition += 10;
  
  // Items
  if (items && items.length > 0) {
    items.forEach(item => {
      const name = item?.name || 'Unknown Item';
      const quantity = item?.quantity || 1;
      const unitPrice = item?.unitPrice || 0;
      const totalPrice = item?.totalPrice || 0;
      
      doc.text(name, 50, yPosition)
         .text(quantity.toString(), 300, yPosition)
         .text(`Rs. ${unitPrice.toFixed(2)}`, 350, yPosition)
         .text(`Rs. ${totalPrice.toFixed(2)}`, 450, yPosition);
      
      yPosition += 20;
    });
  } else {
    doc.text('No items found', 50, yPosition);
    yPosition += 20;
  }
  
  // Totals section
  yPosition += 20;
  doc.text(`Subtotal: Rs. ${subtotal.toFixed(2)}`, 350, yPosition);
  yPosition += 20;
  doc.text(`Service Charge: Rs. ${serviceCharge.toFixed(2)}`, 350, yPosition);
  yPosition += 20;
  doc.text(`VAT: Rs. ${vat.toFixed(2)}`, 350, yPosition);
  
  if (discount > 0) {
    yPosition += 20;
    doc.text(`Discount: -Rs. ${discount.toFixed(2)}`, 350, yPosition);
  }
  
  yPosition += 20;
  doc.fontSize(14)
     .fillColor('#000')
     .text(`TOTAL: Rs. ${total.toFixed(2)}`, 350, yPosition);
  
  yPosition += 30;
  doc.fontSize(12)
     .text(`Payment Method: ${paymentMethod}`, 50, yPosition);
  
  yPosition += 20;
  doc.text(`Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, 50, yPosition);
  
  // Footer
  yPosition += 40;
  doc.fontSize(10)
     .fillColor('#777')
     .text('Thank you for dining with us!', 50, yPosition, { align: 'center' });
  
  yPosition += 20;
  doc.text('BergHaus Hotel, Bangalore, Karnataka, India', 50, yPosition, { align: 'center' });
};

const createSimpleBillHTML = (bill) => {
  // Safe data extraction with fallbacks
  const billNumber = bill?.billNumber || 'N/A';
  const orderNumber = bill?.orderNumber || 'N/A';
  const customerName = bill?.customerInfo?.name || 'N/A';
  const roomNumber = bill?.customerInfo?.roomNumber || 'N/A';
  const phone = bill?.customerInfo?.phone || 'N/A';
  const email = bill?.customerInfo?.email || 'N/A';
  const paymentMethod = bill?.paymentMethod || 'cash';
  const status = bill?.status || 'generated';
  
  const items = bill?.items || [];
  const pricing = bill?.pricing || {};
  
  const subtotal = pricing?.subtotal || 0;
  const serviceCharge = pricing?.serviceCharge || 0;
  const vat = pricing?.vat || 0;
  const discount = pricing?.discount || 0;
  const total = pricing?.total || 0;
  
  const date = bill?.generatedAt || bill?.createdAt || new Date();
  const formattedDate = new Date(date).toLocaleDateString();
  const formattedTime = new Date(date).toLocaleTimeString();

  // Create items HTML safely
  let itemsHTML = '';
  if (items && items.length > 0) {
    itemsHTML = items.map(item => {
      const name = item?.name || 'Unknown Item';
      const quantity = item?.quantity || 1;
      const unitPrice = item?.unitPrice || 0;
      const totalPrice = item?.totalPrice || 0;
      
      return `<tr><td>${name}</td><td style="text-align: right;">${quantity}</td><td style="text-align: right;">Rs. ${unitPrice.toFixed(2)}</td><td style="text-align: right;">Rs. ${totalPrice.toFixed(2)}</td></tr>`;
    }).join('');
  } else {
    itemsHTML = '<tr><td colspan="4" style="text-align: center;">No items found</td></tr>';
  }

  return `<!DOCTYPE html>
<html>
<head>
    <title>Bill - ${billNumber}</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            color: #333; 
            background: white;
        }
        .container { 
            width: 100%; 
            max-width: 800px; 
            margin: 0 auto; 
            border: 1px solid #eee; 
            padding: 30px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #2563eb;
            padding-bottom: 20px;
        }
        .header h1 { 
            margin: 0; 
            color: #2563eb; 
            font-size: 24px; 
        }
        .header p { 
            margin: 5px 0 0; 
            font-size: 14px; 
            color: #555; 
        }
        .bill-details, .customer-info, .totals { 
            margin-bottom: 20px; 
            border-top: 1px dashed #eee; 
            padding-top: 15px; 
        }
        .bill-details div, .customer-info div { 
            margin-bottom: 5px; 
        }
        .bill-details strong, .customer-info strong { 
            display: inline-block; 
            width: 120px; 
        }
        .table-container { 
            margin-bottom: 20px; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
        }
        th, td { 
            padding: 10px; 
            border: 1px solid #eee; 
            text-align: left; 
        }
        th { 
            background-color: #f8f8f8; 
            font-weight: bold; 
        }
        .text-right { 
            text-align: right; 
        }
        .total-row { 
            background-color: #e6f2ff; 
            font-weight: bold; 
        }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 10px; 
            color: #777; 
        }
        .status { 
            display: inline-block; 
            padding: 5px 10px; 
            border-radius: 5px; 
            font-weight: bold; 
            color: white; 
            background-color: #007bff;
        }
        .status.paid { background-color: #28a745; }
        .status.refunded { background-color: #ffc107; color: #333; }
        .status.cancelled { background-color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BERGHAUS HOTEL</h1>
            <p>Food & Beverage Bill</p>
        </div>

        <div class="bill-details">
            <div><strong>Bill No:</strong> ${billNumber}</div>
            <div><strong>Order No:</strong> ${orderNumber}</div>
            <div><strong>Date:</strong> ${formattedDate}</div>
            <div><strong>Time:</strong> ${formattedTime}</div>
        </div>

        <div class="customer-info">
            <div><strong>Customer:</strong> ${customerName}</div>
            <div><strong>Room:</strong> ${roomNumber}</div>
            <div><strong>Phone:</strong> ${phone}</div>
            <div><strong>Email:</strong> ${email}</div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th style="text-align: right;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
        </div>

        <div class="totals">
            <div><strong>Subtotal:</strong> <span style="float: right;">Rs. ${subtotal.toFixed(2)}</span></div>
            <div><strong>Service Charge:</strong> <span style="float: right;">Rs. ${serviceCharge.toFixed(2)}</span></div>
            <div><strong>VAT:</strong> <span style="float: right;">Rs. ${vat.toFixed(2)}</span></div>
            ${discount > 0 ? `<div><strong>Discount:</strong> <span style="float: right;">- Rs. ${discount.toFixed(2)}</span></div>` : ''}
            <div class="total-row"><strong>TOTAL:</strong> <span style="float: right;">Rs. ${total.toFixed(2)}</span></div>
            <div><strong>Payment Method:</strong> ${paymentMethod}</div>
            <div><strong>Status:</strong> <span class="status ${status}">${status.charAt(0).toUpperCase() + status.slice(1)}</span></div>
        </div>

        <div class="footer">
            <p>Thank you for dining with us!</p>
            <p>BergHaus Hotel, Bangalore, Karnataka, India</p>
        </div>
    </div>
</body>
</html>`;
};

module.exports = { generatePDF };
