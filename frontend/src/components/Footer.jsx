import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, Mail, MapPin, HeartHandshake, PlusCircle, MessageSquare, Send, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';
import { API_BASE } from '../App';

export default function Footer({ lang }) {
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: 'Bilaspur',
    subject: 'Grievance / Inquiry',
    message: ''
  });

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setShowContactModal(false);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        city: 'Durg',
        subject: 'Grievance / Inquiry',
        message: ''
      });
    }, 2500);
  };

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-10 pb-20 md:pb-10 px-4 sm:px-6 lg:px-8 mt-12 text-xs">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* 1. Dark Theme Corporate Sponsors & CSR Callout Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <Building2 className="w-64 h-64 text-emerald-400" />
          </div>

          <div className="space-y-2 max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full text-[11px] font-extrabold text-emerald-300">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'छत्तीसगढ़ सीएसआर व व्यापार सहयोग' : 'Corporate CSR & Business Opportunity'}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {lang === 'hi'
                ? 'छत्तीसगढ़ की कंपनियां भी दे सकती हैं डिस्काउंट वाउचर व सब्सिडी!'
                : 'Companies & Stores: Partner with SmartBin Chhattisgarh!'}
            </h2>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {lang === 'hi'
                ? 'जिंदल स्टील, टाटा पावर, लोकल सुपर बाजार की तरह आप भी स्मार्टबिन नागरिकों को अपनी कंपनी के डिस्काउंट वाउचर, सौर सब्सिडी, ईवी पास व सीएसआर छूट प्रदान कर सकते हैं।'
                : 'Offer store discount coupons, solar subsidies, EV charging passes, or CSR grants to citizens keeping Durg, Bhilai, Raipur & Bilaspur clean.'}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            <Link
              to="/sponsors"
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl shadow-xl transition active:scale-95 text-xs sm:text-sm flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-slate-950" />
              <span>{lang === 'hi' ? '🏢 संपर्क करें व वाउचर नियम' : '🏢 Contact Us & Terms'}</span>
            </Link>
          </div>
        </div>

        {/* 2. Contact Us & Municipal Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-4 border-t border-slate-900">
          
          {/* Column 1: About System */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-white font-black text-base">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <span>SMARTBIN CG</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {lang === 'hi'
                ? 'छत्तीसगढ़ राज्य हेतु AI-संचालित स्मार्ट ठोस अपशिष्ट प्रबंधन एवं सी++ वीआरपी मार्ग अनुकूलन प्रणाली।'
                : 'AI-Powered Solid Waste Management & Native C++ VRP Route Solver System for Chhattisgarh State.'}
            </p>
            <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? '24x7 म्यूनिसिपल कंट्रोल रूम' : '24x7 Municipal Control Center'}</span>
            </div>
          </div>

          {/* Column 2: Chhattisgarh Municipal Corporations */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {lang === 'hi' ? 'नगर निगम क्षेत्र (Municipalities)' : 'Covered Municipal Zones'}
            </h3>
            <ul className="space-y-1.5 text-slate-400 text-xs">
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Durg Municipal Corporation</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Bhilai Municipal Corporation</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Raipur Municipal Corporation</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Bilaspur Municipal Corporation</li>
              <li className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-emerald-400" /> Korba & Rajnandgaon Zones</li>
            </ul>
          </div>

          {/* Column 3: Helpline & Contact Details */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {lang === 'hi' ? '📞 संपर्क व हेल्पलाइन' : '📞 Contact & Helpline'}
            </h3>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{lang === 'hi' ? 'टोल फ्री नंबर' : 'Toll-Free Helpline'}</span>
                  <a href="tel:18002331042" className="text-white font-extrabold hover:text-emerald-400 transition">1800-233-1042</a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{lang === 'hi' ? 'ईमेल सपोर्ट' : 'Support Email'}</span>
                  <a href="mailto:smartbin@gmail.com" className="text-white font-bold hover:text-emerald-400 transition">smartbin@gmail.com</a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block">{lang === 'hi' ? 'मुख्य मुख्यालय' : 'Headquarters'}</span>
                  <span className="text-slate-300 font-medium">Bilaspur Municipal HQ, Nehru Chowk, Bilaspur, CG 495001</span>
                </div>
              </div>
            </div>
          </div>

          {/* Column 4: Quick Contact Action */}
          <div className="space-y-3">
            <h3 className="text-white font-extrabold text-xs uppercase tracking-wider">
              {lang === 'hi' ? 'शिकायत व संदेश' : 'Direct Inquiry'}
            </h3>
            <p className="text-slate-400 text-xs">
              {lang === 'hi' ? 'कचरा प्रबंधन शिकायत या सीएसआर पूछताछ हेतु सीधे कंट्रोल रूम को संदेश भेजें।' : 'Send a direct inquiry or waste management grievance to the control room.'}
            </p>

            <button
              onClick={() => setShowContactModal(true)}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold py-2.5 px-4 rounded-xl transition active:scale-95 shadow-md flex items-center justify-center gap-2 text-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-200" />
              <span>{lang === 'hi' ? '✉️ संपर्क करें (Contact Us)' : '✉️ Contact Control Room'}</span>
            </button>
          </div>

        </div>

        {/* Bottom Legal Copyright */}
        <div className="pt-6 border-t border-slate-900 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 SmartBin Chhattisgarh — Swachh Bharat Urban Mission (Chhattisgarh State).</p>
          <p className="font-mono text-[10px] text-slate-600">Built with React + Vite + OpenStreetMap + C++ VRP Engine</p>
        </div>

      </div>

      {/* Interactive Contact Us Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">{lang === 'hi' ? 'म्यूनिसिपल संपर्क फॉर्म' : 'Contact Control Center'}</h3>
                  <p className="text-[11px] text-slate-500">{lang === 'hi' ? 'छत्तीसगढ़ नगर निगम सहायता दल' : 'Chhattisgarh Waste Management Helpline'}</p>
                </div>
              </div>
              <button onClick={() => setShowContactModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            {contactSuccess ? (
              <div className="bg-emerald-50 border border-emerald-300 p-6 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-black text-emerald-900 text-sm">
                  {lang === 'hi' ? 'आपका संदेश नगर निगम कंट्रोल रूम को भेज दिया गया है!' : 'Your inquiry has been logged with the Municipal Control Room!'}
                </h4>
                <p className="text-xs text-emerald-700">{lang === 'hi' ? 'हेल्पलाइन टीम जल्द ही आपसे संपर्क करेगी।' : 'Our support team will connect with you shortly.'}</p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-3 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">{lang === 'hi' ? 'आपका नाम *' : 'Your Name *'}</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">{lang === 'hi' ? 'मोबाइल नंबर *' : 'Mobile Number *'}</label>
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">{lang === 'hi' ? 'शहर *' : 'City *'}</label>
                    <select
                      value={contactForm.city}
                      onChange={(e) => setContactForm({...contactForm, city: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    >
                      <option value="Durg">Durg (दुर्ग)</option>
                      <option value="Bhilai">Bhilai (भिलाई)</option>
                      <option value="Raipur">Raipur (रायपुर)</option>
                      <option value="Bilaspur">Bilaspur (बिलासपुर)</option>
                      <option value="Korba">Korba (कोरबा)</option>
                      <option value="Rajnandgaon">Rajnandgaon (राजनांदगांव)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">{lang === 'hi' ? 'संदेश / शिकायत विवरण *' : 'Inquiry / Grievance Details *'}</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Write your message or grievance details..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-2.5 rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'संदेश भेजें (Send Message)' : 'Send Inquiry Now'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </footer>
  );
}
