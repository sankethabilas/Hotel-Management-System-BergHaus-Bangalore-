'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search,
  Receipt,
  Download,
  Mail,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  User,
  CreditCard,
  FileText,
  Minus
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Bill {
  _id: string;
  billId: string;
  reservationId: {
    _id: string;
    reservationId: string;
    checkInDate: string;
    checkOutDate: string;
  };
  guestName: string;
  guestEmail: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    category: string;
  }>;
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  status: string;
  paymentMethod?: string;
  paidAmount: number;
  dueDate: string;
  paidDate?: string;
  notes?: string;
  createdAt: string;
  balance: number;
  paymentStatus: string;
}

interface BillItem {
  description: string;
  quantity: number;
  unitPrice: number;
  category: string;
}

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [viewDialog, setViewDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [addItemDialog, setAddItemDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [newItem, setNewItem] = useState<BillItem>({
    description: '',
    quantity: 1,
    unitPrice: 0,
    category: 'other'
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchBills();
  }, [statusFilter]);

  const fetchBills = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      const response = await fetch(`/api/bills?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBills(data.data.bills);
      } else {
        toast({
          title: "Error",
          description: "Failed to load bills",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewBill = (bill: Bill) => {
    setSelectedBill(bill);
    setViewDialog(true);
  };

  const handleAddPayment = (bill: Bill) => {
    setSelectedBill(bill);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentNotes('');
    setPaymentDialog(true);
  };

  const handleAddItem = (bill: Bill) => {
    setSelectedBill(bill);
    setNewItem({
      description: '',
      quantity: 1,
      unitPrice: 0,
      category: 'other'
    });
    setAddItemDialog(true);
  };

  const executePayment = async () => {
    if (!selectedBill || !paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid payment amount",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/bills/${selectedBill._id}/payment`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          notes: paymentNotes
        })
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Payment added successfully",
        });
        
        fetchBills();
        setPaymentDialog(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      toast({
        title: "Error",
        description: "Failed to add payment",
        variant: "destructive",
      });
    }
  };

  const executeAddItem = async () => {
    if (!selectedBill || !newItem.description || newItem.quantity <= 0 || newItem.unitPrice <= 0) {
      toast({
        title: "Error",
        description: "Please fill in all item details",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/bills/${selectedBill._id}/items`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newItem)
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Item added to bill successfully",
        });
        
        fetchBills();
        setAddItemDialog(false);
      } else {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message || "Failed to add item",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    }
  };

  const downloadBill = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/download`, {
        credentials: 'include'
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `bill-${billId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "Bill downloaded successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to download bill",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast({
        title: "Error",
        description: "Failed to download bill",
        variant: "destructive",
      });
    }
  };

  const emailBill = async (billId: string) => {
    try {
      const response = await fetch(`/api/bills/${billId}/email`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Bill emailed successfully",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to email bill",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error emailing bill:', error);
      toast({
        title: "Error",
        description: "Failed to email bill",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'draft': { label: 'Draft', variant: 'secondary' as const },
      'pending': { label: 'Pending', variant: 'default' as const },
      'paid': { label: 'Paid', variant: 'default' as const },
      'partial': { label: 'Partial', variant: 'secondary' as const },
      'overdue': { label: 'Overdue', variant: 'destructive' as const },
      'cancelled': { label: 'Cancelled', variant: 'outline' as const }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <Badge variant={config.variant} className={
        status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
        status === 'pending' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : ''
      }>
        {config.label}
      </Badge>
    );
  };

  const filteredBills = bills.filter(bill =>
    bill.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.billId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bill.guestEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006bb8] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#006bb8]">Bills & Payments</h1>
          <p className="text-gray-600">Manage guest bills and payment processing</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by guest name, bill ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-[#006bb8]">
            <Receipt className="w-5 h-5 mr-2" />
            Bills ({filteredBills.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bill ID</TableHead>
                <TableHead>Guest</TableHead>
                <TableHead>Reservation</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => (
                <TableRow key={bill._id}>
                  <TableCell className="font-medium">{bill.billId}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{bill.guestName}</p>
                      <p className="text-sm text-gray-500">{bill.guestEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {bill.reservationId ? (
                      <div className="text-sm">
                        <p>{bill.reservationId.reservationId}</p>
                        <p className="text-gray-500">
                          {new Date(bill.reservationId.checkInDate).toLocaleDateString()} - 
                          {new Date(bill.reservationId.checkOutDate).toLocaleDateString()}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">${bill.total.toFixed(2)}</TableCell>
                  <TableCell className="text-green-600">${bill.paidAmount.toFixed(2)}</TableCell>
                  <TableCell className={bill.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${bill.balance.toFixed(2)}
                  </TableCell>
                  <TableCell>{getStatusBadge(bill.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(bill.dueDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewBill(bill)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {bill.status !== 'paid' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddPayment(bill)}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            <DollarSign className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAddItem(bill)}
                            className="text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadBill(bill._id)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => emailBill(bill._id)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Bill Dialog */}
      <Dialog open={viewDialog} onOpenChange={setViewDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {selectedBill && (
            <div className="space-y-6">
              {/* Bill Header */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Bill Information</h3>
                  <p><strong>Bill ID:</strong> {selectedBill.billId}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedBill.status)}</p>
                  <p><strong>Created:</strong> {new Date(selectedBill.createdAt).toLocaleDateString()}</p>
                  <p><strong>Due Date:</strong> {new Date(selectedBill.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Guest Information</h3>
                  <p><strong>Name:</strong> {selectedBill.guestName}</p>
                  <p><strong>Email:</strong> {selectedBill.guestEmail}</p>
                  {selectedBill.reservationId && (
                    <p><strong>Reservation:</strong> {selectedBill.reservationId.reservationId}</p>
                  )}
                </div>
              </div>

              {/* Bill Items */}
              <div>
                <h3 className="font-medium mb-2">Bill Items</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedBill.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                        <TableCell>${item.totalPrice.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Bill Totals */}
              <div className="border-t pt-4">
                <div className="space-y-2 max-w-sm ml-auto">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${selectedBill.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax ({(selectedBill.taxRate * 100).toFixed(1)}%):</span>
                    <span>${selectedBill.tax.toFixed(2)}</span>
                  </div>
                  {selectedBill.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-${selectedBill.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${selectedBill.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Paid:</span>
                    <span>${selectedBill.paidAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Balance:</span>
                    <span className={selectedBill.balance > 0 ? 'text-red-600' : 'text-green-600'}>
                      ${selectedBill.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedBill.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notes</h3>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedBill.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
            <DialogDescription>
              {selectedBill && (
                <div className="mt-4">
                  <p><strong>Bill ID:</strong> {selectedBill.billId}</p>
                  <p><strong>Guest:</strong> {selectedBill.guestName}</p>
                  <p><strong>Total Amount:</strong> ${selectedBill.total.toFixed(2)}</p>
                  <p><strong>Outstanding Balance:</strong> ${selectedBill.balance.toFixed(2)}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Payment Amount</label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Payment Method</label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="online">Online Payment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
              <Textarea
                placeholder="Payment notes..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executePayment}>
              Add Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={addItemDialog} onOpenChange={setAddItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Bill</DialogTitle>
            <DialogDescription>
              {selectedBill && (
                <div className="mt-4">
                  <p><strong>Bill ID:</strong> {selectedBill.billId}</p>
                  <p><strong>Guest:</strong> {selectedBill.guestName}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Input
                placeholder="Item description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quantity</label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Unit Price</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="room">Room Charges</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="service">Service Charges</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="bg-gray-50 p-3 rounded">
              <p className="font-medium">Total: ${(newItem.quantity * newItem.unitPrice).toFixed(2)}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddItemDialog(false)}>
              Cancel
            </Button>
            <Button onClick={executeAddItem}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
