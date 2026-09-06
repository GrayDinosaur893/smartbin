import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, Plus, Sparkles, Wallet, Gift, Ticket, Bus, Trees, Droplets, ShieldCheck, Lock } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../App';

export default function CitizenDashboard({ user, lang }) {
  const [data, setData] = useState({ user: user, reports: [], pending_approvals: [] });
  const [redeemed, setRedeemed] = useState([]);

  const loadDashboard = () => {
    axios.get(`${API_BASE}/citizen/dashboard/${user.id}`)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to load dashboard", err));
  };

  useEffect(() => {
    if (user?.id) loadDashboard();
  }, [user]);

  const handleApproveProof = (proofId) => {
    axios.post(`${API_BASE}/citizen/approve-cleaning/${proofId}`, { user_id: user.id })
      .then(() => loadDashboard())
      .catch(() => alert("Failed to approve cleaning proof"));
  };

  const handleRedeemVoucher = (voucherCode, ptsCost) => {
    if ((data.user?.eco_points || 0) < ptsCost) {
      alert(lang === 'hi' ? `पर्याप्त इको-पॉइंट्स नहीं हैं! (आवश्यक: ${ptsCost} Pts)` : `Insufficient Eco-Points! Required: ${ptsCost} Pts`);
      return;
    }
    setRedeemed([...redeemed, voucherCode]);
    alert(lang === 'hi' ? `बधाई हो! वाउचर सफलतापूर्व क्लेम किया गया। वाउचर कोड: ${voucherCode}-2026-CG` : `Congratulations! Voucher claimed successfully. Code: ${voucherCode}-2026-CG`);
  };

  const credibleReportsCount = data.reports.filter(r => r.status === 'verified' || r.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">

      {/* Profile & Wallet Banner */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
            {data.user?.name?.[0] || 'C'}
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Good Day, {data.user?.name}</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              {lang === 'hi' ? 'नागरिक योगदानकर्ता' : 'Citizen Contributor'} · {data.user?.city_zone || 'Durg'} Municipal Corporation
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-emerald-50 border border-emerald-200 px-5 py-3 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">Eco-Points</span>
            <span className="text-2xl font-black text-emerald-700">{data.user?.eco_points || 0} Pts</span>
          </div>
          <div className="bg-teal-50 border border-teal-200 px-5 py-3 rounded-2xl text-center shadow-sm">
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">Cash Rewards (100 Pts = ₹1)</span>
            <span className="text-2xl font-black text-teal-700">₹{(data.user?.cash_wallet_balance || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 100 Verified Contributions → Eco Champion Sponsored Milestone */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-4 touch-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center font-black text-2xl shrink-0">
              🏆
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                {lang === 'hi' ? 'इको चैम्पियन रिवॉर्ड माइलस्टोन' : 'Eco Champion Milestone'}
              </span>
              <h2 className="text-lg sm:text-xl font-black mt-0.5">
                {lang === 'hi' ? '100 सत्यापित योगदान → इको चैम्पियन पुरस्कार स्टोर' : '100 Verified Reports → Eco Champion Rewards Store'}
              </h2>
            </div>
          </div>

          <span className="text-xs font-black bg-white text-slate-900 px-4 py-2 rounded-2xl shadow">
            {credibleReportsCount} / 100 {lang === 'hi' ? 'सत्यापित रिपोर्ट' : 'Verified Reports'}
          </span>
        </div>

        <div className="w-full bg-black/20 rounded-full h-4 overflow-hidden p-0.5 border border-white/20">
          <div className="bg-amber-300 h-full rounded-full transition-all duration-500 shadow" style={{ width: `${Math.min(100, (credibleReportsCount / 100) * 100)}%` }}></div>
        </div>

        <p className="text-xs text-amber-100 font-medium leading-relaxed">
          {lang === 'hi'
            ? '100 सत्यापित रिपोर्ट पूरा करने पर आप अपनी पसंद का स्पॉन्सर्ड इनाम चुन सकते हैं: 🥤 ₹100 फ़ूड वाउचर, 🛒 ₹150 शॉपिंग वाउचर, 🚕 ₹100 ईवी ट्रैवल वाउचर, या 🌱 वृक्षारोपण प्रमाण पत्र।'
            : 'Upon completing 100 verified reports, unlock your choice of sponsored Eco Champion rewards: 🥤 ₹100 Food Voucher, 🛒 ₹150 Supermarket Coupon, 🚕 ₹100 EV Pass, or 🌱 Plant-a-Tree Certificate.'}
        </p>

        {/* Milestone Choice Preview Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-slate-900 text-xs font-black">
          <div className="bg-white p-3 rounded-2xl text-center shadow-sm hover:shadow-md transition cursor-pointer">
            <span className="text-lg block">🥤</span>
            <span>₹100 Food Voucher</span>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center shadow-sm hover:shadow-md transition cursor-pointer">
            <span className="text-lg block">🛒</span>
            <span>₹150 Grocery Coupon</span>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center shadow-sm hover:shadow-md transition cursor-pointer">
            <span className="text-lg block">🚕</span>
            <span>₹100 EV Pass</span>
          </div>
          <div className="bg-white p-3 rounded-2xl text-center shadow-sm hover:shadow-md transition cursor-pointer">
            <span className="text-lg block">🌱</span>
            <span>Plant-a-Tree Cert</span>
          </div>
        </div>
      </div>

      {/* Pending Cleaning Proof Approvals */}
      {data.pending_approvals.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-400 p-6 rounded-3xl shadow-sm">
          <h2 className="text-lg font-extrabold text-emerald-900 mb-1 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-600 w-6 h-6" />
            {lang === 'hi' ? 'कार्रवाई आवश्यक: चालक की सफाई फोटो सत्यापित करें' : 'Action Required: Verify Driver Cleaning Proof'}
          </h2>
          <p className="text-xs text-emerald-700 mb-4">
            {lang === 'hi' ? 'चालक ने आपके द्वारा रिपोर्ट किए गए स्थान की सफाई कर दी है। फोटो देखकर स्वीकृत करें और +50 इको-पॉइंट्स पाएं!' : 'Driver cleaned your reported location. Inspect photo & approve to earn +50 Eco-Points!'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.pending_approvals.map(item => (
              <div key={item.proof_id} className="bg-white p-4 rounded-2xl shadow border border-emerald-200 flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-extrabold text-slate-900">{item.report_code}</span>
                  <span className="text-slate-500 font-medium">{item.waste_type}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Before (Citizen)</span>
                    <img src={item.before_image?.startsWith('http') ? item.before_image : `/static/${item.before_image}`} className="w-full h-28 object-cover rounded-xl border" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">After (Driver)</span>
                    <img src={item.after_image?.startsWith('http') ? item.after_image : `/static/${item.after_image}`} className="w-full h-28 object-cover rounded-lg border border-emerald-400" />
                  </div>
                </div>
                <button
                  onClick={() => handleApproveProof(item.proof_id)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approved / Cleaned ✅ (+50 Pts = ₹0.50)
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exchange Rewards & Government Voucher Store Section */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Gift className="w-6 h-6 text-amber-500" />
              {lang === 'hi' ? 'इनाम एक्सचेंज एवं सरकारी वाउचर स्टोर' : 'Exchange Rewards & Municipal Voucher Store'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {lang === 'hi' ? 'छत्तीसगढ़ सरकार और नगर निगम द्वारा जारी रिडीम योग्य वाउचर।' : 'Redeem your Eco-Points for official Municipal & Chhattisgarh Govt Subsidies.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Exclusive 100 Reports Free Government Voucher */}
          <div className="border-2 border-amber-300 bg-gradient-to-b from-amber-50 to-orange-50 p-5 rounded-2xl flex flex-col justify-between shadow-sm relative overflow-hidden">
            <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
              100 Reports Special
            </div>
            <div>
              <div className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center mb-3 shadow">
                <Ticket className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {lang === 'hi' ? 'निःशुल्क नगर निगम संपत्ति कर छूट वाउचर' : 'Free Municipal Property Tax Rebate'}
              </h3>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
                {lang === 'hi'
                  ? '100% निःशुल्क संपत्ति कर छूट एवं नगर निगम पानी बिल सब्सिडी वाउचर।'
                  : '100% Free Property Tax Rebate & Electricity Subsidy issued by Govt of Chhattisgarh.'}
              </p>
            </div>
            <div className="mt-4 border-t border-amber-200 pt-3">
              {credibleReportsCount >= 100 ? (
                <button
                  onClick={() => handleRedeemVoucher('GOVT-TAX-REBATE', 0)}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs py-2.5 rounded-xl shadow transition"
                >
                  🎁 {lang === 'hi' ? 'मुफ्त वाउचर क्लेम करें' : 'Claim Free Voucher'}
                </button>
              ) : (
                <div className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-3 py-2 rounded-xl text-center flex items-center justify-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  {credibleReportsCount}/100 {lang === 'hi' ? 'रिपोर्ट (Locked)' : 'Reports (Locked)'}
                </div>
              )}
            </div>
          </div>

          {/* Card 2: Free City Bus Pass */}
          <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-emerald-400 transition">
            <div>
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center mb-3">
                <Bus className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {lang === 'hi' ? 'नगर निगम सिटी बस पास (7 दिन)' : '7-Day Municipal Bus Pass'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {lang === 'hi' ? 'दुर्ग/रायपुर अर्बन सिटी बस में 7 दिनों का मुफ्त सफर।' : 'Free 7-day travel pass for Durg/Raipur City Urban Transport.'}
              </p>
            </div>
            <div className="mt-4 border-t pt-3 flex justify-between items-center">
              <span className="font-black text-emerald-600 text-xs">500 Pts</span>
              <button
                onClick={() => handleRedeemVoucher('CITY-BUS-7D', 500)}
                disabled={redeemed.includes('CITY-BUS-7D')}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl shadow transition"
              >
                {redeemed.includes('CITY-BUS-7D') ? (lang === 'hi' ? 'क्लेम हो गया' : 'Claimed') : (lang === 'hi' ? 'रिडीम करें' : 'Redeem')}
              </button>
            </div>
          </div>

          {/* Card 3: Municipal Plant Nursery & Compost */}
          <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-emerald-400 transition">
            <div>
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
                <Trees className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {lang === 'hi' ? 'सरकारी नर्सरी पौधे एवं खाद वाउचर' : 'Municipal Plant & Compost Pack'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {lang === 'hi' ? 'सरकारी नर्सरी से 2 मुफ्त पौधे और जैविक खाद थैला।' : '2 Free saplings & organic compost bag from Municipal Nursery.'}
              </p>
            </div>
            <div className="mt-4 border-t pt-3 flex justify-between items-center">
              <span className="font-black text-emerald-600 text-xs">300 Pts</span>
              <button
                onClick={() => handleRedeemVoucher('NURSERY-PLANT', 300)}
                disabled={redeemed.includes('NURSERY-PLANT')}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl shadow transition"
              >
                {redeemed.includes('NURSERY-PLANT') ? (lang === 'hi' ? 'क्लेम हो गया' : 'Claimed') : (lang === 'hi' ? 'रिडीम करें' : 'Redeem')}
              </button>
            </div>
          </div>

          {/* Card 4: Water Supply Bill Subsidy */}
          <div className="border border-slate-200 bg-white p-5 rounded-2xl flex flex-col justify-between shadow-sm hover:border-emerald-400 transition">
            <div>
              <div className="w-10 h-10 bg-teal-100 text-teal-700 rounded-xl flex items-center justify-center mb-3">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                {lang === 'hi' ? 'जल आपूर्ति बिल सब्सिडी वाउचर' : 'Water Supply Bill Subsidy'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1.5">
                {lang === 'hi' ? 'मासिक नगर निगम जल कर बिल में ₹100 की छूट।' : '₹100 discount on monthly Municipal Water Supply Bill.'}
              </p>
            </div>
            <div className="mt-4 border-t pt-3 flex justify-between items-center">
              <span className="font-black text-emerald-600 text-xs">1,000 Pts</span>
              <button
                onClick={() => handleRedeemVoucher('WATER-BILL-100', 1000)}
                disabled={redeemed.includes('WATER-BILL-100')}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-[11px] px-3.5 py-2 rounded-xl shadow transition"
              >
                {redeemed.includes('WATER-BILL-100') ? (lang === 'hi' ? 'क्लेम हो गया' : 'Claimed') : (lang === 'hi' ? 'रिडीम करें' : 'Redeem')}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* My Reports List */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-extrabold text-slate-900">
            {lang === 'hi' ? 'मेरी कचरा रिपोर्टें' : 'My Active & Past Reports'}
          </h2>
          <Link to="/report-waste" className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-emerald-700 transition flex items-center gap-1.5 shadow">
            <Plus className="w-4 h-4" /> {lang === 'hi' ? '+ कचरा रिपोर्ट करें' : '+ Report Waste'}
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">City</th>
                <th className="p-3">Type</th>
                <th className="p-3">Severity</th>
                <th className="p-3">AI Confidence</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{r.code}</td>
                  <td className="p-3 font-semibold text-emerald-800">{r.city}</td>
                  <td className="p-3">{r.waste_type}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-700">{r.ai_confidence}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {r.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{r.created_at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
