const { jsPDF } = require('jspdf');
require('jspdf-autotable');

class CRMPdfService {
  constructor() {
    this.doc = null;
  }

  // Create a new PDF document
  createDocument(title) {
    this.doc = new jsPDF();
    
    // Add header
    this.addHeader(title);
    
    return this.doc;
  }

  // Add header to PDF
  addHeader(title) {
    // Hotel logo area (placeholder)
    this.doc.setFillColor(0, 107, 184); // #006bb8
    this.doc.rect(0, 0, 210, 30, 'F');
    
    // Hotel name
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Berghaus Bungalow HMS', 20, 20);
    
    // Report title
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(title, 20, 45);
    
    // Date and time
    this.doc.setFontSize(10);
    this.doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 55);
    
    // Line separator
    this.doc.setDrawColor(0, 107, 184);
    this.doc.setLineWidth(0.5);
    this.doc.line(20, 60, 190, 60);
  }

  // Export contact messages report
  exportContactMessages(messages, filters = {}) {
    this.createDocument('Contact Messages Report');
    
    // Summary section
    this.addSummarySection(messages, filters);
    
    // Messages table
    this.addMessagesTable(messages);
    
    // Footer
    this.addFooter();
    
    return this.doc;
  }

  // Export reply history report
  exportReplyHistory(replies, filters = {}) {
    this.createDocument('Reply History Report');
    
    // Summary section
    this.addReplySummarySection(replies, filters);
    
    // Replies table
    this.addRepliesTable(replies);
    
    // Footer
    this.addFooter();
    
    return this.doc;
  }

  // Export CRM analytics report
  exportAnalytics(analytics, dateRange = '7 days') {
    this.createDocument('CRM Analytics Report');
    
    // Analytics summary
    this.addAnalyticsSummary(analytics, dateRange);
    
    // Charts data (as tables)
    this.addAnalyticsTables(analytics);
    
    // Footer
    this.addFooter();
    
    return this.doc;
  }

  // Add summary section for contact messages
  addSummarySection(messages, filters) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Summary', 20, 75);
    
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => !m.isRead).length;
    const resolvedMessages = messages.filter(m => m.status === 'resolved').length;
    const urgentMessages = messages.filter(m => m.priority === 'urgent').length;
    
    const summaryData = [
      ['Total Messages', totalMessages.toString()],
      ['Unread Messages', unreadMessages.toString()],
      ['Resolved Messages', resolvedMessages.toString()],
      ['Urgent Messages', urgentMessages.toString()],
      ['Resolution Rate', `${((resolvedMessages / totalMessages) * 100).toFixed(1)}%`]
    ];
    
    this.doc.autoTable({
      startY: 85,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
  }

  // Add summary section for reply history
  addReplySummarySection(replies, filters) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Reply History Summary', 20, 75);
    
    const totalReplies = replies.length;
    const resolvedReplies = replies.filter(r => r.status === 'resolved').length;
    const inProgressReplies = replies.filter(r => r.status === 'in-progress').length;
    
    const summaryData = [
      ['Total Replies', totalReplies.toString()],
      ['Resolved Conversations', resolvedReplies.toString()],
      ['In Progress', inProgressReplies.toString()],
      ['Resolution Rate', `${((resolvedReplies / totalReplies) * 100).toFixed(1)}%`]
    ];
    
    this.doc.autoTable({
      startY: 85,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
  }

  // Add analytics summary
  addAnalyticsSummary(analytics, dateRange) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`Analytics Summary (Last ${dateRange})`, 20, 75);
    
    const summaryData = [
      ['Total Messages', analytics.totalMessages.toString()],
      ['Unread Messages', analytics.unreadMessages.toString()],
      ['Resolved Messages', analytics.resolvedMessages.toString()],
      ['Urgent Messages', analytics.urgentMessages.toString()],
      ['Average Response Time', `${analytics.averageResponseTime} hours`],
      ['Resolution Rate', `${((analytics.resolvedMessages / analytics.totalMessages) * 100).toFixed(1)}%`]
    ];
    
    this.doc.autoTable({
      startY: 85,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'right' }
      }
    });
  }

  // Add messages table
  addMessagesTable(messages) {
    const tableData = messages.map(msg => [
      msg.fullName,
      msg.email,
      msg.subject,
      msg.reasonForContact,
      msg.status,
      msg.priority,
      msg.isRead ? 'Yes' : 'No',
      new Date(msg.createdAt).toLocaleDateString()
    ]);

    this.doc.autoTable({
      startY: this.doc.lastAutoTable.finalY + 20,
      head: [['Name', 'Email', 'Subject', 'Reason', 'Status', 'Priority', 'Read', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 20 },
        4: { cellWidth: 15 },
        5: { cellWidth: 15 },
        6: { cellWidth: 10 },
        7: { cellWidth: 20 }
      },
      didDrawPage: (data) => {
        // Add page numbers
        this.doc.setFontSize(8);
        this.doc.text(`Page ${this.doc.internal.getNumberOfPages()}`, 190, 290);
      }
    });
  }

  // Add replies table
  addRepliesTable(replies) {
    const tableData = replies.map(reply => [
      reply.fullName,
      reply.email,
      reply.subject,
      reply.status,
      reply.priority,
      new Date(reply.createdAt).toLocaleDateString(),
      reply.respondedAt ? new Date(reply.respondedAt).toLocaleDateString() : 'N/A'
    ]);

    this.doc.autoTable({
      startY: this.doc.lastAutoTable.finalY + 20,
      head: [['Name', 'Email', 'Subject', 'Status', 'Priority', 'Received', 'Replied']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 15 },
        4: { cellWidth: 15 },
        5: { cellWidth: 20 },
        6: { cellWidth: 20 }
      },
      didDrawPage: (data) => {
        this.doc.setFontSize(8);
        this.doc.text(`Page ${this.doc.internal.getNumberOfPages()}`, 190, 290);
      }
    });
  }

  // Add analytics tables
  addAnalyticsTables(analytics) {
    // Messages by status
    if (analytics.messagesByStatus && analytics.messagesByStatus.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Messages by Status', 20, this.doc.lastAutoTable.finalY + 20);
      
      const statusData = analytics.messagesByStatus.map(item => [
        item.status.charAt(0).toUpperCase() + item.status.slice(1),
        item.count.toString()
      ]);

      this.doc.autoTable({
        startY: this.doc.lastAutoTable.finalY + 30,
        head: [['Status', 'Count']],
        body: statusData,
        theme: 'grid',
        headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
    }

    // Messages by priority
    if (analytics.messagesByPriority && analytics.messagesByPriority.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Messages by Priority', 20, this.doc.lastAutoTable.finalY + 20);
      
      const priorityData = analytics.messagesByPriority.map(item => [
        item.priority.charAt(0).toUpperCase() + item.priority.slice(1),
        item.count.toString()
      ]);

      this.doc.autoTable({
        startY: this.doc.lastAutoTable.finalY + 30,
        head: [['Priority', 'Count']],
        body: priorityData,
        theme: 'grid',
        headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
    }

    // Messages by reason
    if (analytics.messagesByReason && analytics.messagesByReason.length > 0) {
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Messages by Reason', 20, this.doc.lastAutoTable.finalY + 20);
      
      const reasonData = analytics.messagesByReason.map(item => [
        item.reason.charAt(0).toUpperCase() + item.reason.slice(1),
        item.count.toString()
      ]);

      this.doc.autoTable({
        startY: this.doc.lastAutoTable.finalY + 30,
        head: [['Reason', 'Count']],
        body: reasonData,
        theme: 'grid',
        headStyles: { fillColor: [0, 107, 184], textColor: [255, 255, 255] },
        styles: { fontSize: 10 }
      });
    }
  }

  // Add footer
  addFooter() {
    const pageCount = this.doc.internal.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(0, 107, 184);
      this.doc.setLineWidth(0.5);
      this.doc.line(20, 280, 190, 280);
      
      // Footer text
      this.doc.setFontSize(8);
      this.doc.setTextColor(100, 100, 100);
      this.doc.text('Berghaus Bungalow Hotel Management System', 20, 285);
      this.doc.text(`Page ${i} of ${pageCount}`, 190, 285, { align: 'right' });
    }
  }

  // Generate PDF buffer
  generatePdfBuffer() {
    return this.doc.output('arraybuffer');
  }

  // Generate PDF base64
  generatePdfBase64() {
    return this.doc.output('datauristring');
  }
}

module.exports = CRMPdfService;
