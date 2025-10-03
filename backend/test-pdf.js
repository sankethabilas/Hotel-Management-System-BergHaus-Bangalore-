const { generatePDF } = require('./services/billGenerator');

// Test data
const testBill = {
  billNumber: 'TEST123',
  orderNumber: 'BH20250120001',
  customerInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '1234567890',
    roomNumber: '101'
  },
  items: [
    {
      name: 'Beef Burger',
      quantity: 2,
      unitPrice: 19.99,
      totalPrice: 39.98
    },
    {
      name: 'French Fries',
      quantity: 1,
      unitPrice: 8.99,
      totalPrice: 8.99
    }
  ],
  pricing: {
    subtotal: 48.97,
    serviceCharge: 4.90,
    vat: 8.08,
    discount: 0,
    total: 61.95
  },
  paymentMethod: 'cash',
  status: 'generated',
  createdAt: new Date()
};

async function testPDF() {
  try {
    console.log('Testing PDF generation...');
    const pdfBuffer = await generatePDF(testBill);
    console.log('PDF generated successfully!');
    console.log('PDF size:', pdfBuffer.length, 'bytes');
    
    // Save to file for testing
    const fs = require('fs');
    fs.writeFileSync('test-bill.pdf', pdfBuffer);
    console.log('PDF saved as test-bill.pdf');
    
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
}

testPDF();
