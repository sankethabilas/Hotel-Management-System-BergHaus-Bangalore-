import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Search,
  Building,
  Phone,
  Mail,
  HelpCircle,
  Home
} from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openQuestions, setOpenQuestions] = useState([]);

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'booking', name: 'Booking & Reservations', icon: Home },
    { id: 'rooms', name: 'Rooms & Amenities', icon: Building },
    { id: 'policies', name: 'Policies', icon: HelpCircle },
    { id: 'services', name: 'Services', icon: Building },
    { id: 'payment', name: 'Payment & Billing', icon: Mail },
  ];

  const faqs = [
    // Booking & Reservations
    {
      category: 'booking',
      question: 'How do I make a reservation at BergHaus Hotel?',
      answer: 'You can make a reservation through our website, by calling our front desk at +91 80 1234 5678, or by emailing reservations@berghaus.com. We recommend booking in advance, especially during peak seasons, to ensure availability.'
    },
    {
      category: 'booking',
      question: 'What is your cancellation policy?',
      answer: 'We offer free cancellation up to 48 hours before your check-in date. Cancellations made within 48 hours of check-in will incur a charge of one night\'s stay. No-shows will be charged the full reservation amount.'
    },
    {
      category: 'booking',
      question: 'Can I modify my reservation after booking?',
      answer: 'Yes, you can modify your reservation by contacting our reservations team at least 24 hours before your check-in date. Changes are subject to availability and may affect the room rate.'
    },
    {
      category: 'booking',
      question: 'Do you offer group booking discounts?',
      answer: 'Yes! We offer special rates for groups of 10 or more rooms. Please contact our sales team at sales@berghaus.com or call +91 80 8765 4321 for customized group packages.'
    },
    
    // Rooms & Amenities
    {
      category: 'rooms',
      question: 'What time is check-in and check-out?',
      answer: 'Check-in time is 2:00 PM and check-out time is 12:00 PM (noon). Early check-in and late check-out may be available upon request, subject to availability and additional charges.'
    },
    {
      category: 'rooms',
      question: 'What amenities are included in the rooms?',
      answer: 'All our rooms include complimentary Wi-Fi, air conditioning, flat-screen TV, mini-bar, safe, tea/coffee maker, bathrobes, slippers, and premium toiletries. Suites include additional amenities like living areas and premium views.'
    },
    {
      category: 'rooms',
      question: 'Do you have rooms for guests with disabilities?',
      answer: 'Yes, we have specially designed accessible rooms with wheelchair access, roll-in showers, grab bars, and other accessibility features. Please request these rooms at the time of booking.'
    },
    {
      category: 'rooms',
      question: 'Are pets allowed at the hotel?',
      answer: 'We are a pet-friendly hotel! Small pets (under 15 kg) are welcome with prior notice. A cleaning fee of ₹1,500 per stay applies. Please inform us during booking if you\'re bringing a pet.'
    },
    {
      category: 'rooms',
      question: 'Do you provide cribs or extra beds?',
      answer: 'Yes, cribs are available free of charge for infants. Extra beds for children and adults can be provided for ₹1,000 per night. Please request these at the time of booking.'
    },

    // Policies
    {
      category: 'policies',
      question: 'What is your smoking policy?',
      answer: 'BergHaus Hotel is a non-smoking property. Smoking is only permitted in designated outdoor areas. A cleaning fee of ₹5,000 will be charged if smoking is detected in rooms.'
    },
    {
      category: 'policies',
      question: 'Is there a minimum age requirement for check-in?',
      answer: 'Guests must be at least 18 years old to check in. Valid government-issued photo ID (Aadhaar, Passport, Driving License) is required at check-in.'
    },
    {
      category: 'policies',
      question: 'What is your child policy?',
      answer: 'Children under 12 years stay free when using existing bedding. Children 12 years and above are considered adults and standard rates apply. We provide complimentary cribs for infants.'
    },
    {
      category: 'policies',
      question: 'Do I need to pay a security deposit?',
      answer: 'Yes, a refundable security deposit of ₹2,000 or a valid credit card authorization is required at check-in for incidental charges. The deposit is refunded at check-out if there are no additional charges.'
    },

    // Services
    {
      category: 'services',
      question: 'Do you offer airport transportation?',
      answer: 'Yes, we provide airport shuttle service for ₹1,500 each way. Complimentary airport pickup is included for suite bookings. Please inform us of your flight details at least 24 hours in advance.'
    },
    {
      category: 'services',
      question: 'Is breakfast included in the room rate?',
      answer: 'Breakfast inclusion depends on your room package. Some rates include complimentary breakfast, while others offer it as an add-on for ₹800 per person. Check your booking confirmation for details.'
    },
    {
      category: 'services',
      question: 'Do you have a fitness center and spa?',
      answer: 'Yes! Our 24/7 fitness center is complimentary for all guests. Our spa offers various treatments and massages (charges apply). Spa hours are 9:00 AM to 9:00 PM. Advance booking is recommended.'
    },
    {
      category: 'services',
      question: 'Is parking available?',
      answer: 'Yes, we offer complimentary valet parking for all guests. Self-parking is also available. EV charging stations are available for electric vehicles (charges apply).'
    },
    {
      category: 'services',
      question: 'Do you have conference facilities?',
      answer: 'Yes, we have state-of-the-art conference rooms and banquet halls that can accommodate 10 to 500 guests. Full event planning and catering services are available. Contact our events team for details.'
    },
    {
      category: 'services',
      question: 'Is there a swimming pool?',
      answer: 'Yes, we have a rooftop infinity pool with stunning city views. Pool hours are 6:00 AM to 10:00 PM. Pool access is complimentary for all hotel guests.'
    },

    // Payment & Billing
    {
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), debit cards, UPI, net banking, and cash. International cards are accepted with proper authorization.'
    },
    {
      category: 'payment',
      question: 'When will I be charged for my reservation?',
      answer: 'For prepaid bookings, payment is taken at the time of reservation. For flexible rate bookings, payment is collected at check-out. A pre-authorization hold may be placed on your card at check-in.'
    },
    {
      category: 'payment',
      question: 'Can I get an invoice for my stay?',
      answer: 'Yes, a detailed invoice will be provided at check-out. We can also email your invoice. For GST invoices, please provide your GSTIN at check-in.'
    },
    {
      category: 'payment',
      question: 'Do you charge resort fees or additional taxes?',
      answer: 'Room rates are exclusive of taxes. GST at applicable rates will be added to your bill. There are no hidden resort fees. All additional services (room service, spa, etc.) are charged separately.'
    },
    {
      category: 'payment',
      question: 'What is your loyalty program?',
      answer: 'Our BergHaus Rewards program offers exclusive benefits! Earn points on every stay, enjoy member-only rates, complimentary room upgrades (subject to availability), and special birthday perks. Join for free at the front desk or online.'
    },
  ];

  const toggleQuestion = (index) => {
    setOpenQuestions(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-amber-50">
      {/* Hero Section */}
      <div 
        className="relative h-80 bg-cover bg-center"
        style={{
          backgroundImage: 'linear-gradient(rgba(0, 107, 184, 0.85), rgba(47, 160, 223, 0.85)), url("https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
          <HelpCircle className="w-16 h-16 mb-4" />
          <h1 className="text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-center max-w-2xl px-4">
            Find answers to common questions about BergHaus Hotel
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-7xl">
        
        {/* Search Bar */}
        <div className="mb-12 -mt-8 relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400" />
              <input
                type="text"
                placeholder="Search for questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 shadow-xl bg-white"
              />
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeCategory === category.id
                      ? 'text-white shadow-lg transform -translate-y-0.5'
                      : 'bg-white text-gray-700 hover:shadow-md'
                  }`}
                  style={activeCategory === category.id ? { backgroundColor: '#006bb8' } : {}}
                >
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredFAQs.length}</span> question{filteredFAQs.length !== 1 ? 's' : ''}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <HelpCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or category filter
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300"
                style={{ backgroundColor: '#006bb8' }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${
                      faq.category === 'booking' ? '#006bb8' :
                      faq.category === 'rooms' ? '#2fa0df' :
                      faq.category === 'policies' ? '#ffc973' :
                      faq.category === 'services' ? '#006bb8' :
                      '#2fa0df'
                    }`
                  }}
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-left font-semibold text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {openQuestions.includes(index) ? (
                      <ChevronUp className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openQuestions.includes(index) && (
                    <div className="px-6 pb-4 pt-2 bg-gray-50">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Section */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div 
            className="rounded-2xl shadow-xl p-8 text-white"
            style={{
              background: 'linear-gradient(135deg, #006bb8 0%, #2fa0df 100%)'
            }}
          >
            <h3 className="text-2xl font-bold mb-4 text-center">Still Have Questions?</h3>
            <p className="text-center mb-6 opacity-90">
              Our friendly team is here to help you 24/7
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <a 
                href="tel:+918012345678"
                className="flex items-center justify-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-3 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span className="font-semibold">Call Us</span>
              </a>
              <a 
                href="mailto:info@berghaus.com"
                className="flex items-center justify-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-3 transition-all"
              >
                <Mail className="w-5 h-5" />
                <span className="font-semibold">Email Us</span>
              </a>
              <Link 
                to="/contact"
                className="flex items-center justify-center gap-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg px-4 py-3 transition-all"
              >
                <Building className="w-5 h-5" />
                <span className="font-semibold">Contact Page</span>
              </Link>
            </div>

            <div className="text-center">
              <p className="text-sm opacity-75">
                24/7 Support: +91 80 1234 5678 | info@berghaus.com
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FAQ;
