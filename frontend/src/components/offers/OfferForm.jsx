import React, { useEffect, useState } from 'react';
const OfferForm = ({
  offer,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
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
  useEffect(() => {
    if (offer) {
      setFormData({
        title: offer.title || '',
        description: offer.description || '',
        discountType: offer.discountType || 'percentage',
        discountValue: offer.discountValue || '',
        validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
        validUntil: offer.validUntil ? new Date(offer.validUntil).toISOString().split('T')[0] : '',
        minStay: offer.minStay || '',
        maxStay: offer.maxStay || '',
        applicableDays: offer.applicableDays || [],
        applicableRooms: offer.applicableRooms || [],
        termsConditions: offer.termsConditions || '',
        status: offer.status || 'active'
      });
    }
  }, [offer]);
  const handleChange = e => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;
    if (type === 'checkbox') {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          [name]: [...prev[name], value]
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: prev[name].filter(item => item !== value)
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleSubmit = e => {
    e.preventDefault();
    
    // Prepare data for submission
    const submitData = {
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
    onSubmit(submitData);
  };
  return <div className="bg-white rounded-lg shadow">
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
              Offer Title
            </label>
            <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea name="description" id="description" rows={3} value={formData.description} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="discountType" className="block text-sm font-medium text-gray-700">
              Discount Type
            </label>
            <select name="discountType" id="discountType" value={formData.discountType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
              <option value="special">Special Offer</option>
            </select>
          </div>
          {formData.discountType !== 'special' && <div>
              <label htmlFor="discountValue" className="block text-sm font-medium text-gray-700">
                {formData.discountType === 'percentage' ? 'Percentage Value' : 'Amount Value'}
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                {formData.discountType === 'fixed' && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>}
                <input type="number" name="discountValue" id="discountValue" value={formData.discountValue} onChange={handleChange} className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 ${formData.discountType === 'fixed' ? 'pl-7' : 'px-3'} focus:outline-none focus:ring-gold focus:border-gold sm:text-sm`} required />
                {formData.discountType === 'percentage' && <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">%</span>
                  </div>}
              </div>
            </div>}
          <div>
            <label htmlFor="validFrom" className="block text-sm font-medium text-gray-700">
              Valid From
            </label>
            <input type="date" name="validFrom" id="validFrom" value={formData.validFrom} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-gray-700">
              Valid Until
            </label>
            <input type="date" name="validUntil" id="validUntil" value={formData.validUntil} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="minStay" className="block text-sm font-medium text-gray-700">
              Minimum Stay (Nights)
            </label>
            <input type="number" name="minStay" id="minStay" value={formData.minStay} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" min="1" />
          </div>
          <div>
            <label htmlFor="maxStay" className="block text-sm font-medium text-gray-700">
              Maximum Stay (Nights)
            </label>
            <input type="number" name="maxStay" id="maxStay" value={formData.maxStay} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" min="1" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Days
            </label>
            <div className="grid grid-cols-4 gap-2">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => <label key={day} className="flex items-center">
                  <input type="checkbox" name="applicableDays" value={day} checked={formData.applicableDays.includes(day)} onChange={handleChange} className="focus:ring-gold h-4 w-4 text-navy-blue border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">
                    {day.substring(0, 3)}
                  </span>
                </label>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Applicable Room Types
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Standard', 'Deluxe', 'Suite', 'Executive', 'Presidential'].map(room => <label key={room} className="flex items-center">
                    <input type="checkbox" name="applicableRooms" value={room} checked={formData.applicableRooms.includes(room)} onChange={handleChange} className="focus:ring-gold h-4 w-4 text-navy-blue border-gray-300 rounded" />
                    <span className="ml-2 text-sm text-gray-700">{room}</span>
                  </label>)}
            </div>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="termsConditions" className="block text-sm font-medium text-gray-700">
              Terms & Conditions
            </label>
            <textarea name="termsConditions" id="termsConditions" rows={3} value={formData.termsConditions} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            {offer ? 'Update Offer' : 'Create Offer'}
          </button>
        </div>
      </form>
    </div>;
};
export default OfferForm;
