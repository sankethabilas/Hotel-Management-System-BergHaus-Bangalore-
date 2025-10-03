const mongoose = require('mongoose');
const Bill = require('./models/Bill');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect('mongodb+srv://Sanketh:Gv5T0YzYqgFCI6th@cluster0.6vyj3nr.mongodb.net/hms_database?retryWrites=true&w=majority');

async function testBillGeneration() {
  try {
    console.log('Testing bill generation...');
    
    // Find an order
    const order = await Order.findById('68df7ceaba45102eb94d4714').populate('items.menuItem');
    console.log('Order found:', order ? 'Yes' : 'No');
    
    if (order) {
      console.log('Order details:', {
        orderNumber: order.orderNumber,
        customerName: order.customerInfo.name,
        roomNumber: order.customerInfo.roomNumber || 'Not provided',
        items: order.items.length
      });
      
      // Test bill creation
      const billData = {
        billNumber: Bill.generateBillNumber(),
        orderId: order._id,
        orderNumber: order.orderNumber,
        customerInfo: {
          name: order.customerInfo.name,
          email: order.customerInfo.email,
          phone: order.customerInfo.phone,
          roomNumber: order.customerInfo.roomNumber || ''
        },
        items: order.items.map(item => ({
          menuItemId: item.menuItem._id || item.menuItem,
          name: item.menuItem.name || 'Unknown Item',
          quantity: item.quantity,
          unitPrice: item.menuItem.price || 0,
          totalPrice: (item.menuItem.price || 0) * item.quantity
        })),
        pricing: {
          subtotal: order.items.reduce((sum, item) => sum + (item.menuItem.price || 0) * item.quantity, 0),
          serviceChargePercentage: 10,
          vatPercentage: 15,
          discount: 0,
          discountReason: ''
        },
        paymentMethod: order.paymentMethod,
        status: 'generated',
        generatedBy: null,
        notes: ''
      };
      
      console.log('Bill data prepared:', {
        billNumber: billData.billNumber,
        customerName: billData.customerInfo.name,
        roomNumber: billData.customerInfo.roomNumber,
        itemsCount: billData.items.length
      });
      
      // Create bill
      const bill = new Bill(billData);
      bill.calculateTotals();
      
      const savedBill = await bill.save();
      console.log('Bill created successfully:', savedBill.billNumber);
      
    } else {
      console.log('No order found with that ID');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

testBillGeneration();
