'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navbar';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  Facebook, 
  Instagram, 
  ExternalLink,
  Send,
  Loader2,
  CheckCircle,
  MessageSquare,
  Users,
  Calendar,
  Star,
  User
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  reasonForContact: string;
}

const ContactUsPage = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    reasonForContact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Auto-fill form with user session data
  useEffect(() => {
    if (isAuthenticated && user && !isAutoFilled) {
      setFormData(prev => ({
        ...prev,
        fullName: (user as any).fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: user.email || '',
        phone: (user as any).phone || ''
      }));
      setIsAutoFilled(true);
      
      // Show auto-fill notification
      toast({
        title: "Form Auto-filled",
        description: "Your contact information has been automatically filled from your account.",
        variant: "default"
      });
    }
  }, [isAuthenticated, user, isAutoFilled, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      reasonForContact: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      });
      return false;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.subject.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.message.trim()) {
      toast({
        title: "Validation Error",
        description: "Message is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.reasonForContact) {
      toast({
        title: "Validation Error",
        description: "Please select a reason for contact",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: "✅ Your message has been sent successfully. We will get back to you shortly.",
          variant: "default"
        });
        
        // Reset form
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          reasonForContact: ''
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send message. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqData = [
    {
      question: "What kind of breakfast is served?",
      answer: "We serve a delicious continental breakfast with fresh fruits, pastries, local Sri Lankan specialties, eggs cooked to order, and a variety of beverages. Our breakfast is included in your room rate and served from 7:00 AM to 10:00 AM daily."
    },
    {
      question: "What type of rooms are available?",
      answer: "We offer a variety of room types including Standard Rooms, Deluxe Rooms, Family Suites, and our signature Bungalow Suites. All rooms are equipped with modern amenities, air conditioning, private bathrooms, and stunning views of the surrounding landscape."
    },
    {
      question: "How much does it cost to stay?",
      answer: "Our room rates vary by season and room type. Standard rooms start from Rs 9,432 per night, Deluxe rooms from Rs 10,478 per night, and our Bungalow Suites from Rs 12,807 per night. All rates include breakfast and complimentary Wi-Fi. Please contact us for current pricing and special offers."
    },
    {
      question: "What activities are available?",
      answer: "We offer a range of activities including guided nature walks, bird watching tours, hiking to nearby viewpoints, cycling tours, cooking classes featuring local cuisine, and cultural experiences. We can also arrange day trips to Ella Rock, Nine Arch Bridge, and other popular attractions."
    },
    {
      question: "How far from Ella town center?",
      answer: "Berghaus Bungalow is located just 2.5 kilometers from Ella town center, approximately a 5-minute drive or 30-minute walk. We provide complimentary shuttle service to and from the town center for our guests."
    },
    {
      question: "Is Berghaus Bungalow popular with families?",
      answer: "Yes! We are very family-friendly and welcome guests of all ages. We have family rooms, a children's play area, and can arrange family-friendly activities. Our staff is experienced in catering to families and ensuring a comfortable stay for everyone."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 overflow-y-auto">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-[#006bb8] to-[#2fa0df] text-white py-20">
        <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            📞 Contact Us – Berghaus Bungalow HMS
          </h1>
          <p className="text-2xl sm:text-3xl lg:text-4xl text-blue-100 max-w-5xl mx-auto leading-relaxed">
            We're here to help! Get in touch with our friendly team for any inquiries, bookings, or assistance.
          </p>
          {isAuthenticated && (
            <div className="mt-8 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 text-lg">
              <User className="mr-3 h-6 w-6" />
              <span>Welcome back, {user?.firstName || (user as any)?.fullName || 'User'}!</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
          
          {/* Left Side - Contact Details & FAQs */}
          <div className="space-y-8">
            
            {/* Contact Details Card */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#006bb8] to-[#2fa0df] text-white rounded-t-xl p-8">
                <CardTitle className="flex items-center text-2xl lg:text-3xl">
                  <MessageSquare className="mr-3 h-8 w-8" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                
                {/* Phone Numbers */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <Phone className="mr-3 h-6 w-6 text-[#006bb8]" />
                    Phone Numbers
                  </h3>
                  <div className="space-y-3 text-base">
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Front Desk:</span> 
                      <span className="text-[#006bb8] font-mono">+94 77 123 4567</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Reservations:</span> 
                      <span className="text-[#006bb8] font-mono">+94 77 123 4568</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Manager:</span> 
                      <span className="text-[#006bb8] font-mono">+94 77 123 4569</span>
                    </p>
                  </div>
                </div>

                {/* Email Addresses */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <Mail className="mr-3 h-6 w-6 text-[#006bb8]" />
                    Email Addresses
                  </h3>
                  <div className="space-y-3 text-base">
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">General Inquiries:</span> 
                      <span className="text-[#006bb8] font-mono text-sm">info@berghausbungalow.com</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Reservations:</span> 
                      <span className="text-[#006bb8] font-mono text-sm">bookings@berghausbungalow.com</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Events:</span> 
                      <span className="text-[#006bb8] font-mono text-sm">events@berghausbungalow.com</span>
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <MapPin className="mr-3 h-6 w-6 text-[#006bb8]" />
                    Address
                  </h3>
                  <div className="py-3 px-4 bg-gray-50 rounded-lg">
                    <p className="text-base text-gray-700 leading-relaxed">
                      <strong>Berghaus Bungalow</strong><br />
                      Ella, Uva Province<br />
                      Sri Lanka 90090
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <Clock className="mr-3 h-6 w-6 text-[#006bb8]" />
                    Operating Hours
                  </h3>
                  <div className="space-y-2 text-base">
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Reception:</span> 
                      <span className="text-green-600 font-semibold">24/7</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Check-in:</span> 
                      <span className="text-gray-700">2:00 PM - 11:00 PM</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-gray-50 rounded-lg">
                      <span className="font-semibold">Check-out:</span> 
                      <span className="text-gray-700">6:00 AM - 12:00 PM</span>
                    </p>
                  </div>
                </div>

                {/* Emergency Contacts */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <AlertTriangle className="mr-3 h-6 w-6 text-red-500" />
                    Emergency Contacts
                  </h3>
                  <div className="space-y-2 text-base">
                    <p className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-lg">
                      <span className="font-semibold">Fire:</span> 
                      <span className="text-red-600 font-mono font-bold">110</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-lg">
                      <span className="font-semibold">Police:</span> 
                      <span className="text-red-600 font-mono font-bold">119</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-lg">
                      <span className="font-semibold">Medical:</span> 
                      <span className="text-red-600 font-mono font-bold">110</span>
                    </p>
                    <p className="flex justify-between items-center py-2 px-4 bg-red-50 rounded-lg">
                      <span className="font-semibold">Hotel Emergency:</span> 
                      <span className="text-red-600 font-mono font-bold">+94 77 123 4567</span>
                    </p>
                  </div>
                </div>

                {/* Social Media */}
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <Users className="mr-3 h-6 w-6 text-[#006bb8]" />
                    Follow Us
                  </h3>
                  <div className="flex space-x-6">
                    <a href="#" className="text-[#006bb8] hover:text-[#2fa0df] transition-colors transform hover:scale-110">
                      <Facebook className="h-8 w-8" />
                    </a>
                    <a href="#" className="text-[#006bb8] hover:text-[#2fa0df] transition-colors transform hover:scale-110">
                      <Instagram className="h-8 w-8" />
                    </a>
                    <a href="#" className="text-[#006bb8] hover:text-[#2fa0df] transition-colors transform hover:scale-110">
                      <ExternalLink className="h-8 w-8" />
                    </a>
                    <a href="#" className="text-[#006bb8] hover:text-[#2fa0df] transition-colors transform hover:scale-110">
                      <Star className="h-8 w-8" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ffc973] to-[#fee3b3] text-gray-800 rounded-t-xl p-8">
                <CardTitle className="flex items-center text-2xl lg:text-3xl">
                  <MessageSquare className="mr-3 h-8 w-8" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <Accordion type="single" collapsible className="w-full">
                  {faqData.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left font-medium text-gray-800 hover:text-[#006bb8]">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-gray-600 pt-2">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Contact Form & Map */}
          <div className="space-y-8">
            
            {/* Contact Form */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#2fa0df] to-[#006bb8] text-white rounded-t-xl p-8">
                <CardTitle className="flex items-center text-2xl lg:text-3xl">
                  <Send className="mr-3 h-8 w-8" />
                  Send us a Message
                </CardTitle>
                {isAuthenticated && (
                  <p className="text-blue-100 text-lg mt-2">
                    Your information has been pre-filled from your account
                  </p>
                )}
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="fullName" className="text-base font-semibold text-gray-700 block mb-3">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="h-12 text-base px-4 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-base font-semibold text-gray-700 block mb-3">
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="h-12 text-base px-4 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone" className="text-base font-semibold text-gray-700 block mb-3">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      className="h-12 text-base px-4 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200"
                    />
                  </div>

                  {/* Reason for Contact */}
                  <div>
                    <Label className="text-base font-semibold text-gray-700 block mb-3">
                      Reason for Contact *
                    </Label>
                    <Select value={formData.reasonForContact} onValueChange={handleSelectChange}>
                      <SelectTrigger className="h-12 text-base px-4 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="Select a reason" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking Inquiry</SelectItem>
                        <SelectItem value="complaint">Complaint</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="event">Event</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject" className="text-base font-semibold text-gray-700 block mb-3">
                      Subject *
                    </Label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter message subject"
                      className="h-12 text-base px-4 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message" className="text-base font-semibold text-gray-700 block mb-3">
                      Message *
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter your message here..."
                      className="min-h-[160px] text-base px-4 py-3 border-2 border-gray-200 focus:border-[#006bb8] focus:ring-2 focus:ring-[#006bb8]/20 rounded-xl transition-all duration-200 resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#006bb8] to-[#2fa0df] hover:from-[#0056a3] hover:to-[#1e8bc4] text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg h-14"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="mr-3 h-6 w-6" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Map & Directions */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ffc973] to-[#fee3b3] text-gray-800 rounded-t-xl p-8">
                <CardTitle className="flex items-center text-2xl lg:text-3xl">
                  <MapPin className="mr-3 h-8 w-8" />
                  Find Us
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  {/* Google Maps Embed */}
                  <div className="relative w-full h-80 lg:h-96 rounded-xl overflow-hidden shadow-lg">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.123456789!2d81.0444!3d6.8667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNTInMDAuMCJOIDgxwrAwMic0MC4wIkU!5e0!3m2!1sen!2slk!4v1234567890123!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Berghaus Bungalow Location"
                    />
                  </div>
                  
                  {/* Get Directions Button */}
                  <div className="text-center">
                    <Button
                      onClick={() => window.open('https://maps.google.com/?q=Berghaus+Bungalow+Ella+Sri+Lanka', '_blank')}
                      className="bg-gradient-to-r from-[#ffc973] to-[#fee3b3] hover:from-[#ffb84d] hover:to-[#fdd89f] text-gray-800 font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg h-12"
                    >
                      <ExternalLink className="mr-3 h-5 w-5" />
                      Get Directions
                    </Button>
                  </div>
                  
                  <div className="text-center bg-gray-50 rounded-xl p-4">
                    <p className="text-base text-gray-700 font-medium">
                      <MapPin className="inline h-5 w-5 mr-2 text-[#006bb8]" />
                      Berghaus Bungalow, Ella, Uva Province, Sri Lanka
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Section */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-[#ffc973] to-[#fee3b3] text-gray-800 rounded-t-xl p-8">
                <CardTitle className="flex items-center text-2xl lg:text-3xl">
                  <Star className="mr-3 h-8 w-8" />
                  Share Your Feedback
                </CardTitle>
                <p className="text-lg text-gray-700 mt-2">
                  Help us improve by sharing your experience with Berghaus Bungalow
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                      We Value Your Opinion
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Your feedback helps us enhance our services and create better experiences for all our guests. 
                      Share your thoughts about your stay, dining experience, or any suggestions you might have.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => window.open('/feedback', '_blank')}
                        className="bg-gradient-to-r from-[#006bb8] to-[#2fa0df] hover:from-[#0056a3] hover:to-[#1e8bc4] text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg h-12"
                      >
                        <Star className="mr-3 h-5 w-5" />
                        Submit Feedback
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => window.open('/feedback', '_blank')}
                        className="border-2 border-[#006bb8] text-[#006bb8] hover:bg-[#006bb8] hover:text-white font-bold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 text-lg h-12"
                      >
                        <MessageSquare className="mr-3 h-5 w-5" />
                        Rate Your Experience
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">⭐</div>
                      <h4 className="font-semibold text-gray-800 mb-2">Rate Your Stay</h4>
                      <p className="text-sm text-gray-600">Share ratings for different aspects of your experience</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">💬</div>
                      <h4 className="font-semibold text-gray-800 mb-2">Leave Comments</h4>
                      <p className="text-sm text-gray-600">Tell us what you loved or what we can improve</p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-3xl mb-2">📸</div>
                      <h4 className="font-semibold text-gray-800 mb-2">Share Photos</h4>
                      <p className="text-sm text-gray-600">Upload photos from your stay (optional)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUsPage;
