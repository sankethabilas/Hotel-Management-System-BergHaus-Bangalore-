'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { safeApiFetch } from '@/lib/safeFetch';
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  User, 
  Mail, 
  Phone,
  CheckCircle,
  Clock,
  Archive,
  Loader2,
  RefreshCw,
  Eye,
  Reply,
  Download
} from 'lucide-react';

interface ReplyHistory {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  reasonForContact: string;
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  response?: string;
  respondedAt?: string;
  respondedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const ReplyHistoryPage = () => {
  const [replies, setReplies] = useState<ReplyHistory[]>([]);
  const [filteredReplies, setFilteredReplies] = useState<ReplyHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReply, setSelectedReply] = useState<ReplyHistory | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Load replies from API
  const loadReplies = async () => {
    try {
      setLoading(true);
      const result = await safeApiFetch('/contact/messages', {
        credentials: 'include',
      });
      
      if (result.success && result.data?.success) {
        // Filter only messages that have replies
        const messages = result.data.data?.messages || result.data.data || [];
        const messagesWithReplies = messages.filter((msg: ReplyHistory) => msg.response);
        setReplies(messagesWithReplies);
        setFilteredReplies(messagesWithReplies);
      } else {
        console.error('API Error:', result.error);
        toast({
          title: "Error",
          description: result.error || "Failed to load reply history",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading replies:', error);
      toast({
        title: "Error",
        description: "Failed to load reply history. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter replies based on search and filters
  useEffect(() => {
    let filtered = replies;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reply => 
        reply.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reply.response?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reply => reply.status === statusFilter);
    }

    setFilteredReplies(filtered);
  }, [replies, searchTerm, statusFilter]);

  // Export replies as PDF
  const exportRepliesPDF = async () => {
    try {
      setIsExporting(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const response = await fetch(`http://localhost:5000/api/contact/export/replies/pdf?${params.toString()}`);
      
      if (response.ok) {
        const html = await response.text();
        
        // Create a blob and download it
        const blob = new Blob([html], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reply-history-${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Export Successful",
          description: "Reply history report has been downloaded",
          variant: "default"
        });
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export reply history PDF",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Load replies on component mount
  useEffect(() => {
    loadReplies();
  }, []);

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
      case 'new': return <Clock className="h-4 w-4" />;
      case 'in-progress': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <Archive className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📤 Reply History
          </h1>
          <p className="text-gray-600">
            View all guest inquiries and their corresponding replies
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Reply className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Replies</p>
                  <p className="text-2xl font-bold text-gray-900">{replies.length}</p>
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
                    {replies.filter(r => r.status === 'resolved').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">In Progress</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {replies.filter(r => r.status === 'in-progress').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Archive className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Closed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {replies.filter(r => r.status === 'closed').length}
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
                    placeholder="Search replies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <Button onClick={loadReplies} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              
              <Button 
                onClick={exportRepliesPDF} 
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

        {/* Replies List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Reply History ({filteredReplies.length})
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Loading replies...</span>
            </div>
          ) : filteredReplies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Reply className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No replies found</p>
              </CardContent>
            </Card>
          ) : (
            filteredReplies.map((reply) => (
              <Card 
                key={reply._id} 
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  selectedReply?._id === reply._id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedReply(reply)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{reply.fullName}</h3>
                        <p className="text-sm text-gray-600">{reply.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(reply.status)}>
                        {getStatusIcon(reply.status)}
                        <span className="ml-1 capitalize">{reply.status}</span>
                      </Badge>
                      <Badge className={getPriorityColor(reply.priority)}>
                        {reply.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Original Message</h4>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">{reply.subject}</p>
                        <p className="text-sm text-gray-700 line-clamp-3">{reply.message}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Our Reply</h4>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 line-clamp-3">{reply.response}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(reply.createdAt)}
                      </span>
                      {reply.respondedAt && (
                        <span className="flex items-center">
                          <Reply className="h-3 w-3 mr-1" />
                          Replied: {formatDate(reply.respondedAt)}
                        </span>
                      )}
                      <span className="capitalize">{reply.reasonForContact}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReply(reply);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Reply Details Modal */}
        {selectedReply && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Reply Details</span>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedReply(null)}
                  >
                    Close
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Guest Information */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Guest Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-500 mr-2" />
                      <span className="font-medium">{selectedReply.fullName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-500 mr-2" />
                      <span>{selectedReply.email}</span>
                    </div>
                    {selectedReply.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-500 mr-2" />
                        <span>{selectedReply.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                      <span>Received: {formatDate(selectedReply.createdAt)}</span>
                    </div>
                    {selectedReply.respondedAt && (
                      <div className="flex items-center">
                        <Reply className="h-4 w-4 text-gray-500 mr-2" />
                        <span>Replied: {formatDate(selectedReply.respondedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Original Message */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Original Message</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{selectedReply.subject}</h4>
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReply.message}</p>
                  </div>
                </div>

                {/* Reply */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Our Reply</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReply.response}</p>
                  </div>
                </div>

                {/* Status and Priority */}
                <div className="flex items-center space-x-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedReply.status)}`}>
                      {getStatusIcon(selectedReply.status)}
                      <span className="ml-1 capitalize">{selectedReply.status}</span>
                    </Badge>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Priority:</span>
                    <Badge className={`ml-2 ${getPriorityColor(selectedReply.priority)}`}>
                      {selectedReply.priority}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReplyHistoryPage;
