import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CheckCircle,
  User,
  MessageSquare,
  Building,
  Star
} from 'lucide-react';
import { feedbackService } from '../../services/feedbackService';

const ContactUs = () => {
  const [activeTab, setActiveTab] = useState('contact'); // 'contact' or 'feedback'
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Feedback form state
  const [feedbackData, setFeedbackData] = useState({
    guestName: '',
    email: '',
    rating: 5,
    comment: '',
    category: 'Service'
  });
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackErrors, setFeedbackErrors] = useState({});
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  // Contact form handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  // Feedback form handlers
  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    setFeedbackData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (feedbackErrors[name]) {
      setFeedbackErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = 'Phone number is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      // Here you would typically send the data to your backend
      console.log('Contact form submitted:', formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    } else {
      setErrors(newErrors);
    }
  };
  
  const validateFeedbackForm = () => {
    const newErrors = {};
    if (!feedbackData.guestName.trim()) newErrors.guestName = 'Name is required';
    if (!feedbackData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(feedbackData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!feedbackData.comment.trim()) newErrors.comment = 'Comment is required';
    if (feedbackData.comment.length > 2000) newErrors.comment = 'Comment is too long (max 2000 characters)';
    
    return newErrors;
  };
  
  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateFeedbackForm();
    
    if (Object.keys(newErrors).length === 0) {
      setFeedbackSubmitting(true);
      setFeedbackErrors({});
      
      try {
        await feedbackService.createFeedback(feedbackData);
        setFeedbackSubmitted(true);
        setFeedbackData({
          guestName: '',
          email: '',
          rating: 5,
          comment: '',
          category: 'Service'
        });
        
        // Reset success message after 5 seconds
        setTimeout(() => {
          setFeedbackSubmitted(false);
        }, 5000);
      } catch (error) {
        setFeedbackErrors({ submit: error.message || 'Failed to submit feedback' });
      } finally {
        setFeedbackSubmitting(false);
      }
    } else {
      setFeedbackErrors(newErrors);
    }
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['BergHaus Hotel', 'MG Road, Bangalore', 'Karnataka 560001, India'],
      color: '#006bb8'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+91 80 1234 5678', '+91 80 8765 4321', 'Toll Free: 1800 123 4567'],
      color: '#2fa0df'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['info@berghaus.com', 'reservations@berghaus.com', 'support@berghaus.com'],
      color: '#ffc973'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: ['Front Desk: 24/7', 'Restaurant: 7:00 AM - 11:00 PM', 'Spa: 9:00 AM - 9:00 PM'],
      color: '#006bb8'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 107, 184, 0.85), rgba(47, 160, 223, 0.85)), url("https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <Building className="w-16 h-16 mb-4" />
          <h1 className="text-5xl font-bold mb-4">Get In Touch</h1>
          <p className="text-xl text-center max-w-2xl px-4">
            We're here to make your stay memorable. Reach out to us anytime!
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 -mt-24 relative z-10">
          {contactInfo.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{ borderTop: `4px solid ${info.color}` }}
              >
                <div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto"
                  style={{ backgroundColor: `${info.color}20` }}
                >
                  <IconComponent 
                    className="w-7 h-7" 
                    style={{ color: info.color }}
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 text-center">
                  {info.title}
                </h3>
                <div className="space-y-1">
                  {info.details.map((detail, idx) => (
                    <p key={idx} className="text-sm text-gray-600 text-center">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('contact')}
              className={`px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'contact'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={activeTab === 'contact' ? { backgroundColor: '#006bb8' } : {}}
            >
              <MessageSquare className="inline-block w-5 h-5 mr-2 -mt-1" />
              Contact Us
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-8 py-4 font-semibold transition-all duration-300 ${
                activeTab === 'feedback'
                  ? 'text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
              style={activeTab === 'feedback' ? { backgroundColor: '#2fa0df' } : {}}
            >
              <Star className="inline-block w-5 h-5 mr-2 -mt-1" />
              Share Feedback
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#006bb8' }}>
                Send Us a Message
              </h2>
              <p className="text-gray-600 mb-6">
                Fill out the form below and we'll get back to you within 24 hours
              </p>

            {submitted && (
              <div 
                className="mb-6 p-4 rounded-lg flex items-center gap-3"
                style={{ backgroundColor: '#fee3b3' }}
              >
                <CheckCircle className="w-5 h-5" style={{ color: '#006bb8' }} />
                <p className="text-sm font-medium" style={{ color: '#006bb8' }}>
                  Thank you! Your message has been sent successfully.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.name 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="John Doe"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                      errors.phone 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Subject Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                    errors.subject 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select a subject</option>
                  <option value="reservation">Reservation Inquiry</option>
                  <option value="booking">Booking Modification</option>
                  <option value="services">Hotel Services</option>
                  <option value="events">Events & Conferences</option>
                  <option value="feedback">Feedback</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
                      errors.message 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Tell us how we can help you..."
                  />
                </div>
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5"
                style={{ 
                  backgroundColor: '#006bb8',
                  hover: { backgroundColor: '#2fa0df' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#2fa0df'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#006bb8'}
              >
                <Send className="w-5 h-5" />
                Send Message
              </button>
            </form>
            </div>
          )}

          {/* Feedback Form */}
          {activeTab === 'feedback' && (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#2fa0df' }}>
                Share Your Experience
              </h2>
              <p className="text-gray-600 mb-6">
                We value your feedback! Help us improve our services
              </p>

              {feedbackSubmitted && (
                <div 
                  className="mb-6 p-4 rounded-lg flex items-center gap-3"
                  style={{ backgroundColor: '#fee3b3' }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: '#006bb8' }} />
                  <p className="text-sm font-medium" style={{ color: '#006bb8' }}>
                    Thank you for your valuable feedback!
                  </p>
                </div>
              )}

              {feedbackErrors.submit && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-sm text-red-700">{feedbackErrors.submit}</p>
                </div>
              )}

              <form onSubmit={handleFeedbackSubmit} className="space-y-5">
                {/* Guest Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="guestName"
                      value={feedbackData.guestName}
                      onChange={handleFeedbackChange}
                      disabled={feedbackSubmitting}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        feedbackErrors.guestName 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="John Doe"
                    />
                  </div>
                  {feedbackErrors.guestName && (
                    <p className="text-red-500 text-sm mt-1">{feedbackErrors.guestName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={feedbackData.email}
                      onChange={handleFeedbackChange}
                      disabled={feedbackSubmitting}
                      className={`w-full pl-11 pr-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                        feedbackErrors.email 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-gray-200 focus:border-blue-500'
                      }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {feedbackErrors.email && (
                    <p className="text-red-500 text-sm mt-1">{feedbackErrors.email}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={feedbackData.category}
                    onChange={handleFeedbackChange}
                    disabled={feedbackSubmitting}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Service">Service</option>
                    <option value="Room">Room</option>
                    <option value="Food">Food</option>
                    <option value="Facilities">Facilities</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData(prev => ({ ...prev, rating: star }))}
                        disabled={feedbackSubmitting}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= feedbackData.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-sm font-medium text-gray-600">
                      {feedbackData.rating === 1 ? 'Poor' : 
                       feedbackData.rating === 2 ? 'Fair' : 
                       feedbackData.rating === 3 ? 'Good' : 
                       feedbackData.rating === 4 ? 'Very Good' : 'Excellent'}
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Feedback *
                  </label>
                  <textarea
                    name="comment"
                    value={feedbackData.comment}
                    onChange={handleFeedbackChange}
                    disabled={feedbackSubmitting}
                    rows="5"
                    maxLength={2000}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors resize-none ${
                      feedbackErrors.comment 
                        ? 'border-red-300 focus:border-red-500' 
                        : 'border-gray-200 focus:border-blue-500'
                    }`}
                    placeholder="Please share your experience with us..."
                  />
                  <div className="flex justify-between items-center mt-1">
                    {feedbackErrors.comment && (
                      <p className="text-red-500 text-sm">{feedbackErrors.comment}</p>
                    )}
                    <p className="text-sm text-gray-500 ml-auto">
                      {feedbackData.comment.length}/2000 characters
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={feedbackSubmitting}
                  className="w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#2fa0df',
                  }}
                  onMouseEnter={(e) => !feedbackSubmitting && (e.target.style.backgroundColor = '#006bb8')}
                  onMouseLeave={(e) => !feedbackSubmitting && (e.target.style.backgroundColor = '#2fa0df')}
                >
                  <Send className="w-5 h-5" />
                  {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          )}

          {/* Map and Additional Info */}
          <div className="space-y-6">
            {/* Map */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="h-80">
                <iframe
                  title="BergHaus Hotel Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.948736447829!2d77.60419431482199!3d12.972442990861943!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBrigade%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>

            {/* Why Contact Us */}
            <div 
              className="rounded-2xl shadow-xl p-8 text-white"
              style={{
                background: 'linear-gradient(135deg, #006bb8 0%, #2fa0df 100%)'
              }}
            >
              <h3 className="text-2xl font-bold mb-4">Why Choose BergHaus?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>24/7 dedicated customer support</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>Luxury accommodations in the heart of Bangalore</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>World-class dining and spa facilities</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>State-of-the-art conference and event spaces</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                  <span>Personalized concierge services</span>
                </li>
              </ul>
            </div>

            {/* Quick Contact */}
            <div 
              className="rounded-2xl shadow-xl p-8"
              style={{ backgroundColor: '#fee3b3' }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: '#006bb8' }}>
                Need Immediate Assistance?
              </h3>
              <p className="mb-4 text-gray-700">
                For urgent matters or immediate booking assistance, please call our 24/7 hotline:
              </p>
              <a 
                href="tel:+918012345678"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: '#ffc973' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#006bb8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffc973'}
              >
                <Phone className="w-5 h-5" />
                +91 80 1234 5678
              </a>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold mb-6" style={{ color: '#006bb8' }}>
            Follow Us on Social Media
          </h3>
          <div className="flex justify-center gap-4">
            {[
              { name: 'Facebook', color: '#006bb8' },
              { name: 'Instagram', color: '#2fa0df' },
              { name: 'Twitter', color: '#ffc973' },
              { name: 'LinkedIn', color: '#006bb8' }
            ].map((social, index) => (
              <button
                key={index}
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 hover:shadow-lg transform hover:-translate-y-1"
                style={{ backgroundColor: social.color }}
              >
                {social.name.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer 
        className="text-white py-8 mt-16"
        style={{ backgroundColor: '#006bb8' }}
      >
        <div className="container mx-auto px-4 text-center">
          <p className="text-lg font-semibold mb-2">BergHaus Hotel Bangalore</p>
          <p className="text-sm opacity-90">
            © {new Date().getFullYear()} BergHaus. All rights reserved. | 
            Experience Luxury at Its Finest
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ContactUs;
