'use client';

import React, { useEffect, useState } from 'react';

interface OfferFormData {
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'special';
  discountValue: number | string;
  validFrom: string;
  validUntil: string;
  minStay: number | string;
  maxStay: number | string;
  applicableDays: string[];
  applicableRooms: string[];
  termsConditions: string;
  status: 'active' | 'inactive';
}

interface Offer {
  _id?: string;
  title?: string;
  description?: string;
  discountType?: string;
  discountValue?: number;
  validFrom?: string;
  validUntil?: string;
  minStay?: number;
  maxStay?: number;
  applicableDays?: string[];
  applicableRooms?: string[];
  termsConditions?: string;
  status?: string;
}

interface OfferFormProps {
  offer?: Offer | null;
  onSubmit: (offerData: any) => Promise<void>;
  onCancel: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({
  offer,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState<OfferFormData>({
    title: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    validFrom: '',
    validUntil: '',
    minStay: 1,
    maxStay: 30,
    applicableDays: [],
    applicableRooms: [],
    termsConditions: '',
    status: 'active'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        discountType: (offer.discountType as any) || 'percentage',
        discountValue: offer.discountValue || '',
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        minStay: offer.minStay || '',
        maxStay: offer.maxStay || '',
        applicableDays: offer.applicableDays || [],
        applicableRooms: offer.applicableRooms || [],
        termsConditions: offer.termsConditions || '',
        status: (offer.status as any) || 'active'
      });
    }
  }, [offer]);

  const validateField = (name: string, value: any): string => {
    let error = '';
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          error = 'Title is required';
        } else if (value.length < 3) {
          error = 'Title must be at least 3 characters';
        } else if (value.length > 100) {
          error = 'Title must not exceed 100 characters';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          error = 'Description is required';
        } else if (value.length < 10) {
          error = 'Description must be at least 10 characters';
        }
        break;
        
      case 'discountValue':
        if (formData.discountType !== 'special') {
          const numValue = Number(value);
          if (!value || numValue <= 0) {
            error = 'Discount value must be greater than 0';
          } else if (formData.discountType === 'percentage' && numValue > 100) {
            error = 'Percentage cannot exceed 100%';
          } else if (formData.discountType === 'percentage' && numValue < 1) {
            error = 'Percentage must be at least 1%';
          }
        }
        break;
        
      case 'validFrom':
        if (!value) {
          error = 'Start date is required';
        } else if (!offer) {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const fromDate = new Date(value);
          if (fromDate < today) {
            error = 'Start date cannot be in the past';
          }
        }
        break;
        
      case 'validUntil':
        if (!value) {
          error = 'End date is required';
        } else if (formData.validFrom) {
          const fromDate = new Date(formData.validFrom);
          const toDate = new Date(value);
          if (fromDate >= toDate) {
            error = 'End date must be after start date';
          }
        }
        break;
        
      case 'minStay':
        if (value && Number(value) < 1) {
          error = 'Minimum stay must be at least 1 night';
        }
        break;
        
      case 'maxStay':
        if (value && formData.minStay) {
          const minStay = Number(formData.minStay);
          const maxStay = Number(value);
          if (maxStay < minStay) {
            error = 'Maximum stay must be greater than minimum stay';
          }
        }
        break;
    }
    
    return error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...(prev[name as keyof OfferFormData] as string[]), value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: (prev[name as keyof OfferFormData] as string[]).filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Clear error for this field when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const validateForm = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};
    
    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must not exceed 100 characters';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    // Discount value validation
    if (formData.discountType === 'percentage') {
      const value = Number(formData.discountValue);
      if (!formData.discountValue || value <= 0) {
        newErrors.discountValue = 'Discount percentage is required';
      } else if (value > 100) {
        newErrors.discountValue = 'Percentage cannot exceed 100%';
      }
    } else if (formData.discountType === 'fixed') {
      const value = Number(formData.discountValue);
      if (!formData.discountValue || value <= 0) {
        newErrors.discountValue = 'Discount amount must be greater than 0';
      }
    }
    
    // Date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fromDate = formData.validFrom ? new Date(formData.validFrom) : null;
    const toDate = formData.validUntil ? new Date(formData.validUntil) : null;
    
    if (!formData.validFrom) {
      newErrors.validFrom = 'Start date is required';
    } else if (fromDate && fromDate < today && !offer) {
      newErrors.validFrom = 'Start date cannot be in the past';
    }
    
    if (!formData.validUntil) {
      newErrors.validUntil = 'End date is required';
    }
    
    if (fromDate && toDate && fromDate >= toDate) {
      newErrors.validUntil = 'End date must be after start date';
    }
    
    // Stay duration validation
    if (formData.minStay && formData.maxStay) {
      const minStay = Number(formData.minStay);
      const maxStay = Number(formData.maxStay);
      
      if (minStay < 1) {
        newErrors.minStay = 'Minimum stay must be at least 1 night';
      }
      
      if (minStay > maxStay) {
        newErrors.maxStay = 'Maximum stay must be greater than minimum stay';
      }
    }
    
    return newErrors;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to first error
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        errorElement.focus();
      }
      return;
    }
    
    // Clear errors
    setErrors({});
    setSubmitting(true);
    
    try {
      // Prepare data for submission
      const submitData: any = {
        title: formData.title,
        description: formData.description,
        discountType: formData.discountType,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil,
        status: formData.status
      };

      // Add discountValue for non-special offers
      if (formData.discountType !== 'special') {
        submitData.discountValue = Number(formData.discountValue);
      }

      // Add optional fields if they have values
      if (formData.minStay) submitData.minStay = Number(formData.minStay);
      if (formData.maxStay) submitData.maxStay = Number(formData.maxStay);
      if (formData.applicableDays && formData.applicableDays.length > 0) {
        submitData.applicableDays = formData.applicableDays;
      }
      if (formData.applicableRooms && formData.applicableRooms.length > 0) {
        submitData.applicableRooms = formData.applicableRooms;
      }
      if (formData.termsConditions && formData.termsConditions.trim()) {
        submitData.termsConditions = formData.termsConditions;
      }

      console.log('Offer submitted:', submitData);
      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {offer ? 'Edit Offer' : 'Create New Offer'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {offer ? 'Update the offer details below' : 'Fill in the details to create a new offer'}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Offer Title <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="title" 
              id="title" 
              value={formData.title} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full border ${errors.title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea 
              name="description" 
              id="description" 
              rows={3} 
              value={formData.description} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full border ${errors.description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>
          <div>
            <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
              Discount Type
            </label>
            <select 
              name="discountType" 
              id="discountType" 
              value={formData.discountType} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              required
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="special">Special Offer</option>
            </select>
          </div>
          {formData.discountType !== 'special' && (
            <div>
              <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
                {formData.discountType === 'percentage' ? 'Percentage Value' : 'Amount Value'} <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                {formData.discountType === 'fixed' && (
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm"></span>
                  </div>
                )}
                <input 
                  type="number" 
                  name="discountValue" 
                  id="discountValue" 
                  value={formData.discountValue} 
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`mt-1 block w-full border ${errors.discountValue ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 ${formData.discountType === 'fixed' ? 'pl-7' : 'px-3'} focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} 
                />
                {formData.discountType === 'percentage' && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>
                )}
              </div>
              {errors.discountValue && <p className="mt-1 text-sm text-red-600">{errors.discountValue}</p>}
            </div>
          )}
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
              Valid From <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="validFrom" 
              id="validFrom" 
              value={formData.validFrom} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full border ${errors.validFrom ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} 
            />
            {errors.validFrom && <p className="mt-1 text-sm text-red-600">{errors.validFrom}</p>}
          </div>
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input 
              type="date" 
              name="validUntil" 
              id="validUntil" 
              value={formData.validUntil} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full border ${errors.validUntil ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} 
            />
            {errors.validUntil && <p className="mt-1 text-sm text-red-600">{errors.validUntil}</p>}
          </div>
          <div>
            <label htmlFor="minStay" className="block text-sm font-medium text-gray-700">
              Minimum Stay (Nights)
            </label>
            <input 
              type="number" 
              name="minStay" 
              id="minStay" 
              value={formData.minStay} 
              onChange={handleChange}
              onBlur={handleBlur}
              className={`mt-1 block w-full border ${errors.minStay ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} 
              min="1" 
            />
            {errors.minStay && <p className="mt-1 text-sm text-red-600">{errors.minStay}</p>}
          </div>
          <div>
            <label htmlFor="maxStay" className="block text-sm font-medium text-gray-700">
              Maximum Stay (Nights)
            </label>
            <input 
              type="number" 
              name="maxStay" 
              id="maxStay" 
              value={formData.maxStay} 
              onChange={handleChange}
              onBlur={handleBlur} 
              className={`mt-1 block w-full border ${errors.maxStay ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`} 
              min="1" 
            />
            {errors.maxStay && <p className="mt-1 text-sm text-red-600">{errors.maxStay}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Days
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <label key={day} className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="applicableDays" 
                    value={day} 
                    checked={formData.applicableDays.includes(day)} 
                    onChange={handleChange} 
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {day.substring(0, 3)}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Room Types
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'].map(room => (
                <label key={room} className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="applicableRooms" 
                    value={room} 
                    checked={formData.applicableRooms.includes(room)} 
                    onChange={handleChange} 
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" 
                  />
                  <span className="ml-2 text-sm text-gray-700">{room}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <textarea 
              name="termsConditions" 
              id="termsConditions" 
              rows={3} 
              value={formData.termsConditions} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select 
              name="status" 
              id="status" 
              value={formData.status} 
              onChange={handleChange} 
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" 
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onCancel} 
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={submitting}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center" 
            disabled={submitting}
          >
            {submitting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {submitting ? 'Saving...' : (offer ? 'Update Offer' : 'Create Offer')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferForm;
