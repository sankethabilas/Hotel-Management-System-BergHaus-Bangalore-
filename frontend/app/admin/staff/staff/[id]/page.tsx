'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Calendar } from 'lucide-react';
import { Staff } from '@/types/staff';
import { staffAPI } from '@/lib/staffApi';

export default function StaffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (params?.id) {
      loadStaffMember();
    }
  }, [params?.id]);

  const loadStaffMember = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (!params?.id || typeof params.id !== 'string') {
        setError('Invalid staff ID');
        return;
      }

      const staffData = await staffAPI.getStaffById(params.id);
      setStaff(staffData);
    } catch (error) {
      console.error('Error loading staff member:', error);
      setError(error instanceof Error ? error.message : 'Failed to load staff member');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (params?.id) {
      router.push(`/admin/staff/staff/edit/${params.id}`);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this staff member?')) {
      try {
        if (params?.id) {
          await staffAPI.deleteStaff(params.id as string);
          router.push('/admin/staff');
        }
      } catch (error) {
        console.error('Error deleting staff member:', error);
        setError('Failed to delete staff member');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading staff member...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Staff Member</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Staff Member Not Found</h2>
          <p className="text-gray-600 mb-4">The requested staff member could not be found.</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {staff.fullName}
                </h1>
                <p className="text-gray-600">{staff.jobRole}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Basic Information */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{staff.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Employee ID</label>
                    <p className="text-gray-900">{staff.employeeId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {staff.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900 flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {staff.phone}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Job Role</label>
                    <p className="text-gray-900">{staff.jobRole}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Department</label>
                    <p className="text-gray-900">{staff.department || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                    <p className="text-gray-900">{staff.dob ? new Date(staff.dob).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-gray-900">{staff.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">NIC/Passport</label>
                    <p className="text-gray-900">{staff.nicPassport || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <p className="text-gray-900">{staff.address || 'Not specified'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Join Date</label>
                    <p className="text-gray-900">{staff.joinDate ? new Date(staff.joinDate).toLocaleDateString() : 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div>
                      <Badge variant={staff.isActive ? 'default' : 'secondary'}>
                        {staff.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Salary</label>
                    <p className="text-gray-900">Rs. {staff.salary?.toLocaleString() || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Overtime Rate</label>
                    <p className="text-gray-900">Rs. {staff.overtimeRate?.toLocaleString() || 'Not specified'} per hour</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Banking Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banking Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Account Number</label>
                  <p className="text-gray-900">{staff.bankAccount || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Name</label>
                  <p className="text-gray-900">{staff.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-gray-900">{staff.branch || 'Not provided'}</p>
                </div>
                {staff.profilePic && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Profile Picture</label>
                    <div className="mt-2">
                      <img 
                        src={staff.profilePic} 
                        alt={staff.fullName}
                        className="w-32 h-32 rounded-lg object-cover border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}