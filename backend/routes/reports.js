const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// Daily Sales Report
router.get('/daily-sales', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'completed' };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 7 days if no date range provided
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query.createdAt = { $gte: sevenDaysAgo };
    }

    const orders = await Order.find(query).populate('items.menuItem');
    
    // Calculate summary data
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const cancelledOrders = orders.filter(order => order.status === 'cancelled').length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;
    
    // Category breakdown
    const categoryBreakdown = {};
    const topSellingItems = {};
    const hourlySales = {};
    
    orders.forEach(order => {
      // Hourly sales
      const hour = new Date(order.createdAt).getHours();
      hourlySales[hour] = (hourlySales[hour] || 0) + order.totalAmount;
      
      order.items.forEach(item => {
        if (item.menuItem) {
          // Category breakdown
          const category = item.menuItem.category || 'Uncategorized';
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + item.totalPrice;
          
          // Top selling items
          topSellingItems[item.menuItem.name] = (topSellingItems[item.menuItem.name] || 0) + item.quantity;
        }
      });
    });

    // Payment method breakdown
    const paymentMethods = {};
    orders.forEach(order => {
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue: totalRevenue.toFixed(2),
          totalOrders,
          completedOrders,
          cancelledOrders,
          averageOrderValue: averageOrderValue.toFixed(2),
          completionRate: completionRate.toFixed(1)
        },
        categoryBreakdown,
        topSellingItems: Object.entries(topSellingItems)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10),
        hourlySales,
        paymentMethods
      }
    });
  } catch (error) {
    console.error('Daily sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate daily sales report',
      error: error.message
    });
  }
});

// Food Waste Analysis Report
router.get('/food-waste', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let query = { status: 'cancelled' };
    
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      query.createdAt = { $gte: thirtyDaysAgo };
    }

    const cancelledOrders = await Order.find(query).populate('items.menuItem');
    
    const totalWasteValue = cancelledOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalCancelledOrders = cancelledOrders.length;
    
    // Most wasted items
    const wastedItems = {};
    cancelledOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          const itemName = item.menuItem.name;
          wastedItems[itemName] = {
            quantity: (wastedItems[itemName]?.quantity || 0) + item.quantity,
            value: (wastedItems[itemName]?.value || 0) + item.totalPrice
          };
        }
      });
    });

    // Calculate waste percentage (assuming total orders for comparison)
    const totalOrders = await Order.countDocuments({ 
      createdAt: query.createdAt || { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const wastePercentage = totalOrders > 0 ? (totalCancelledOrders / totalOrders) * 100 : 0;

    // Generate recommendations based on waste analysis
    const recommendations = [];
    if (wastePercentage > 20) {
      recommendations.push("High waste percentage detected - review order management process");
    }
    if (totalCancelledOrders > 5) {
      recommendations.push("Multiple cancellations - consider prepayment or order confirmation");
    }
    if (Object.keys(wastedItems).length > 0) {
      const topWasted = Object.entries(wastedItems)[0];
      recommendations.push(`Reduce inventory for ${topWasted[0]} - high cancellation rate`);
    }
    if (recommendations.length === 0) {
      recommendations.push("Waste levels are within acceptable range");
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalWasteValue: totalWasteValue.toFixed(2),
          wastePercentage: Math.round(wastePercentage * 100) / 100,
          cancelledOrders: totalCancelledOrders,
          totalOrders
        },
        wasteByCategory: {},
        topWastedItems: Object.entries(wastedItems)
          .sort(([,a], [,b]) => b.value - a.value)
          .slice(0, 10)
          .map(([itemName, data]) => [itemName, data.quantity]),
        recommendations
      }
    });
  } catch (error) {
    console.error('Food waste report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate food waste report',
      error: error.message
    });
  }
});

// Ingredient Usage Forecast Report
router.get('/ingredient-forecast', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Get completed orders from last 30 days for forecasting
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentOrders = await Order.find({
      status: 'completed',
      createdAt: { $gte: thirtyDaysAgo }
    }).populate('items.menuItem');

    // Calculate average daily usage
    const dailyUsage = {};
    const totalDays = 30;
    
    recentOrders.forEach(order => {
      order.items.forEach(item => {
        if (item.menuItem) {
          const itemName = item.menuItem.name;
          dailyUsage[itemName] = (dailyUsage[itemName] || 0) + item.quantity;
        }
      });
    });

    // Calculate forecast for next N days
    const forecast = {};
    Object.entries(dailyUsage).forEach(([itemName, totalQuantity]) => {
      const avgDailyUsage = totalQuantity / totalDays;
      const forecastQuantity = Math.ceil(avgDailyUsage * parseInt(days));
      
      forecast[itemName] = {
        currentDailyAverage: Math.round(avgDailyUsage * 100) / 100,
        forecastQuantity,
        recommendation: forecastQuantity > 50 ? 'High demand expected' : 
                       forecastQuantity > 20 ? 'Moderate demand' : 'Low demand'
      };
    });

    // Transform data to match frontend expectations
    const topIngredients = Object.entries(forecast)
      .sort(([,a], [,b]) => b.forecastQuantity - a.forecastQuantity)
      .map(([name, data]) => [name, data.currentDailyAverage]);

    const next7Days = Object.fromEntries(
      Object.entries(forecast).map(([name, data]) => [name, data.forecastQuantity])
    );

    const recommendations = Object.entries(forecast)
      .filter(([,data]) => data.recommendation === 'High demand expected')
      .map(([name]) => `High demand expected for ${name} - prepare extra inventory`);

    res.json({
      success: true,
      data: {
        period: `${days} days`,
        summary: {
          totalOrdersAnalyzed: recentOrders.length,
          uniqueIngredients: Object.keys(forecast).length,
          averageDailyOrders: (recentOrders.length / totalDays).toFixed(1)
        },
        ingredientUsage: {},
        topIngredients,
        categoryTrends: {},
        forecasts: {
          next7Days
        },
        recommendations
      }
    });
  } catch (error) {
    console.error('Ingredient forecast report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate ingredient forecast report',
      error: error.message
    });
  }
});

module.exports = router;
