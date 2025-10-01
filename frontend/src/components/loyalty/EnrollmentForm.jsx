import React, { useState } from 'react';
const EnrollmentForm = ({
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    birthdate: '',
    preferredRoom: '',
    specialRequests: ''
  });
  const handleChange = e => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = e => {
    e.preventDefault();
    console.log('Enrollment submitted:', formData);
    onSubmit();
  };
  return <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Enroll New Loyalty Member
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Complete the form below to enroll a new guest in the loyalty program
        </p>
      </div>
      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" required />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div>
            <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700">
              Birthdate
            </label>
            <input type="date" name="birthdate" id="birthdate" value={formData.birthdate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input type="text" name="state" id="state" value={formData.state} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
            </div>
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
                ZIP Code
              </label>
              <input type="text" name="zipCode" id="zipCode" value={formData.zipCode} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
            </div>
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <select name="country" id="country" value={formData.country} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm">
              <option value="">Select Country</option>
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="DE">Germany</option>
              <option value="FR">France</option>
              <option value="JP">Japan</option>
            </select>
          </div>
          <div>
            <label htmlFor="preferredRoom" className="block text-sm font-medium text-gray-700">
              Preferred Room Type
            </label>
            <select name="preferredRoom" id="preferredRoom" value={formData.preferredRoom} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-3 pr-10 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm">
              <option value="">Select Room Type</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="suite">Suite</option>
              <option value="executive">Executive Suite</option>
              <option value="presidential">Presidential Suite</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700">
              Special Requests or Preferences
            </label>
            <textarea name="specialRequests" id="specialRequests" rows={3} value={formData.specialRequests} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-gold focus:border-gold sm:text-sm" />
          </div>
          <div className="md:col-span-2">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input id="terms" name="terms" type="checkbox" className="focus:ring-gold h-4 w-4 text-navy-blue border-gray-300 rounded" required />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I agree to the terms and conditions
                </label>
                <p className="text-gray-500">
                  By enrolling, the guest agrees to receive promotional
                  communications and loyalty program updates.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Cancel
          </button>
          <button type="submit" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-navy-blue hover:bg-navy-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold">
            Enroll Guest
          </button>
        </div>
      </form>
    </div>;
};
export default EnrollmentForm;
