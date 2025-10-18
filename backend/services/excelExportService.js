const ExcelJS = require('exceljs');

class ExcelExportService {
  // Generate Loyalty & Points Report Excel
  async generateLoyaltyExcel(data) {
    console.log(`📊 Excel Service - Generating loyalty report with ${data.members?.length || 0} members`);
    
    const workbook = new ExcelJS.Workbook();
    
    // Set workbook properties
    workbook.creator = 'Berghaus Bungalow HMS';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.createLoyaltySummarySheet(summarySheet, data);

    // Members Details Sheet
    const membersSheet = workbook.addWorksheet('Members Details');
    this.createLoyaltyMembersSheet(membersSheet, data.members);

    // Transactions Sheet
    const transactionsSheet = workbook.addWorksheet('Transactions');
    this.createTransactionsSheet(transactionsSheet, data.transactions);

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  createLoyaltySummarySheet(sheet, data) {
    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Loyalty & Points Report';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Report date
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };
    dateCell.font = { italic: true };

    // Statistics section
    let currentRow = 4;
    sheet.getCell(`A${currentRow}`).value = 'Summary Statistics';
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;

    const stats = [
      ['Total Members', data.members.length],
      ['Total Points', data.members.reduce((sum, m) => sum + m.points, 0)],
      ['Average Points per Member', (data.members.reduce((sum, m) => sum + m.points, 0) / data.members.length || 0).toFixed(2)],
      ['Silver Tier Members', data.members.filter(m => m.tier === 'Silver').length],
      ['Gold Tier Members', data.members.filter(m => m.tier === 'Gold').length],
      ['Platinum Tier Members', data.members.filter(m => m.tier === 'Platinum').length],
      ['Active Members', data.members.filter(m => m.status === 'active').length],
      ['Inactive Members', data.members.filter(m => m.status === 'inactive').length]
    ];

    stats.forEach(([label, value]) => {
      sheet.getCell(`A${currentRow}`).value = label;
      sheet.getCell(`B${currentRow}`).value = value;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      currentRow++;
    });

    // Column widths
    sheet.getColumn('A').width = 30;
    sheet.getColumn('B').width = 20;
  }

  createLoyaltyMembersSheet(sheet, members) {
    // Header with more details
    const headers = [
      'Guest ID', 
      'Name', 
      'Email', 
      'Phone', 
      'Current Points', 
      'Lifetime Points',
      'Tier', 
      'Status', 
      'Join Date',
      'Last Activity',
      'Total Bookings',
      'Total Spent'
    ];
    const headerRow = sheet.addRow(headers);
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Data rows with additional details
    members.forEach(member => {
      const row = sheet.addRow([
        member.guestId || 'N/A',
        member.guestName || member.userId?.name || 'N/A',
        member.email || member.userId?.email || 'N/A',
        member.phone || member.userId?.phone || 'N/A',
        member.points || 0,
        member.lifetimePoints || member.points || 0,
        member.tier || 'Silver',
        member.status || 'active',
        member.createdAt ? new Date(member.createdAt).toLocaleDateString() : 'N/A',
        member.lastActivity ? new Date(member.lastActivity).toLocaleDateString() : 'N/A',
        member.totalBookings || 0,
        member.totalSpent ? `$${member.totalSpent.toFixed(2)}` : '$0.00'
      ])

      // Tier color coding
      const tierCell = row.getCell(7);
      if (member.tier === 'Platinum') {
        tierCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE5E4E2' } };
        tierCell.font = { bold: true };
      } else if (member.tier === 'Gold') {
        tierCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFD700' } };
        tierCell.font = { bold: true };
      } else if (member.tier === 'Silver') {
        tierCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0C0C0' } };
      }

      // Status color coding
      const statusCell = row.getCell(8);
      if (member.status === 'active') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCB' } };
      }

      // Points highlighting (high points = green background)
      const pointsCell = row.getCell(5);
      if (member.points >= 1000) {
        pointsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        pointsCell.font = { bold: true };
      } else if (member.points >= 500) {
        pointsCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
      }
    });

    // Auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `L1`
    };

    // Column widths
    sheet.getColumn('A').width = 15; // Guest ID
    sheet.getColumn('B').width = 25; // Name
    sheet.getColumn('C').width = 30; // Email
    sheet.getColumn('D').width = 15; // Phone
    sheet.getColumn('E').width = 15; // Current Points
    sheet.getColumn('F').width = 15; // Lifetime Points
    sheet.getColumn('G').width = 12; // Tier
    sheet.getColumn('H').width = 12; // Status
    sheet.getColumn('I').width = 15; // Join Date
    sheet.getColumn('J').width = 15; // Last Activity
    sheet.getColumn('K').width = 15; // Total Bookings
    sheet.getColumn('L').width = 15; // Total Spent

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  createTransactionsSheet(sheet, transactions) {
    // Header
    const headers = ['Date', 'Guest ID', 'Type', 'Points', 'Description', 'Reference'];
    const headerRow = sheet.addRow(headers);
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Data rows
    transactions.forEach(transaction => {
      const row = sheet.addRow([
        new Date(transaction.createdAt).toLocaleString(),
        transaction.guestId || 'N/A',
        transaction.type,
        transaction.points,
        transaction.description || 'N/A',
        transaction.reference || 'N/A'
      ]);

      // Type color coding
      const typeCell = row.getCell(3);
      if (transaction.type === 'earn') {
        typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        typeCell.font = { color: { argb: 'FF006400' } };
      } else {
        typeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCB' } };
        typeCell.font = { color: { argb: 'FF8B0000' } };
      }
    });

    // Auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `F1`
    };

    // Column widths
    sheet.getColumn('A').width = 20;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 10;
    sheet.getColumn('D').width = 10;
    sheet.getColumn('E').width = 30;
    sheet.getColumn('F').width = 20;

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate Feedback Report Excel
  async generateFeedbackExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Berghaus Bungalow HMS';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.createFeedbackSummarySheet(summarySheet, data);

    // Feedback Details Sheet
    const feedbackSheet = workbook.addWorksheet('Feedback Details');
    this.createFeedbackDetailsSheet(feedbackSheet, data.feedback);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  createFeedbackSummarySheet(sheet, data) {
    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Feedback Report';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Report date
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };
    dateCell.font = { italic: true };

    // Statistics
    let currentRow = 4;
    sheet.getCell(`A${currentRow}`).value = 'Summary Statistics';
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;

    const calculateAvgRating = (category) => {
      const sum = data.feedback.reduce((acc, f) => acc + (f.rating[category] || 0), 0);
      return (sum / data.feedback.length || 0).toFixed(2);
    };

    const stats = [
      ['Total Feedback', data.feedback.length],
      ['Average Check-In Rating', calculateAvgRating('checkIn')],
      ['Average Room Quality Rating', calculateAvgRating('roomQuality')],
      ['Average Cleanliness Rating', calculateAvgRating('cleanliness')],
      ['Average Dining Rating', calculateAvgRating('dining')],
      ['Average Staff Rating', calculateAvgRating('staff')],
      ['Average Overall Rating', calculateAvgRating('overall')],
      ['', ''],
      ['Category Distribution', ''],
      ['Front Desk', data.feedback.filter(f => f.category === 'Front Desk').length],
      ['Restaurant', data.feedback.filter(f => f.category === 'Restaurant').length],
      ['Room Service', data.feedback.filter(f => f.category === 'Room Service').length],
      ['Facilities', data.feedback.filter(f => f.category === 'Facilities').length],
      ['Management', data.feedback.filter(f => f.category === 'Management').length]
    ];

    stats.forEach(([label, value]) => {
      sheet.getCell(`A${currentRow}`).value = label;
      sheet.getCell(`B${currentRow}`).value = value;
      if (label && !label.includes('Distribution')) {
        sheet.getCell(`A${currentRow}`).font = { bold: true };
      } else if (label.includes('Distribution')) {
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
      }
      currentRow++;
    });

    sheet.getColumn('A').width = 30;
    sheet.getColumn('B').width = 20;
  }

  createFeedbackDetailsSheet(sheet, feedback) {
    // Header with comprehensive columns
    const headers = [
      'Submission Date',
      'Guest Name', 
      'Email',
      'Phone',
      'Category', 
      'Check-In Rating', 
      'Room Quality', 
      'Cleanliness', 
      'Dining', 
      'Staff Rating', 
      'Overall Rating',
      'Average Rating',
      'Status', 
      'Comments',
      'Booking Reference'
    ];
    const headerRow = sheet.addRow(headers);
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Data rows with all details
    feedback.forEach(f => {
      const avgRating = (
        (f.rating?.checkIn || 0) + 
        (f.rating?.roomQuality || 0) + 
        (f.rating?.cleanliness || 0) + 
        (f.rating?.dining || 0) + 
        (f.rating?.staff || 0) + 
        (f.rating?.overall || 0)
      ) / 6;

      const row = sheet.addRow([
        f.createdAt ? new Date(f.createdAt).toLocaleString() : 'N/A',
        f.name || 'Anonymous',
        f.email || 'N/A',
        f.phone || 'N/A',
        f.category || 'General',
        f.rating?.checkIn || 0,
        f.rating?.roomQuality || 0,
        f.rating?.cleanliness || 0,
        f.rating?.dining || 0,
        f.rating?.staff || 0,
        f.rating?.overall || 0,
        avgRating.toFixed(2),
        f.status || 'pending',
        f.comments || 'No comments provided',
        f.bookingRef || 'N/A'
      ]);

      // Rating color coding (columns 6-11: individual ratings, 12: average)
      for (let i = 6; i <= 12; i++) {
        const ratingCell = row.getCell(i);
        const value = parseFloat(ratingCell.value) || 0;
        if (value >= 4) {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
          ratingCell.font = { bold: true, color: { argb: 'FF006400' } };
        } else if (value >= 2.5) {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
        } else if (value > 0) {
          ratingCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCB' } };
          ratingCell.font = { bold: true, color: { argb: 'FF8B0000' } };
        }
      }

      // Status color coding
      const statusCell = row.getCell(13);
      if (f.status === 'resolved') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
      } else if (f.status === 'in-progress') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCB' } };
      }
    });

    // Auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `O1`
    };

    // Column widths
    sheet.getColumn('A').width = 20; // Date
    sheet.getColumn('B').width = 25; // Name
    sheet.getColumn('C').width = 30; // Email
    sheet.getColumn('D').width = 15; // Phone
    sheet.getColumn('E').width = 15; // Category
    sheet.getColumn('F').width = 12; // Check-In
    sheet.getColumn('G').width = 12; // Room Quality
    sheet.getColumn('H').width = 12; // Cleanliness
    sheet.getColumn('I').width = 12; // Dining
    sheet.getColumn('J').width = 12; // Staff
    sheet.getColumn('K').width = 12; // Overall
    sheet.getColumn('L').width = 12; // Average
    sheet.getColumn('M').width = 12; // Status
    sheet.getColumn('N').width = 50; // Comments
    sheet.getColumn('O').width = 18; // Booking Ref

    // Freeze header row
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }

  // Generate Offers Report Excel
  async generateOffersExcel(data) {
    const workbook = new ExcelJS.Workbook();
    
    workbook.creator = 'Berghaus Bungalow HMS';
    workbook.created = new Date();

    // Summary Sheet
    const summarySheet = workbook.addWorksheet('Summary');
    this.createOffersSummarySheet(summarySheet, data);

    // Offers Details Sheet
    const offersSheet = workbook.addWorksheet('Offers Details');
    this.createOffersDetailsSheet(offersSheet, data.offers);

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  createOffersSummarySheet(sheet, data) {
    // Title
    sheet.mergeCells('A1:F1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = 'Offers Report';
    titleCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.getRow(1).height = 30;

    // Report date
    sheet.mergeCells('A2:F2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Generated on: ${new Date().toLocaleString()}`;
    dateCell.alignment = { horizontal: 'center' };
    dateCell.font = { italic: true };

    // Statistics
    let currentRow = 4;
    sheet.getCell(`A${currentRow}`).value = 'Summary Statistics';
    sheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow += 2;

    const currentDate = new Date();
    const activeOffers = data.offers.filter(o => 
      o.validFrom <= currentDate && o.validUntil >= currentDate && o.status === 'active'
    ).length;
    const expiredOffers = data.offers.filter(o => 
      o.validUntil < currentDate || o.status === 'inactive'
    ).length;
    const upcomingOffers = data.offers.filter(o => o.validFrom > currentDate).length;

    const stats = [
      ['Total Offers', data.offers.length],
      ['Active Offers', activeOffers],
      ['Expired Offers', expiredOffers],
      ['Upcoming Offers', upcomingOffers],
      ['', ''],
      ['Discount Type Distribution', ''],
      ['Percentage Discounts', data.offers.filter(o => o.discountType === 'percentage').length],
      ['Fixed Discounts', data.offers.filter(o => o.discountType === 'fixed').length],
      ['Special Offers', data.offers.filter(o => o.discountType === 'special').length]
    ];

    stats.forEach(([label, value]) => {
      sheet.getCell(`A${currentRow}`).value = label;
      sheet.getCell(`B${currentRow}`).value = value;
      if (label && !label.includes('Distribution')) {
        sheet.getCell(`A${currentRow}`).font = { bold: true };
      } else if (label.includes('Distribution')) {
        sheet.getCell(`A${currentRow}`).font = { bold: true, size: 12 };
      }
      currentRow++;
    });

    sheet.getColumn('A').width = 30;
    sheet.getColumn('B').width = 20;
  }

  createOffersDetailsSheet(sheet, offers) {
    // Header with comprehensive columns
    const headers = [
      'Offer ID',
      'Title', 
      'Description', 
      'Discount Type', 
      'Discount Value', 
      'Valid From', 
      'Valid Until', 
      'Min Stay (Days)', 
      'Max Stay (Days)', 
      'Room Type',
      'Total Usage',
      'Max Usage Limit',
      'Status',
      'Created Date'
    ];
    const headerRow = sheet.addRow(headers);
    
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB8' } };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Data rows with complete details
    const currentDate = new Date();
    offers.forEach(offer => {
      let offerStatus = 'Active';
      if (offer.validUntil < currentDate || offer.status === 'inactive') {
        offerStatus = 'Expired';
      } else if (offer.validFrom > currentDate) {
        offerStatus = 'Upcoming';
      }

      const row = sheet.addRow([
        offer.offerId || offer._id?.toString().slice(-8) || 'N/A',
        offer.title || 'Untitled Offer',
        offer.description || 'No description',
        offer.discountType || 'percentage',
        offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`,
        offer.validFrom ? new Date(offer.validFrom).toLocaleDateString() : 'N/A',
        offer.validUntil ? new Date(offer.validUntil).toLocaleDateString() : 'N/A',
        offer.minStay || 1,
        offer.maxStay || 'No limit',
        offer.roomType || 'All rooms',
        offer.usageCount || 0,
        offer.maxUsage || 'Unlimited',
        offerStatus,
        offer.createdAt ? new Date(offer.createdAt).toLocaleDateString() : 'N/A'
      ]);

      // Status color coding
      const statusCell = row.getCell(13);
      if (offerStatus === 'Active') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF90EE90' } };
        statusCell.font = { color: { argb: 'FF006400' }, bold: true };
      } else if (offerStatus === 'Upcoming') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF87CEEB' } };
        statusCell.font = { color: { argb: 'FF000080' }, bold: true };
      } else {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFA500' } };
        statusCell.font = { color: { argb: 'FF8B0000' } };
      }

      // Discount type color coding
      const discountTypeCell = row.getCell(4);
      if (offer.discountType === 'percentage') {
        discountTypeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFADD8E6' } };
      } else {
        discountTypeCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF0B3' } };
      }

      // Usage highlighting
      const usageCell = row.getCell(11);
      const maxUsage = offer.maxUsage;
      if (maxUsage && maxUsage !== 'Unlimited') {
        const usage = offer.usageCount || 0;
        const percentage = (usage / maxUsage) * 100;
        if (percentage >= 90) {
          usageCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFCCCB' } };
          usageCell.font = { bold: true };
        } else if (percentage >= 70) {
          usageCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF99' } };
        }
      }
    });

    // Auto-filter
    sheet.autoFilter = {
      from: 'A1',
      to: `N1`
    };

    // Column widths
    sheet.getColumn('A').width = 15; // Offer ID
    sheet.getColumn('B').width = 30; // Title
    sheet.getColumn('C').width = 45; // Description
    sheet.getColumn('D').width = 15; // Discount Type
    sheet.getColumn('E').width = 15; // Discount Value
    sheet.getColumn('F').width = 15; // Valid From
    sheet.getColumn('G').width = 15; // Valid Until
    sheet.getColumn('H').width = 15; // Min Stay
    sheet.getColumn('I').width = 15; // Max Stay
    sheet.getColumn('J').width = 15; // Room Type
    sheet.getColumn('K').width = 12; // Total Usage
    sheet.getColumn('L').width = 15; // Max Usage
    sheet.getColumn('M').width = 12; // Status
    sheet.getColumn('N').width = 15; // Created Date

    sheet.views = [{ state: 'frozen', ySplit: 1 }];
  }
}

module.exports = new ExcelExportService();
