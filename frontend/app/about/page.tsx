'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { 
  Heart, 
  Shield, 
  Lightbulb, 
  TreePine, 
  Users2, 
  Home, 
  UserCheck, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  Quote
} from 'lucide-react';

const galleryImages = [
  { src: '/IMG-20250815-WA0004.jpg', alt: 'Hotel Exterior' },
  { src: '/IMG-20250815-WA0005.jpg', alt: 'Lobby Area' },
  { src: '/IMG-20250815-WA0011.jpg', alt: 'Hotel Garden' },
  { src: '/IMG-20250815-WA0014.jpg', alt: 'Terrace View' },
  { src: '/IMG-20250815-WA0006.jpg', alt: 'Dining Room' },
  { src: '/IMG-20250815-WA0024.jpg', alt: 'Mountain Vista' },
];

const teamMembers = [
  {
    name: 'Front Desk Staff',
    role: 'Guest Services',
    description: 'Always ready with a smile to assist with check-ins and local guides.',
    icon: UserCheck
  },
  {
    name: 'Housekeeping Team',
    role: 'Maintenance & Cleanliness',
    description: 'Dedicated to maintaining pristine comfort throughout your stay.',
    icon: Home
  },
  {
    name: 'Management Team',
    role: 'Operations',
    description: 'Ensuring your experience exceeds expectations every single day.',
    icon: Users2
  }
];

const values = [
  {
    icon: Heart,
    title: 'Hospitality First',
    description: 'Every guest is family.'
  },
  {
    icon: Shield,
    title: 'Trust & Safety',
    description: 'A secure, worry-free stay.'
  },
  {
    icon: TreePine,
    title: 'Sustainability',
    description: 'Respecting our nature.'
  },
  {
    icon: Users2,
    title: 'Community',
    description: 'Empowering local culture.'
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/IMG-20250815-WA0004.jpg" 
            alt="About Hero"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        <div className="relative z-10 text-center max-w-4xl px-4 animate-slide-up">
           <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-md border border-white/40 mb-6 px-6 py-2 text-sm uppercase tracking-widest">
             Our Heritage
           </Badge>
           <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight drop-shadow-2xl">
             Our Story
           </h1>
           <p className="text-xl md:text-2xl text-white/90 font-light leading-relaxed">
             A colonial-era sanctuary reborn. Where tradition meets modern luxury in the heart of Ella's misty hills.
           </p>
        </div>
      </section>

      {/* Our Story Content */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
             <div className="relative inline-block">
               <span className="absolute -top-6 -left-6 text-9xl text-gray-100 font-serif z-0">“</span>
               <h2 className="text-4xl font-bold text-gray-900 relative z-10">We believe in creating <span className="text-hms-primary">moments</span>, not just stays.</h2>
             </div>
             <p className="text-lg text-gray-600 leading-relaxed">
               Berghaus Bungalow began with a simple vision: to offer travelers a home away from home. What started as a historic family residence has been lovingly restored into a boutique haven.
             </p>
             <p className="text-lg text-gray-600 leading-relaxed">
               Every corner of our property whispers stories of the past, while our amenities speak the language of modern comfort. We invite you to be part of our continuing journey.
             </p>
             <div className="flex gap-8 pt-4">
                <div className="flex flex-col">
                   <span className="text-3xl font-bold text-hms-primary">10+</span>
                   <span className="text-gray-500 text-sm uppercase tracking-wide">Years of Service</span>
                </div>
                <div className="flex flex-col">
                   <span className="text-3xl font-bold text-hms-primary">1k+</span>
                   <span className="text-gray-500 text-sm uppercase tracking-wide">Happy Guests</span>
                </div>
             </div>
          </div>
          <div className="relative h-[600px] w-full row-start-1 lg:row-start-auto">
             <div className="absolute right-0 top-0 w-4/5 h-4/5 rounded-3xl overflow-hidden shadow-2xl z-10">
                <Image src="/IMG-20250815-WA0005.jpg" alt="Interior" fill className="object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="absolute left-0 bottom-0 w-3/5 h-3/5 rounded-3xl overflow-hidden shadow-2xl z-20 border-8 border-white">
                <Image src="/IMG-20250815-WA0011.jpg" alt="Exterior" fill className="object-cover hover:scale-105 transition-transform duration-700" />
             </div>
             <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-hms-highlight/20 rounded-full blur-3xl opacity-50"></div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
             <div className="w-24 h-1 bg-hms-primary mx-auto rounded-full"></div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
             {values.map((item, idx) => (
               <Card key={idx} className="border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white group">
                 <CardContent className="p-8 text-center">
                   <div className="w-16 h-16 mx-auto mb-6 bg-hms-primary/5 rounded-full flex items-center justify-center group-hover:bg-hms-primary transition-colors duration-300">
                     <item.icon className="w-8 h-8 text-hms-primary group-hover:text-white transition-colors duration-300" />
                   </div>
                   <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                   <p className="text-gray-600 font-light">{item.description}</p>
                 </CardContent>
               </Card>
             ))}
           </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Life at Berghaus</h2>
           <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
              {galleryImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`relative cursor-pointer overflow-hidden rounded-2xl group ${idx === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'}`}
                  onClick={() => openLightbox(img.src, idx)}
                >
                   <Image src={img.src} alt={img.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <ExternalLink className="text-white w-8 h-8" />
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet The Team</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The people who make your stay magical.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all border border-gray-100 text-center relative overflow-hidden group">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-hms-primary to-hms-secondary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                 <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6 text-hms-primary group-hover:bg-hms-primary group-hover:text-white transition-colors">
                    <member.icon className="w-10 h-10" />
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-1">{member.name}</h3>
                 <p className="text-hms-secondary font-medium text-sm mb-4 uppercase tracking-wide">{member.role}</p>
                 <p className="text-gray-500 text-sm leading-relaxed">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <button onClick={closeLightbox} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
            <X className="w-10 h-10" />
          </button>
          
          <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
            <ChevronLeft className="w-12 h-12" />
          </button>
          
          <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
            <ChevronRight className="w-12 h-12" />
          </button>

          <div className="relative w-full max-w-5xl aspect-video">
            <Image
              src={galleryImages[currentImageIndex].src}
              alt={galleryImages[currentImageIndex].alt}
              fill
              className="object-contain"
            />
            <p className="absolute bottom-4 left-0 w-full text-center text-white/80 font-medium tracking-wide">
               {galleryImages[currentImageIndex].alt}
            </p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
