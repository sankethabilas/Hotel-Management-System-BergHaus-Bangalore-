'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Star, 
  Users, 
  Wifi, 
  Car, 
  Utensils, 
  Waves, 
  Sparkles, 
  Dumbbell,
  Coffee,
  Shield,
  UserCheck,
  Plane,
  ArrowRight,
  CheckCircle,
  Mountain,
  TreePine,
  Heart,
  Globe,
  Lightbulb,
  Users2,
  Home,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

// Gallery images from public folder
const galleryImages = [
  { src: '/IMG-20250815-WA0004.jpg', alt: 'Hotel Exterior' },
  { src: '/IMG-20250815-WA0005.jpg', alt: 'Lobby Area' },
  { src: '/IMG-20250815-WA0006.jpg', alt: 'Dining Room' },
  { src: '/IMG-20250815-WA0007.jpg', alt: 'Room Interior' },
  { src: '/IMG-20250815-WA0008.jpg', alt: 'Mountain View Room' },
  { src: '/IMG-20250815-WA0009.jpg', alt: 'Twin Room' },
  { src: '/IMG-20250815-WA0010.jpg', alt: 'Single Room' },
  { src: '/IMG-20250815-WA0011.jpg', alt: 'Hotel Garden' },
  { src: '/IMG-20250815-WA0012.jpg', alt: 'Outdoor Space' },
  { src: '/IMG-20250815-WA0013.jpg', alt: 'BBQ Area' },
  { src: '/IMG-20250815-WA0014.jpg', alt: 'Terrace View' },
  { src: '/IMG-20250815-WA0015.jpg', alt: 'Balcony' },
  { src: '/IMG-20250815-WA0016.jpg', alt: 'Garden View' },
  { src: '/IMG-20250815-WA0017.jpg', alt: 'Mountain Landscape' },
  { src: '/IMG-20250815-WA0018.jpg', alt: 'Hotel Grounds' },
  { src: '/IMG-20250815-WA0019.jpg', alt: 'Outdoor Seating' },
  { src: '/IMG-20250815-WA0020.jpg', alt: 'Nature View' },
  { src: '/IMG-20250815-WA0021.jpg', alt: 'Scenic View' },
  { src: '/IMG-20250815-WA0022.jpg', alt: 'Hotel Environment' },
  { src: '/IMG-20250815-WA0023.jpg', alt: 'Peaceful Setting' },
  { src: '/IMG-20250815-WA0024.jpg', alt: 'Mountain Vista' },
  { src: '/IMG-20250815-WA0025.jpg', alt: 'Garden Area' },
  { src: '/IMG-20250815-WA0026.jpg', alt: 'Outdoor Facilities' },
  { src: '/IMG-20250815-WA0027.jpg', alt: 'Natural Surroundings' }
];

const teamMembers = [
  {
    name: 'Front Desk Staff',
    role: 'Guest Services',
    description: 'Always ready with a smile to assist with check-ins, reservations, and guest needs.',
    icon: UserCheck
  },
  {
    name: 'Housekeeping Team',
    role: 'Maintenance & Cleanliness',
    description: 'Dedicated to maintaining comfort and cleanliness throughout your stay.',
    icon: Home
  },
  {
    name: 'Management Team',
    role: 'Operations',
    description: 'Ensures smooth operations with guest satisfaction as the highest priority.',
    icon: Users2
  }
];

const facilities = [
  {
    icon: Home,
    title: 'Elegant Rooms',
    description: 'Modern amenities with traditional charm'
  },
  {
    icon: UserCheck,
    title: '24/7 Front Desk',
    description: 'Concierge support around the clock'
  },
  {
    icon: Utensils,
    title: 'Fine Dining',
    description: 'Local & international cuisine'
  },
  {
    icon: Users,
    title: 'Event Hosting',
    description: 'Private gatherings & celebrations'
  },
  {
    icon: Plane,
    title: 'Guided Tours',
    description: 'Travel assistance & local expertise'
  },
  {
    icon: Wifi,
    title: 'Free Wi-Fi',
    description: 'Secure parking & laundry service'
  }
];

const values = [
  {
    icon: Heart,
    title: 'Hospitality First',
    description: 'Every guest is part of our family'
  },
  {
    icon: Shield,
    title: 'Trust & Transparency',
    description: 'Clear, fair, and honest in everything we do'
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'Using technology to make stays smoother'
  },
  {
    icon: TreePine,
    title: 'Sustainability',
    description: 'Respect for nature through eco-conscious operations'
  },
  {
    icon: Users2,
    title: 'Community Support',
    description: 'Empowering local culture, artisans, and staff'
  }
];

const testimonials = [
  {
    text: "A beautiful bungalow with amazing service. The staff treated us like family.",
    author: "Sarah M.",
    rating: 5
  },
  {
    text: "Peaceful location, great food, and the booking process was effortless.",
    author: "John D.",
    rating: 5
  },
  {
    text: "The mountain views are breathtaking and the hospitality is unmatched.",
    author: "Maria L.",
    rating: 5
  }
];

export default function AboutPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const openLightbox = (imageSrc: string, index: number) => {
    setSelectedImage(imageSrc);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-hms-primary/10 to-hms-accent/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <Badge className="bg-hms-accent text-hms-primary font-semibold mb-4">
              🌿 About Us
            </Badge>
            <h1 className="text-5xl font-bold text-hms-primary mb-6">
              Berghaus Bungalow
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Nestled in the heart of the Badulla District, Berghaus Bungalow is a charming boutique getaway 
              where tradition meets comfort. Once a colonial-era bungalow, it has been carefully restored to 
              provide modern amenities while preserving its timeless character.
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              📸 Gallery
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Take a visual journey through Berghaus Bungalow and its beautiful surroundings
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                onClick={() => openLightbox(image.src, index)}
              >
                <div className="aspect-square relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                        <ExternalLink className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl font-bold text-hms-primary mb-6">
                  🏡 Our Story
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  Guests come to us not just for a stay, but for an experience—peaceful mountain views, 
                  warm hospitality, and a touch of home. Our colonial-era bungalow has been lovingly 
                  restored to blend historical charm with modern comfort.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Every corner of Berghaus Bungalow tells a story of Sri Lankan heritage, from the 
                  traditional architecture to the warm smiles of our staff who treat every guest 
                  like family.
                </p>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/IMG-20250815-WA0011.jpg"
                  alt="Berghaus Bungalow Exterior"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-hms-primary" />
                </div>
                <h3 className="text-2xl font-bold text-hms-primary mb-4">🎯 Our Mission</h3>
                <p className="text-gray-600 leading-relaxed">
                  To create unforgettable stays by combining authentic Sri Lankan hospitality with 
                  seamless service and technology-driven convenience.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-8 h-8 text-hms-primary" />
                </div>
                <h3 className="text-2xl font-bold text-hms-primary mb-4">🌍 Our Vision</h3>
                <p className="text-gray-600 leading-relaxed">
                  To become the leading boutique hotel in the Uva Province, recognized for exceptional 
                  guest experiences, eco-friendly practices, and community engagement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              💡 Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at Berghaus Bungalow
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <value.icon className="w-6 h-6 text-hms-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-hms-primary mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              👩‍💼 Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              At Berghaus Bungalow, our strength lies in our people who make every stay memorable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <member.icon className="w-8 h-8 text-hms-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-hms-primary mb-2">{member.name}</h3>
                  <p className="text-hms-accent font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities & Services Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              🛎️ Facilities & Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for a perfect stay in the heart of Sri Lanka's hill country
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((facility, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <facility.icon className="w-6 h-6 text-hms-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-hms-primary mb-3">{facility.title}</h3>
                  <p className="text-gray-600">{facility.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              🖥️ Technology for Comfort
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We are proud to use our Hotel Management System (HMS) to enhance your experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-hms-primary" />
                </div>
                <h3 className="font-bold text-hms-primary mb-2">Online Reservations</h3>
                <p className="text-sm text-gray-600">Simplify booking process</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-6 h-6 text-hms-primary" />
                </div>
                <h3 className="font-bold text-hms-primary mb-2">Fast Check-in/out</h3>
                <p className="text-sm text-gray-600">Streamlined processes</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-hms-primary" />
                </div>
                <h3 className="font-bold text-hms-primary mb-2">Secure Billing</h3>
                <p className="text-sm text-gray-600">Digital confirmations</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-hms-primary" />
                </div>
                <h3 className="font-bold text-hms-primary mb-2">Personalized Stay</h3>
                <p className="text-sm text-gray-600">Tailored experiences</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recognition Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              🏆 Recognition
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Praised by our guests for hospitality, tranquility, and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-hms-primary mb-2">9.4/10</div>
                <p className="text-gray-600">Guest Rating</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-hms-primary mb-2">100+</div>
                <p className="text-gray-600">Happy Guests</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-hms-primary mb-2">5★</div>
                <p className="text-gray-600">Service Excellence</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-hms-highlight/20 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              💬 Guest Testimonials
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Don't just take our word for it - hear from our valued guests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <p className="font-semibold text-hms-primary">- {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              🌱 Sustainability & Community
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Committed to responsible tourism and community development
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TreePine className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-hms-primary mb-4">Eco-Friendly Practices</h3>
                <p className="text-gray-600">We minimize waste and encourage recycling throughout our operations</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Utensils className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-hms-primary mb-4">Local Sourcing</h3>
                <p className="text-gray-600">Support local farmers by sourcing fresh produce and ingredients</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-hms-primary mb-4">Community Employment</h3>
                <p className="text-gray-600">Employ and train local residents, helping grow our community</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-hms-primary mb-6">
              📍 Contact Us
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Get in touch with us for reservations, inquiries, or any assistance you may need
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-hms-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hms-primary mb-2">Address</h3>
                  <p className="text-gray-600">
                    Berghaus Bungalow<br />
                    Boralanda, Walimada<br />
                    Badulla District, Sri Lanka
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-hms-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hms-primary mb-2">Phone</h3>
                  <p className="text-gray-600">+94 XXX XXX XXXX</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-hms-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hms-primary mb-2">Email</h3>
                  <p className="text-gray-600">info@berghausbungalow.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-hms-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-hms-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-hms-primary mb-2">Website</h3>
                  <p className="text-gray-600">www.berghausbungalow.com</p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-hms-primary mb-6">🔗 Stay Connected</h3>
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Instagram className="w-5 h-5" />
                    <span>Instagram</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Facebook className="w-5 h-5" />
                    <span>Facebook</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ExternalLink className="w-5 h-5" />
                    <span>TripAdvisor</span>
                  </Button>
                </div>
              </div>

              <div className="pt-8">
                <Link href="/reservations">
                  <Button 
                    size="lg" 
                    className="w-full bg-hms-primary hover:bg-hms-primary/90 text-white px-8 py-4 text-lg font-bold"
                  >
                    Book Your Stay
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <X className="w-8 h-8" />
            </button>
            
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="relative">
              <Image
                src={galleryImages[currentImageIndex].src}
                alt={galleryImages[currentImageIndex].alt}
                width={800}
                height={600}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center">
                <p className="text-lg font-semibold">{galleryImages[currentImageIndex].alt}</p>
                <p className="text-sm opacity-75">
                  {currentImageIndex + 1} of {galleryImages.length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
