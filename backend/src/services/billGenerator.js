const puppeteer = require('puppeteer');

const generatePDF = async (bill) => {
  try {
    console.log('Generating PDF for bill:', bill?.billNumber || 'Unknown');
    
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();

    const htmlContent = createSimpleBillHTML(bill);

    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    const pdfBuffer = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm', 
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    return pdfBuffer;
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
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
  const serviceCharge = pricing?.serviceChargeAmount || 0;
  const vat = pricing?.vatAmount || 0;
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