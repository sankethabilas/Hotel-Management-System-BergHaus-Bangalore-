const fs = require('fs');
const path = require('path');

class HtmlPdfService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.ensureTempDir();
  }

  ensureTempDir() {
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  generateContactMessagesPDF(messages, filters = {}) {
    const html = this.generateContactMessagesHTML(messages, filters);
    const filename = `contact-messages-${Date.now()}.html`;
    const filepath = path.join(this.tempDir, filename);
    
    fs.writeFileSync(filepath, html);
    
    return {
      success: true,
      message: 'HTML report generated successfully',
      filename: filename,
      filepath: filepath,
      html: html
    };
  }

  generateReplyHistoryPDF(replies, filters = {}) {
    const html = this.generateReplyHistoryHTML(replies, filters);
    const filename = `reply-history-${Date.now()}.html`;
    const filepath = path.join(this.tempDir, filename);
    
    fs.writeFileSync(filepath, html);
    
    return {
      success: true,
      message: 'HTML report generated successfully',
      filename: filename,
      filepath: filepath,
      html: html
    };
  }

  generateAnalyticsPDF(analytics, dateRange = '7 days') {
    const html = this.generateAnalyticsHTML(analytics, dateRange);
    const filename = `crm-analytics-${Date.now()}.html`;
    const filepath = path.join(this.tempDir, filename);
    
    fs.writeFileSync(filepath, html);
    
    return {
      success: true,
      message: 'HTML report generated successfully',
      filename: filename,
      filepath: filepath,
      html: html
    };
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
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
          }
          .header { 
            background: linear-gradient(135deg, #006bb8, #2fa0df); 
            color: white; 
            padding: 30px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .summary { 
            background: #f8f9fa; 
            padding: 25px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            border-left: 5px solid #006bb8;
          }
          .summary h2 { margin: 0 0 20px 0; color: #006bb8; font-size: 20px; }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(5, 1fr); 
            gap: 20px; 
          }
          .summary-item { 
            text-align: center; 
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-item .number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #006bb8; 
            margin-bottom: 5px;
          }
          .summary-item .label { 
            font-size: 14px; 
            color: #666; 
            font-weight: 500;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background: #006bb8; 
            color: white; 
            font-weight: 600;
            font-size: 14px;
          }
          td {
            font-size: 13px;
          }
          .status-new { color: #3B82F6; font-weight: bold; }
          .status-in-progress { color: #F59E0B; font-weight: bold; }
          .status-resolved { color: #10B981; font-weight: bold; }
          .status-closed { color: #6B7280; font-weight: bold; }
          .priority-high { color: #EF4444; font-weight: bold; }
          .priority-medium { color: #F59E0B; font-weight: bold; }
          .priority-low { color: #10B981; font-weight: bold; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #006bb8; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
          }
          .print-button {
            background: #006bb8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .print-button:hover {
            background: #0056a3;
          }
          .instructions {
            background: #e8f4f8;
            border: 1px solid #006bb8;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          .instructions h3 {
            margin: 0 0 10px 0;
            color: #006bb8;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #333;
            font-size: 14px;
          }
          @media print {
            .print-button, .instructions { display: none; }
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
        
        <div class="instructions">
          <h3>📄 How to Save as PDF</h3>
          <p><strong>Method 1:</strong> Click the "Print / Save as PDF" button above, then select "Save as PDF" in the print dialog</p>
          <p><strong>Method 2:</strong> Press Ctrl+P (or Cmd+P on Mac), then select "Save as PDF" as the destination</p>
          <p><strong>Method 3:</strong> Right-click on this page and select "Print", then choose "Save as PDF"</p>
        </div>
        
        <div class="header">
          <h1>🏨 Berghaus Bungalow HMS</h1>
          <p>Contact Messages Report - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>📊 Summary Overview</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${totalMessages}</div>
              <div class="label">Total Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${unreadMessages}</div>
              <div class="label">Unread Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${resolvedMessages}</div>
              <div class="label">Resolved Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${urgentMessages}</div>
              <div class="label">Urgent Messages</div>
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
              <th>👤 Name</th>
              <th>📧 Email</th>
              <th>📝 Subject</th>
              <th>🎯 Reason</th>
              <th>📊 Status</th>
              <th>⚡ Priority</th>
              <th>👁️ Read</th>
              <th>📅 Date</th>
            </tr>
          </thead>
          <tbody>
            ${messages.map(msg => `
              <tr>
                <td><strong>${msg.fullName}</strong></td>
                <td>${msg.email}</td>
                <td>${msg.subject}</td>
                <td>${msg.reasonForContact}</td>
                <td class="status-${msg.status}">${msg.status.toUpperCase()}</td>
                <td class="priority-${msg.priority}">${msg.priority.toUpperCase()}</td>
                <td>${msg.isRead ? '✅ Yes' : '❌ No'}</td>
                <td>${new Date(msg.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Berghaus Bungalow Hotel Management System</strong></p>
          <p>Generated on ${new Date().toLocaleString()} | Ella, Sri Lanka</p>
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
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
          }
          .header { 
            background: linear-gradient(135deg, #006bb8, #2fa0df); 
            color: white; 
            padding: 30px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .summary { 
            background: #f8f9fa; 
            padding: 25px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            border-left: 5px solid #006bb8;
          }
          .summary h2 { margin: 0 0 20px 0; color: #006bb8; font-size: 20px; }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(4, 1fr); 
            gap: 20px; 
          }
          .summary-item { 
            text-align: center; 
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-item .number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #006bb8; 
            margin-bottom: 5px;
          }
          .summary-item .label { 
            font-size: 14px; 
            color: #666; 
            font-weight: 500;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px; 
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background: #006bb8; 
            color: white; 
            font-weight: 600;
            font-size: 14px;
          }
          td {
            font-size: 13px;
          }
          .status-new { color: #3B82F6; font-weight: bold; }
          .status-in-progress { color: #F59E0B; font-weight: bold; }
          .status-resolved { color: #10B981; font-weight: bold; }
          .status-closed { color: #6B7280; font-weight: bold; }
          .priority-high { color: #EF4444; font-weight: bold; }
          .priority-medium { color: #F59E0B; font-weight: bold; }
          .priority-low { color: #10B981; font-weight: bold; }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #006bb8; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
          }
          .print-button {
            background: #006bb8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .print-button:hover {
            background: #0056a3;
          }
          .instructions {
            background: #e8f4f8;
            border: 1px solid #006bb8;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          .instructions h3 {
            margin: 0 0 10px 0;
            color: #006bb8;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #333;
            font-size: 14px;
          }
          @media print {
            .print-button, .instructions { display: none; }
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
        
        <div class="instructions">
          <h3>📄 How to Save as PDF</h3>
          <p><strong>Method 1:</strong> Click the "Print / Save as PDF" button above, then select "Save as PDF" in the print dialog</p>
          <p><strong>Method 2:</strong> Press Ctrl+P (or Cmd+P on Mac), then select "Save as PDF" as the destination</p>
          <p><strong>Method 3:</strong> Right-click on this page and select "Print", then choose "Save as PDF"</p>
        </div>
        
        <div class="header">
          <h1>🏨 Berghaus Bungalow HMS</h1>
          <p>Reply History Report - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>📊 Reply History Summary</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${totalReplies}</div>
              <div class="label">Total Replies</div>
            </div>
            <div class="summary-item">
              <div class="number">${resolvedReplies}</div>
              <div class="label">Resolved Conversations</div>
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
              <th>👤 Name</th>
              <th>📧 Email</th>
              <th>📝 Subject</th>
              <th>📊 Status</th>
              <th>⚡ Priority</th>
              <th>📅 Received</th>
              <th>💬 Replied</th>
            </tr>
          </thead>
          <tbody>
            ${replies.map(reply => `
              <tr>
                <td><strong>${reply.fullName}</strong></td>
                <td>${reply.email}</td>
                <td>${reply.subject}</td>
                <td class="status-${reply.status}">${reply.status.toUpperCase()}</td>
                <td class="priority-${reply.priority}">${reply.priority.toUpperCase()}</td>
                <td>${new Date(reply.createdAt).toLocaleDateString()}</td>
                <td>${reply.respondedAt ? new Date(reply.respondedAt).toLocaleDateString() : 'N/A'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p><strong>Berghaus Bungalow Hotel Management System</strong></p>
          <p>Generated on ${new Date().toLocaleString()} | Ella, Sri Lanka</p>
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
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
          }
          .header { 
            background: linear-gradient(135deg, #006bb8, #2fa0df); 
            color: white; 
            padding: 30px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            text-align: center;
          }
          .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
          .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .summary { 
            background: #f8f9fa; 
            padding: 25px; 
            margin-bottom: 30px; 
            border-radius: 10px;
            border-left: 5px solid #006bb8;
          }
          .summary h2 { margin: 0 0 20px 0; color: #006bb8; font-size: 20px; }
          .summary-grid { 
            display: grid; 
            grid-template-columns: repeat(6, 1fr); 
            gap: 20px; 
          }
          .summary-item { 
            text-align: center; 
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-item .number { 
            font-size: 32px; 
            font-weight: bold; 
            color: #006bb8; 
            margin-bottom: 5px;
          }
          .summary-item .label { 
            font-size: 14px; 
            color: #666; 
            font-weight: 500;
          }
          .charts { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 30px; 
            margin-top: 30px; 
          }
          .chart { 
            background: #f8f9fa; 
            padding: 25px; 
            border-radius: 10px;
            border-left: 5px solid #006bb8;
          }
          .chart h3 { 
            margin: 0 0 20px 0; 
            color: #006bb8; 
            font-size: 18px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
          }
          th, td { 
            border: 1px solid #e5e7eb; 
            padding: 12px; 
            text-align: left; 
          }
          th { 
            background: #006bb8; 
            color: white; 
            font-weight: 600;
          }
          .footer { 
            margin-top: 40px; 
            padding-top: 20px; 
            border-top: 2px solid #006bb8; 
            text-align: center; 
            color: #666; 
            font-size: 14px; 
          }
          .print-button {
            background: #006bb8;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .print-button:hover {
            background: #0056a3;
          }
          .instructions {
            background: #e8f4f8;
            border: 1px solid #006bb8;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            text-align: center;
          }
          .instructions h3 {
            margin: 0 0 10px 0;
            color: #006bb8;
            font-size: 16px;
          }
          .instructions p {
            margin: 5px 0;
            color: #333;
            font-size: 14px;
          }
          @media print {
            .print-button, .instructions { display: none; }
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
        
        <div class="instructions">
          <h3>📄 How to Save as PDF</h3>
          <p><strong>Method 1:</strong> Click the "Print / Save as PDF" button above, then select "Save as PDF" in the print dialog</p>
          <p><strong>Method 2:</strong> Press Ctrl+P (or Cmd+P on Mac), then select "Save as PDF" as the destination</p>
          <p><strong>Method 3:</strong> Right-click on this page and select "Print", then choose "Save as PDF"</p>
        </div>
        
        <div class="header">
          <h1>🏨 Berghaus Bungalow HMS</h1>
          <p>CRM Analytics Report (Last ${dateRange}) - Generated on ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="summary">
          <h2>📊 Key Metrics</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="number">${analytics.totalMessages}</div>
              <div class="label">Total Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.unreadMessages}</div>
              <div class="label">Unread Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.resolvedMessages}</div>
              <div class="label">Resolved Messages</div>
            </div>
            <div class="summary-item">
              <div class="number">${analytics.urgentMessages}</div>
              <div class="label">Urgent Messages</div>
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
            <h3>📊 Messages by Status</h3>
            <table>
              <thead>
                <tr><th>Status</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByStatus.map(item => `
                  <tr><td><strong>${item.status.toUpperCase()}</strong></td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart">
            <h3>⚡ Messages by Priority</h3>
            <table>
              <thead>
                <tr><th>Priority</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByPriority.map(item => `
                  <tr><td><strong>${item.priority.toUpperCase()}</strong></td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="chart">
            <h3>🎯 Messages by Reason</h3>
            <table>
              <thead>
                <tr><th>Reason</th><th>Count</th></tr>
              </thead>
              <tbody>
                ${analytics.messagesByReason.map(item => `
                  <tr><td><strong>${item.reason.toUpperCase()}</strong></td><td>${item.count}</td></tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Berghaus Bungalow Hotel Management System</strong></p>
          <p>Generated on ${new Date().toLocaleString()} | Ella, Sri Lanka</p>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = HtmlPdfService;
