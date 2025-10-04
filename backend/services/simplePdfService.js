const puppeteer = require('puppeteer');

class SimplePdfService {
  constructor() {
    this.browser = null;
  }

  async init() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async generateContactMessagesPDF(messages, filters = {}) {
    await this.init();
    const page = await this.browser.newPage();
    
    const html = this.generateContactMessagesHTML(messages, filters);
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await page.close();
    return pdf;
  }

  async generateReplyHistoryPDF(replies, filters = {}) {
    await this.init();
    const page = await this.browser.newPage();
    
    const html = this.generateReplyHistoryHTML(replies, filters);
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await page.close();
    return pdf;
  }

  async generateAnalyticsPDF(analytics, dateRange = '7 days') {
    await this.init();
    const page = await this.browser.newPage();
    
    const html = this.generateAnalyticsHTML(analytics, dateRange);
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await page.close();
    return pdf;
  }

  generateContactMessagesHTML(messages, filters) {
    const totalMessages = messages.length;
    const unreadMessages = messages.filter(m => !m.isRead).length;
    const resolvedMessages = messages.filter(m => m.status === 'resolved').length;
    const urgentMessages = messages.filter(m => m.priority === 'urgent').length;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Contact Messages Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #006bb8; color: white; padding: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; font-size: 14px; }
          .summary { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .summary h2 { margin: 0 0 10px 0; color: #006bb8; }
          .summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-item .number { font-size: 24px; font-weight: bold; color: #006bb8; }
          .summary-item .label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #006bb8; color: white; }
          .status-new { color: #3B82F6; font-weight: bold; }
          .status-in-progress { color: #F59E0B; font-weight: bold; }
          .status-resolved { color: #10B981; font-weight: bold; }
          .status-closed { color: #6B7280; font-weight: bold; }
          .priority-high { color: #EF4444; font-weight: bold; }
          .priority-medium { color: #F59E0B; font-weight: bold; }
          .priority-low { color: #10B981; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Berghaus Bungalow HMS</h1>
          <p>Contact Messages Report - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${totalMessages}</div>
              <div class="label">Total Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${unreadMessages}</div>
              <div class="label">Unread</div>
            </div>
            <div class="summary-item">
              <div class="number">${resolvedMessages}</div>
              <div class="label">Resolved</div>
            </div>
            <div class="summary-item">
              <div class="number">${urgentMessages}</div>
              <div class="label">Urgent</div>
            </div>
            <div class="summary-item">
              <div class="number">${((resolvedMessages / totalMessages) * 100).toFixed(1)}%</div>
              <div class="label">Resolution Rate</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Read</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${messages.map(msg => `
              <tr>
                <td>${msg.fullName}</td>
                <td>${msg.email}</td>
                <td>${msg.subject}</td>
                <td>${msg.reasonForContact}</td>
                <td class="status-${msg.status}">${msg.status}</td>
                <td class="priority-${msg.priority}">${msg.priority}</td>
                <td>${msg.isRead ? 'Yes' : 'No'}</td>
                <td>${new Date(msg.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Berghaus Bungalow Hotel Management System | Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  generateReplyHistoryHTML(replies, filters) {
    const totalReplies = replies.length;
    const resolvedReplies = replies.filter(r => r.status === 'resolved').length;
    const inProgressReplies = replies.filter(r => r.status === 'in-progress').length;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reply History Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #006bb8; color: white; padding: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; font-size: 14px; }
          .summary { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .summary h2 { margin: 0 0 10px 0; color: #006bb8; }
          .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-item .number { font-size: 24px; font-weight: bold; color: #006bb8; }
          .summary-item .label { font-size: 12px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #006bb8; color: white; }
          .status-new { color: #3B82F6; font-weight: bold; }
          .status-in-progress { color: #F59E0B; font-weight: bold; }
          .status-resolved { color: #10B981; font-weight: bold; }
          .status-closed { color: #6B7280; font-weight: bold; }
          .priority-high { color: #EF4444; font-weight: bold; }
          .priority-medium { color: #F59E0B; font-weight: bold; }
          .priority-low { color: #10B981; font-weight: bold; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Berghaus Bungalow HMS</h1>
          <p>Reply History Report - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>Reply History Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${totalReplies}</div>
              <div class="label">Total Replies</div>
            </div>
            <div class="summary-item">
              <div class="number">${resolvedReplies}</div>
              <div class="label">Resolved</div>
            </div>
            <div class="summary-item">
              <div class="number">${inProgressReplies}</div>
              <div class="label">In Progress</div>
            </div>
            <div class="summary-item">
              <div class="number">${((resolvedReplies / totalReplies) * 100).toFixed(1)}%</div>
              <div class="label">Resolution Rate</div>
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Received</th>
              <th>Replied</th>
            </tr>
          </thead>
          <tbody>
            ${replies.map(reply => `
              <tr>
                <td>${reply.fullName}</td>
                <td>${reply.email}</td>
                <td>${reply.subject}</td>
                <td class="status-${reply.status}">${reply.status}</td>
                <td class="priority-${reply.priority}">${reply.priority}</td>
                <td>${new Date(reply.createdAt).toLocaleDateString()}</td>
                <td>${reply.respondedAt ? new Date(reply.respondedAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Berghaus Bungalow Hotel Management System | Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  generateAnalyticsHTML(analytics, dateRange) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>CRM Analytics Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .header { background: #006bb8; color: white; padding: 20px; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 24px; }
          .header p { margin: 5px 0 0 0; font-size: 14px; }
          .summary { background: #f8f9fa; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
          .summary h2 { margin: 0 0 10px 0; color: #006bb8; }
          .summary-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; }
          .summary-item { text-align: center; }
          .summary-item .number { font-size: 24px; font-weight: bold; color: #006bb8; }
          .summary-item .label { font-size: 12px; color: #666; }
          .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
          .chart { background: #f8f9fa; padding: 15px; border-radius: 5px; }
          .chart h3 { margin: 0 0 15px 0; color: #006bb8; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #006bb8; color: white; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Berghaus Bungalow HMS</h1>
          <p>CRM Analytics Report (Last ${dateRange}) - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>Key Metrics</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${analytics.totalMessages}</div>
              <div class="label">Total Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.unreadMessages}</div>
              <div class="label">Unread</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.resolvedMessages}</div>
              <div class="label">Resolved</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.urgentMessages}</div>
              <div class="label">Urgent</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.averageResponseTime}h</div>
              <div class="label">Avg Response Time</div>
            </div>
            <div class="summary-item">
              <div class="number">${((analytics.resolvedMessages / analytics.totalMessages) * 100).toFixed(1)}%</div>
              <div class="label">Resolution Rate</div>
            </div>
          </div>
        </div>
        
        <div class="charts">
          <div class="chart">
            <h3>Messages by Status</h3>
            <table>
              <thead>
                <tr><th>Status</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByStatus.map(item => `
                  <tr><td>${item.status}</td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart">
            <h3>Messages by Priority</h3>
            <table>
              <thead>
                <tr><th>Priority</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByPriority.map(item => `
                  <tr><td>${item.priority}</td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart">
            <h3>Messages by Reason</h3>
            <table>
              <thead>
                <tr><th>Reason</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByReason.map(item => `
                  <tr><td>${item.reason}</td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p>Berghaus Bungalow Hotel Management System | Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `;
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = SimplePdfService;
