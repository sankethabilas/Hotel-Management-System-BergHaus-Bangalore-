'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { safeApiFetch } from '@/lib/safeFetch';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send,
  Loader2,
  Linkedin,
  Instagram, 
  Facebook, 
  Twitter,
  ArrowRight
} from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  reasonForContact: string;
}

export default function ContactUsPage() {
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

  useEffect(() => {
    if (isAuthenticated && user && !isAutoFilled) {
      setFormData(prev => ({
        ...prev,
        fullName: (user as any).fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
        email: user.email || '',
        phone: (user as any).phone || ''
      }));
      setIsAutoFilled(true);
    }
  }, [isAuthenticated, user, isAutoFilled]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, reasonForContact: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call for demo purposes (replace with actual logic)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Message Sent!",
      description: "We'll get back to you shortly.",
      variant: "default"
    });
    
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      reasonForContact: ''
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Premium Hero with overlapping card */}
      <section className="relative h-[40vh] bg-[#006bb8] overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent"></div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-white/90 text-lg max-w-2xl font-light">
            Have a question or need assistance? Our team is available 24/7 to ensure your stay is perfect.
          </p>
        </div>
      </section>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Information (Left Column) */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-0 shadow-xl bg-[#006bb8] text-white overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              <CardContent className="p-8 relative z-10">
                <h2 className="text-2xl font-bold mb-8">Contact Info</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90 mb-1">Call Us</h3>
                      <p className="text-white/70 text-sm font-mono">+94 77 123 4567</p>
                      <p className="text-white/70 text-sm font-mono">+94 77 123 4568</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90 mb-1">Email Us</h3>
                      <p className="text-white/70 text-sm">info@berghausbungalow.com</p>
                      <p className="text-white/70 text-sm">bookings@berghausbungalow.com</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                       <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white/90 mb-1">Visit Us</h3>
                      <p className="text-white/70 text-sm leading-relaxed">
                        Berghaus Bungalow<br/>Ella, Uva Province<br/>Sri Lanka
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                        <Clock className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <h3 className="font-semibold text-white/90 mb-1">Front Desk</h3>
                       <p className="text-white/70 text-sm">Open 24/7</p>
                     </div>
                  </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/20">
                  <h3 className="font-semibold text-white/90 mb-4">Follow Us</h3>
                  <div className="flex gap-4">
                    {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                      <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/30 flex items-center justify-center transition-colors">
                        <Icon className="w-4 h-4 text-white" />
                      </a>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white h-full">
              <CardContent className="p-8 md:p-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        name="fullName" 
                        value={formData.fullName} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="John Doe"
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input 
                        id="email" 
                        name="email" 
                        type="email" 
                        value={formData.email} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="john@example.com"
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        placeholder="+1 234 567 890"
                        className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason for Contact</Label>
                      <Select value={formData.reasonForContact} onValueChange={handleSelectChange}>
                        <SelectTrigger className="bg-gray-50 border-gray-200 focus:bg-white">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="booking">Booking Inquiry</SelectItem>
                          <SelectItem value="support">Guest Support</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input 
                      id="subject" 
                      name="subject" 
                      value={formData.subject} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="How can we help?"
                      className="bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Textarea 
                      id="message" 
                      name="message" 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Write your message here..."
                      className="min-h-[150px] bg-gray-50 border-gray-200 focus:bg-white transition-colors resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full md:w-auto bg-hms-primary hover:bg-hms-secondary text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending...</>
                      ) : (
                        <>Send Message <ArrowRight className="ml-2 w-5 h-5" /></>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
