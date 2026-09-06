import React, { useState, useEffect } from 'react';
import { API_BASE } from '../App';
import { Building2, Award, Gift, Sparkles, HeartHandshake, MapPin, Filter, AlertCircle, Mail, Phone, MapPin as LocationIcon, Send } from 'lucide-react';

export default function Sponsors({ user, lang }) {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState('All');
  const [redeemedCode, setRedeemedCode] = useState(null);
  const [redeemError, setRedeemError] = useState(null);

  const fetchSponsors = async () => {
    try {
      const res = await fetch(`${API_BASE}/public/sponsors`);
      const data = await res.json();
      if (data.success) {
        setSponsors(data.sponsors || []);
      }
    } catch (err) {
      console.error('Error fetching sponsors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSponsors();
  }, []);

  const handleRedeem = async (sponsor) => {
    if (!user || !user.id) {
      setRedeemError(lang === 'hi' ? 'वाउचर भुनाने के लिए कृपया पहले अपने खाते में लॉगिन करें!' : 'Please login to your citizen account first to redeem sponsor vouchers!');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/sponsors/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, sponsor_id: sponsor.id })
      });
      const data = await res.json();

      if (data.success) {
        const updatedUser = {
          ...user,
          eco_points: data.remaining_points,
          cash_wallet_balance: data.remaining_wallet
        };
        localStorage.setItem('smartbin_user', JSON.stringify(updatedUser));

        setRedeemedCode({
          sponsor,
          code: data.voucher_code,
          points_spent: data.points_spent,
          remaining_points: data.remaining_points
        });
      } else {
        setRedeemError(data.error || 'Unable to redeem voucher');
      }
    } catch (err) {
      setRedeemError('Network error while redeeming voucher. Please try again.');
    }
  };

  const filteredSponsors = selectedCity === 'All' 
    ? sponsors 
    : sponsors.filter(s => s.city_scope === selectedCity || s.city_scope === 'All Chhattisgarh');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <Building2 className="w-96 h-96" />
          </div>

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-400/40 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-200">
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'hi' ? 'कॉर्पोरेट व सीएसआर पार्टनरशिप प्रोग्राम' : 'Corporate CSR & Local Business Partnership'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {lang === 'hi'
                ? 'छत्तीसगढ़ की कंपनियां व दुकानें भी दे सकती हैं वाउचर और सब्सिडी!'
                : 'Companies & Local Shops: Sponsor Vouchers & Give Subsidies!'}
            </h1>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              {lang === 'hi'
                ? 'स्मार्टबिन के साथ जुड़कर छत्तीसगढ़ को स्वच्छ बनाने वाले नागरिकों को अपनी कंपनी की ओर से डिस्काउंट वाउचर, सौर सब्सिडी, ईवी चार्जिंग पास और सीएसआर छूट प्रदान करें।'
                : 'Partner with SmartBin Chhattisgarh to reward eco-conscious citizens with exclusive store vouchers, solar subsidies, EV passes, and green shopping discounts under corporate CSR.'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href="#contact-us"
                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-extrabold px-5 py-3 rounded-2xl shadow-lg flex items-center gap-2 transition active:scale-95 text-xs sm:text-sm"
              >
                <Mail className="w-5 h-5 text-slate-900" />
                <span>{lang === 'hi' ? '✉️ संपर्क करें / ईमेल करें' : '✉️ Contact Us / Email Us'}</span>
              </a>

              <a
                href="#active-vouchers"
                className="bg-emerald-900/80 hover:bg-emerald-900 text-white border border-emerald-500 font-bold px-5 py-3 rounded-2xl shadow flex items-center gap-2 transition text-xs sm:text-sm"
              >
                <Gift className="w-4 h-4 text-amber-300" />
                <span>{lang === 'hi' ? 'सक्रिय वाउचर देखें' : 'View Sponsor Vouchers'}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 4-Pillar Business Value & CSR ROI Section */}
        <div className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-1">
            <h2 className="text-2xl font-black text-slate-900">
              {lang === 'hi' ? 'स्मार्टबिन से कंपनियों व ब्रांड्स को क्या फायदा है?' : 'Why Companies & Brands Sponsor SmartBin?'}
            </h2>
            <p className="text-xs text-slate-500 font-bold">
              {lang === 'hi' ? '3-वे विन सिस्टम: नागरिक को इनाम, ब्रांड को ग्राहक और नगर निगम को स्वच्छ शहर' : '3-Way Win Ecosystem: Rewards for Citizens, New Customers for Brands, Clean City for Municipality'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Pillar 1: Customer Acquisition */}
            <div className="touch-card bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center font-black">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === 'hi' ? '1. किफायती ग्राहक अधिग्रहण (Customer Acquisition)' : '1. Low-Cost Customer Acquisition'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'कंपनी ₹50 के 1,000 लक्षित वाउचर्स के लिए केवल ₹20-25 स्पोंसर करती है। नागरिक को ₹20 वाउचर मिलता है और वह सीधे आपकी दुकान या ऐप पर आता है!'
                  : 'Sponsor 1,000 targeted ₹50 vouchers for just ₹20–25 each. Citizens receive actionable store coupons and turn into repeat customers.'}
              </p>
              <div className="bg-emerald-50 p-3 rounded-xl text-[11px] font-bold text-emerald-900 border border-emerald-200">
                🎁 ₹20-25 Sponsor Fee → ₹50 Customer Voucher → High In-Store Conversion
              </div>
            </div>

            {/* Pillar 2: CSR / ESG Measurable Impact */}
            <div className="touch-card bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center font-black">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === 'hi' ? '2. प्रमाणित सीएसआर व ईएसजी प्रभाव (CSR Impact)' : '2. Measurable CSR & ESG Impact'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'केवल लोगो चिपकाने के बजाय वास्तविक डेटा-संचालित हरित प्रभाव दिखाएं:'
                  : 'Go beyond passive logos. Get real-time measurable city-cleaning data for corporate ESG audit compliance:'}
              </p>
              <div className="bg-slate-900 text-white p-3 rounded-xl text-[11px] space-y-1 font-mono">
                <div className="text-amber-400 font-bold">₹5,00,000 CSR Fund</div>
                <div className="text-slate-300">↓ 18,420 Citizens Rewarded</div>
                <div className="text-slate-300">↓ 32,000 Waste Reports</div>
                <div className="text-slate-300">↓ 12,400 Locations Cleaned</div>
                <div className="text-emerald-400 font-bold">↓ 7,800 Tons Waste Processed</div>
              </div>
            </div>

            {/* Pillar 3: Non-Irritating Brand Visibility */}
            <div className="touch-card bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center font-black">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-base">
                {lang === 'hi' ? '3. सकारात्मक ब्रांड दृश्यता (Brand Visibility)' : '3. Positive Brand Visibility'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {lang === 'hi'
                  ? 'बिना परेशान करने वाले विज्ञापनों के, नागरिक आपको एक पर्यावरण-रक्षक ब्रांड के रूप में देखते हैं:'
                  : 'Non-intrusive placement. Citizens connect your brand directly with community cleanliness and civic duty:'}
              </p>
              <div className="bg-amber-50 p-3 rounded-xl text-[11px] font-bold text-amber-900 border border-amber-200 space-y-1">
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Today's Eco Reward Powered by <b>[ Your Brand ]</b></span>
                </div>
                <p className="text-[10px] text-amber-700 italic">"Keep Chhattisgarh Clean, Save More!"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Title */}
        <div id="active-vouchers" className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-emerald-600" />
              <span>{lang === 'hi' ? 'प्रायोजक कंपनियों के सक्रिय वाउचर व सब्सिडी' : 'Active Corporate Vouchers & CSR Subsidies'}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{lang === 'hi' ? 'नागरिक अपने इको-पॉइंट्स से इन वाउचरों को मुफ्त में प्राप्त कर सकते हैं।' : 'Citizens can redeem these offers using earned Eco-Points (100 Pts = ₹1.00).'}</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-600">{lang === 'hi' ? 'शहर चुनें:' : 'Filter City:'}</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-slate-100 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="All">{lang === 'hi' ? 'पूरा छत्तीसगढ़ (All CG)' : 'All Chhattisgarh'}</option>
              <option value="Durg">Durg (दुर्ग)</option>
              <option value="Bhilai">Bhilai (भिलाई)</option>
              <option value="Raipur">Raipur (रायपुर)</option>
              <option value="Bilaspur">Bilaspur (बिलासपुर)</option>
              <option value="Korba">Korba (कोरबा)</option>
              <option value="Rajnandgaon">Rajnandgaon (राजनांदगांव)</option>
            </select>
          </div>
        </div>

        {/* Vouchers Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 font-bold">{lang === 'hi' ? 'वाउचर लोड हो रहे हैं...' : 'Loading corporate vouchers...'}</div>
        ) : filteredSponsors.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl text-center border border-slate-200">
            <p className="text-slate-500 font-bold">{lang === 'hi' ? 'इस शहर के लिए अभी कोई नया वाउचर उपलब्ध नहीं है।' : 'No vouchers available for this city currently.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSponsors.map((sponsor) => (
              <div key={sponsor.id} className="touch-card bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
                <div className="p-6 space-y-4">
                  
                  {/* Top Badge Header */}
                  <div className="flex justify-between items-start gap-2">
                    <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[11px] px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {sponsor.company_name}
                    </span>

                    <span className="bg-amber-100 text-amber-800 font-black text-[11px] px-2.5 py-1 rounded-lg border border-amber-300">
                      {sponsor.offer_type}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 transition">
                      {sponsor.offer_title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {sponsor.description}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                    <div className="flex items-center gap-1 text-slate-500 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{sponsor.city_scope}</span>
                    </div>

                    <div className="bg-emerald-100 text-emerald-800 font-black px-2.5 py-1 rounded-lg">
                      {sponsor.points_required} {lang === 'hi' ? 'अंक (Points)' : 'Eco-Points'}
                    </div>
                  </div>
                </div>

                {/* Redeem Button Footer */}
                <div className="bg-slate-50 p-4 border-t border-slate-100">
                  <button
                    onClick={() => handleRedeem(sponsor)}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Gift className="w-4 h-4 text-amber-300" />
                    <span>{lang === 'hi' ? 'वाउचर प्राप्त करें (Redeem)' : 'Redeem Sponsor Voucher'}</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Dedicated Contact Us Section */}
        <div id="contact-us" className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          <div className="max-w-2xl">
            <span className="bg-amber-100 text-amber-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              {lang === 'hi' ? 'कॉर्पोरेट व संस्थागत संपर्क' : 'Corporate & Sponsorship Contact'}
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              {lang === 'hi' ? 'स्मार्टबिन पार्टनरशिप हेतु संपर्क करें' : 'Partner / Sponsor With SmartBin'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {lang === 'hi' 
                ? 'यदि आपकी कंपनी, रिटेल स्टोर, या संस्था अपने सीएसआर (CSR) फंड के तहत स्मार्टबिन प्लेटफॉर्म पर वाउचर, सब्सिडी या प्रायोजन जोड़ना चाहती है, तो हमसे संपर्क करें।'
                : 'If your brand, enterprise, or retail store wants to partner with SmartBin Chhattisgarh or issue CSR sponsorship vouchers, get in touch with our partnerships desk.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 space-y-2">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500">{lang === 'hi' ? 'ईमेल संपर्क' : 'Email Address'}</div>
              <a href="mailto:smartbin@gmail.com" className="text-emerald-800 font-extrabold text-sm hover:underline block break-all">
                smartbin@gmail.com
              </a>
            </div>

            <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 space-y-2">
              <div className="w-10 h-10 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500">{lang === 'hi' ? 'टोल-फ्री हेल्पलाइन' : 'Toll-Free Helpline'}</div>
              <div className="text-slate-900 font-extrabold text-sm">
                1800-233-1042
              </div>
            </div>

            <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 space-y-2">
              <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center">
                <LocationIcon className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-500">{lang === 'hi' ? 'मुख्यालय पता' : 'Headquarters'}</div>
              <div className="text-slate-900 font-bold text-xs leading-snug">
                Bilaspur Municipal Corporation, Nehru Chowk, Bilaspur, CG 495001
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <a
              href="mailto:smartbin@gmail.com?subject=SmartBin%20Corporate%20Sponsorship%20Query"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow flex items-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>{lang === 'hi' ? 'ईमेल भेजें (smartbin@gmail.com)' : 'Send Email to smartbin@gmail.com'}</span>
            </a>
          </div>
        </div>

        {/* Redeemed Voucher Code Modal */}
        {redeemedCode && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95">
              <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-7 h-7" />
              </div>
              
              <div>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase">
                  {redeemedCode.sponsor.company_name}
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">{redeemedCode.sponsor.offer_title}</h3>
              </div>

              <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl">
                <p className="text-xs text-amber-800 font-bold mb-1">{lang === 'hi' ? 'आपका विशेष वाउचर कोड:' : 'Your Exclusive Promo Code:'}</p>
                <div className="font-mono text-xl font-black text-emerald-800 tracking-wider">
                  {redeemedCode.code}
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-800 text-[11px] font-bold py-2 rounded-xl border border-emerald-200">
                🎉 -{redeemedCode.points_spent} Eco-Points Deducted! (Remaining: {redeemedCode.remaining_points} Pts)
              </div>

              <p className="text-[11px] text-slate-500 leading-tight">
                {lang === 'hi' ? 'इस कोड को काउंटर पर दिखाएं या चेकआउट के दौरान इस्तेमाल करें।' : 'Show this promo code at the sponsor outlet or online checkout to redeem.'}
              </p>

              <button
                onClick={() => setRedeemedCode(null)}
                className="w-full bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl"
              >
                {lang === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            </div>
          </div>
        )}

        {/* Redemption Error / Warning Modal */}
        {redeemError && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-in zoom-in-95 border-2 border-amber-400">
              <div className="w-14 h-14 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <h3 className="font-extrabold text-slate-900 text-base">{lang === 'hi' ? 'वाउचर भुनाने में सूचना' : 'Voucher Redemption Notice'}</h3>

              <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl text-xs font-bold leading-relaxed border border-amber-200">
                {redeemError}
              </div>

              <button
                onClick={() => setRedeemError(null)}
                className="w-full bg-slate-900 text-white font-extrabold text-xs py-2.5 rounded-xl"
              >
                {lang === 'hi' ? 'ठीक है (OK)' : 'Got it'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
