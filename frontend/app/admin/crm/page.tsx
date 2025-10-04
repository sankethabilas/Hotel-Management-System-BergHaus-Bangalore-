'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { safeApiFetch } from '@/lib/safeFetch';
import Cookies from 'js-cookie';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Reply, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  User,
  Loader2,
  RefreshCw,
  Send,
  Archive,
  Star,
  Download
} from 'lucide-react';

interface ContactMessage {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reasonForContact: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const CRMPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load messages from API
  const loadMessages = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading contact messages from API...');
      
      const result = await safeApiFetch('/contact/messages', {
        credentials: 'include',
      });
      
      if (result.success && result.data?.success) {
        const messages = result.data.data?.messages || result.data.data || [];
        console.log('✅ Successfully loaded messages:', messages.length);
        console.log('📊 Sample message:', messages[0]);
        setMessages(messages);
        setFilteredMessages(messages);
      } else {
        console.error('API Error:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load contact messages",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter messages based on search and filters
  useEffect(() => {
    let filtered = messages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        msg.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(msg => msg.status === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(msg => msg.priority === priorityFilter);
    }

    setFilteredMessages(filtered);
  }, [messages, searchTerm, statusFilter, priorityFilter]);

  // Load messages on component mount
  useEffect(() => {
    loadMessages();
  }, []);

  // Mark message as read
  const markAsRead = async (messageId: string) => {
    try {
      const result = await safeApiFetch(`/contact/messages/${messageId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          status: 'in-progress',
          isRead: true 
        })
      });

      if (result.success) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId ? { ...msg, isRead: true, status: 'in-progress' } : msg
        ));
      } else {
        console.error('Error marking message as read:', result.error);
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  // Send reply to message
  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      setIsReplying(true);
      const result = await safeApiFetch(`/contact/messages/${selectedMessage._id}/response`, {
        method: 'PATCH',
        body: JSON.stringify({ 
          response: replyText,
          respondedBy: 'admin' // In a real app, this would be the actual admin ID
        })
      });

      if (result.success) {
        toast({
          title: "Reply Sent",
          description: "Your reply has been sent to the guest via email",
          variant: "default"
        });
        
        // Update the message in the list
        setMessages(prev => prev.map(msg => 
          msg._id === selectedMessage._id 
            ? { 
                ...msg, 
                response: replyText, 
                status: 'resolved',
                respondedAt: new Date().toISOString(),
                isRead: true
              } 
            : msg
        ));

        setReplyText('');
        setSelectedMessage(null);
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send reply",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive"
      });
    } finally {
      setIsReplying(false);
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <AlertCircle className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Export messages as PDF
  const exportMessagesPDF = async () => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      
      const response = await fetch(`http://localhost:5000/api/contact/export/messages/pdf?${params.toString()}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Create a blob and download it
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contact-messages-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "Contact messages report has been downloaded",
          variant: "default"
        });
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export contact messages PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                📥 Customer Relationship Management
              </h1>
              <p className="text-gray-600">
                Manage guest inquiries and maintain excellent customer relationships
              </p>
              {loading && (
                <div className="flex items-center mt-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading contact messages...
                </div>
              )}
            </div>
            <Button
              onClick={() => loadMessages()}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <p className="text-2xl font-bold text-gray-900">{messages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unread</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {messages.filter(m => !m.isRead).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {messages.filter(m => m.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Star className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {messages.filter(m => m.priority === 'urgent').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={loadMessages} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button 
                onClick={exportMessagesPDF} 
                disabled={isExporting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Messages List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Messages List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Contact Messages ({filteredMessages.length})
            </h2>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading messages...</span>
              </div>
            ) : filteredMessages.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">No messages found</p>
                  <p className="text-sm text-gray-400 mb-4">
                    {messages.length === 0 
                      ? "No contact messages in the database. Try refreshing or check your connection."
                      : "No messages match your current filters. Try adjusting your search criteria."
                    }
                  </p>
                  <Button 
                    onClick={() => loadMessages()} 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </CardContent>
              </Card>
            ) : (
              filteredMessages.map((message) => (
                <Card 
                  key={message._id} 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    selectedMessage?._id === message._id ? 'ring-2 ring-blue-500' : ''
                  } ${!message.isRead ? 'bg-blue-50 border-blue-200' : ''}`}
                  onClick={() => {
                    setSelectedMessage(message);
                    markAsRead(message._id);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{message.fullName}</h3>
                          <p className="text-sm text-gray-600">{message.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(message.status)}>
                          {getStatusIcon(message.status)}
                          <span className="ml-1 capitalize">{message.status}</span>
                        </Badge>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-2">{message.subject}</h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {message.message}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(message.createdAt)}
                        </span>
                        <span className="capitalize">{message.reasonForContact}</span>
                      </div>
                      {!message.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Message Details and Reply */}
          <div>
            {selectedMessage ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Message Details</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(selectedMessage.status)}>
                        {getStatusIcon(selectedMessage.status)}
                        <span className="ml-1 capitalize">{selectedMessage.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(selectedMessage.priority)}>
                        {selectedMessage.priority}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Guest Information */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Guest Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-500 mr-2" />
                        <span className="font-medium">{selectedMessage.fullName}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{selectedMessage.email}</span>
                      </div>
                      {selectedMessage.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-2" />
                          <span>{selectedMessage.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{formatDate(selectedMessage.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Original Message */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Original Message</h3>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">{selectedMessage.subject}</h4>
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                    </div>
                  </div>

                  {/* Previous Reply */}
                  {selectedMessage.response && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">Previous Reply</h3>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.response}</p>
                        {selectedMessage.respondedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Replied on {formatDate(selectedMessage.respondedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Send Reply</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reply">Your Reply</Label>
                        <Textarea
                          id="reply"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Type your reply here..."
                          className="mt-1 min-h-[120px]"
                        />
                      </div>
                      <Button 
                        onClick={sendReply} 
                        disabled={!replyText.trim() || isReplying}
                        className="w-full"
                      >
                        {isReplying ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending Reply...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Select a message to view details and reply</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRMPage;
