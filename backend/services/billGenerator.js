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
  const formattedDate = new Date(date).toLocaleDateString('en-GB');
  const formattedTime = new Date(date).toLocaleTimeString('en-GB', { hour12: true });

  // Header - Hotel Name and Address
  doc.fontSize(16)
     .fillColor('#000')
     .text('BERGHAUS BUNGALOW', 50, 50, { align: 'center' });
  
  doc.fontSize(10)
     .text('80/2 Netherville place, Demodara, Sri Lanka', 50, 70, { align: 'center' })
     .text('888 - 888 (8888)', 50, 85, { align: 'center' });
  
  // Horizontal line
  doc.moveTo(50, 110).lineTo(545, 110).stroke();
  
  // Date and Time
  doc.fontSize(10)
     .text(formattedDate, 50, 125)
     .text(formattedTime, 400, 125);
  
  // Bill details
  doc.text(`CHECK: ${billNumber}`, 50, 145)
     .text(`GUEST: ${customerName.substring(0, 2).toUpperCase()}`, 400, 145);
  
  // Horizontal line
  doc.moveTo(50, 165).lineTo(545, 165).stroke();
  
  let yPosition = 180;
  
  // Items with proper formatting like the reference
  if (items && items.length > 0) {
    items.forEach((item, index) => {
      const name = (item?.name || 'Unknown Item').toUpperCase();
      const quantity = item?.quantity || 1;
      const unitPrice = item?.unitPrice || 0;
      const totalPrice = item?.totalPrice || 0;
      
      // Item number and name
      doc.fontSize(10)
         .text(`${index + 1}`, 50, yPosition)
         .text(name, 70, yPosition);
      
      // Price aligned to right
      doc.text(`Rs.${totalPrice.toFixed(2)}`, 450, yPosition, { align: 'right' });
      
      yPosition += 15;
      
      // Add customizations/extras if any (like "EXTRA SPICES" in reference)
      if (item.customization && (item.customization.modifications?.length > 0 || item.customization.specialInstructions)) {
        const extras = [];
        if (item.customization.modifications) {
          extras.push(...item.customization.modifications);
        }
        if (item.customization.specialInstructions) {
          extras.push(item.customization.specialInstructions);
        }
        
        extras.forEach(extra => {
          doc.fontSize(9)
             .text(`    ${extra.toUpperCase()}`, 70, yPosition)
             .text(`Rs.0.00`, 450, yPosition, { align: 'right' });
          yPosition += 12;
        });
      }
      
      // Quantity and unit price details
      if (quantity > 1) {
        doc.fontSize(9)
           .text(`    QTY: ${quantity} x Rs.${unitPrice.toFixed(2)}`, 70, yPosition);
        yPosition += 12;
      }
    });
  }
  
  yPosition += 10;
  
  // Horizontal line before totals
  doc.moveTo(50, yPosition).lineTo(545, yPosition).stroke();
  yPosition += 15;
  
  // Totals section (right aligned like reference)
  doc.fontSize(10);
  
  doc.text('Subtotal', 350, yPosition)
     .text(`Rs.${subtotal.toFixed(2)}`, 450, yPosition, { align: 'right' });
  yPosition += 15;
  
  if (serviceCharge > 0) {
    doc.text('Service Charge', 350, yPosition)
       .text(`Rs.${serviceCharge.toFixed(2)}`, 450, yPosition, { align: 'right' });
    yPosition += 15;
  }
  
  doc.text('Tax', 350, yPosition)
     .text(`Rs.${vat.toFixed(2)}`, 450, yPosition, { align: 'right' });
  yPosition += 15;
  
  if (discount > 0) {
    doc.text('Discount', 350, yPosition)
       .text(`-Rs.${discount.toFixed(2)}`, 450, yPosition, { align: 'right' });
    yPosition += 15;
  }
  
  doc.fontSize(12)
     .text('Total', 350, yPosition)
     .text(`Rs.${total.toFixed(2)}`, 450, yPosition, { align: 'right' });
  
  yPosition += 25;
  
  // Payment details
  doc.fontSize(10)
     .text(`PAYMENT ID: ${orderNumber}`, 50, yPosition);
  yPosition += 15;
  
  doc.text(`AUTHORIZATION: ${paymentMethod.toUpperCase()}`, 50, yPosition);
  yPosition += 15;
  
  doc.text(`APPROVAL CODE: ${status.toUpperCase()}`, 50, yPosition);
  yPosition += 15;
  
  doc.text(`CARD READER: ${paymentMethod.includes('card') ? 'CHIP/CONTACTLESS' : 'CASH'}`, 50, yPosition);
  yPosition += 30;
  
  // Suggested gratuity section
  doc.fontSize(10)
     .text('SUGGESTED GRATUITY:', 50, yPosition);
  yPosition += 15;
  
  const tip10 = total * 0.10;
  const tip20 = total * 0.20;
  const total10 = total + tip10;
  const total20 = total + tip20;
  
  doc.text(`[ ] 10.00% = Rs.${tip10.toFixed(2)}    TOTAL: Rs.${total10.toFixed(2)}`, 50, yPosition);
  yPosition += 15;
  
  doc.text(`[ ] 20.00% = Rs.${tip20.toFixed(2)}    TOTAL: Rs.${total20.toFixed(2)}`, 50, yPosition);
  yPosition += 15;
  
  doc.text('[ ] Rs.__________    TOTAL: Rs.__________', 50, yPosition);
  yPosition += 25;
  
  // Signature line
  doc.text('X:________________________________', 50, yPosition);
  yPosition += 10;
  doc.fontSize(8)
     .text('SIGNATURE', 200, yPosition);
  
  yPosition += 30;
  
  // Footer message
  doc.fontSize(10)
     .text('THANKS FOR SHOPPING WITH US', 50, yPosition, { align: 'center' });
  
  yPosition += 30;
  
  // Barcode placeholder (you can implement actual barcode generation if needed)
  doc.fontSize(8)
     .text('|||| ||| |||| ||| |||| ||| ||||', 50, yPosition, { align: 'center' })
     .text(`${Date.now()}${billNumber}`, 50, yPosition + 15, { align: 'center' });
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
            font-family: 'Courier New', monospace; 
            margin: 0; 
            padding: 20px; 
            font-size: 10px; 
            color: #000; 
            background: white;
            line-height: 1.2;
        }
        .container { 
            width: 100%; 
            max-width: 400px; 
            margin: 0 auto; 
            border: none; 
            padding: 10px; 
        }
        .header { 
            text-align: center; 
            margin-bottom: 15px; 
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
        }
        .header h1 { 
            margin: 0; 
            color: #000; 
            font-size: 14px; 
            font-weight: bold;
        }
        .header .address { 
            margin: 3px 0; 
            font-size: 9px; 
        }
        .date-time {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 9px;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
        }
        .check-guest {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
            font-size: 9px;
        }
        .items {
            margin: 15px 0;
            font-size: 9px;
        }
        .item-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
        }
        .item-number {
            width: 20px;
        }
        .item-name {
            flex: 1;
            padding-left: 10px;
        }
        .item-price {
            text-align: right;
            min-width: 60px;
        }
        .item-extra {
            padding-left: 30px;
            font-size: 8px;
            margin: 2px 0;
        }
        .totals {
            border-top: 1px solid #000;
            padding-top: 10px;
            margin-top: 15px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 5px 0;
            font-size: 9px;
        }
        .final-total {
            font-weight: bold;
            font-size: 10px;
            border-top: 1px solid #000;
            padding-top: 5px;
            margin-top: 5px;
        }
        .payment-details {
            margin: 15px 0;
            font-size: 8px;
        }
        .gratuity {
            margin: 15px 0;
            font-size: 8px;
        }
        .signature {
            margin: 20px 0;
            text-align: center;
            font-size: 8px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 9px;
            border-top: 1px solid #000;
            padding-top: 10px;
        }
        .barcode {
            text-align: center;
            margin-top: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 2px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>BERGHAUS BUNGALOW</h1>
            <div class="address">80/2 Netherville place, Demodara, Sri Lanka</div>
            <div class="address">888 - 888 (8888)</div>
        </div>

        <div class="date-time">
            <span>${formattedDate}</span>
            <span>${formattedTime}</span>
        </div>

        <div class="check-guest">
            <span>CHECK: ${billNumber}</span>
            <span>GUEST: ${customerName.substring(0, 2).toUpperCase()}</span>
        </div>

        <div class="items">
            ${items && items.length > 0 ? items.map((item, index) => {
              let itemHTML = `
                <div class="item-row">
                  <span class="item-number">${index + 1}</span>
                  <span class="item-name">${(item?.name || 'Unknown Item').toUpperCase()}</span>
                  <span class="item-price">Rs.${(item?.totalPrice || 0).toFixed(2)}</span>
                </div>
              `;
              
              // Add extras/customizations
              if (item.customization) {
                if (item.customization.modifications?.length > 0) {
                  item.customization.modifications.forEach(mod => {
                    itemHTML += `<div class="item-extra">${mod.toUpperCase()}</div>`;
                  });
                }
                if (item.customization.specialInstructions) {
                  itemHTML += `<div class="item-extra">${item.customization.specialInstructions.toUpperCase()}</div>`;
                }
              }
              
              return itemHTML;
            }).join('') : '<div>No items found</div>'}
        </div>

        <div class="totals">
            <div class="total-row">
                <span>Subtotal</span>
                <span>Rs.${subtotal.toFixed(2)}</span>
            </div>
            ${serviceCharge > 0 ? `
            <div class="total-row">
                <span>Service Charge</span>
                <span>Rs.${serviceCharge.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row">
                <span>Tax</span>
                <span>Rs.${vat.toFixed(2)}</span>
            </div>
            ${discount > 0 ? `
            <div class="total-row">
                <span>Discount</span>
                <span>-Rs.${discount.toFixed(2)}</span>
            </div>
            ` : ''}
            <div class="total-row final-total">
                <span>Total</span>
                <span>Rs.${total.toFixed(2)}</span>
            </div>
        </div>

        <div class="payment-details">
            <div>PAYMENT ID: ${orderNumber}</div>
            <div>AUTHORIZATION: ${paymentMethod.toUpperCase()}</div>
            <div>APPROVAL CODE: ${status.toUpperCase()}</div>
            <div>CARD READER: ${paymentMethod.includes('card') ? 'CHIP/CONTACTLESS' : 'CASH'}</div>
        </div>

        <div class="gratuity">
            <div style="margin-bottom: 5px;">SUGGESTED GRATUITY:</div>
            <div>[ ] 10.00% = Rs.${(total * 0.10).toFixed(2)}    TOTAL: Rs.${(total * 1.10).toFixed(2)}</div>
            <div>[ ] 20.00% = Rs.${(total * 0.20).toFixed(2)}    TOTAL: Rs.${(total * 1.20).toFixed(2)}</div>
            <div>[ ] Rs.__________    TOTAL: Rs.__________</div>
        </div>

        <div class="signature">
            <div>X:_______________________________</div>
            <div style="margin-top: 5px;">SIGNATURE</div>
        </div>

        <div class="footer">
            <div>THANKS FOR SHOPPING WITH US</div>
        </div>

        <div class="barcode">
            <div>|||| ||| |||| ||| |||| ||| ||||</div>
            <div style="font-size: 8px; margin-top: 5px;">${Date.now()}${billNumber}</div>
        </div>
    </div>
</body>
</html>`;
};

module.exports = { generatePDF };
