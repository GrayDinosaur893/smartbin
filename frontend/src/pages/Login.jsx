import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Smartphone, Mail, Lock, KeyRound, ArrowRight, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../App';

export default function Login({ setUser }) {
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'email'
  
  // Mobile OTP state
  const [phone, setPhone] = useState('9876543210');
  const [otpStep, setOtpStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
  const [otpEntered, setOtpEntered] = useState('');
  const [demoOtp, setDemoOtp] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  // Email login state
  const [email, setEmail] = useState('citizen@smartbin.gov.in');
  const [password, setPassword] = useState('citizen123');
  
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const extractStringError = (err, fallback) => {
    const raw = err.response?.data?.error || err.message;
    if (typeof raw === 'string') return raw;
    if (raw && typeof raw === 'object') {
      return raw.message || JSON.stringify(raw);
    }
    return fallback;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    axios.post(`${API_BASE}/auth/send-otp`, { phone })
      .then(res => {
        setOtpLoading(false);
        if (res.data.success) {
          setDemoOtp(res.data.demo_otp);
          setOtpEntered(res.data.demo_otp); // Pre-fill for ultra smooth demo!
          setOtpStep(2);

          // Native Browser Toast Notification Trigger
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('SmartBin CG OTP Alert 📱', {
              body: `Your Mobile Login OTP is ${res.data.demo_otp}. Valid for 5 minutes.`,
            });
          } else if ('Notification' in window && Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('SmartBin CG OTP Alert 📱', {
                  body: `Your Mobile Login OTP is ${res.data.demo_otp}. Valid for 5 minutes.`
                });
              }
            });
          }
        }
      })
      .catch(err => {
        setOtpLoading(false);
        setError(extractStringError(err, 'Failed to send OTP to mobile number'));
      });
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    setOtpLoading(true);

    axios.post(`${API_BASE}/auth/verify-otp`, { phone, otp: otpEntered, city_zone: 'Bilaspur' })
      .then(res => {
        setOtpLoading(false);
        if (res.data.success) {
          const u = res.data.user;
          setUser(u);
          localStorage.setItem('smartbin_user', JSON.stringify(u));
          if (u.role === 'admin') navigate('/admin/dashboard');
          else if (u.role === 'driver') navigate('/driver/dashboard');
          else navigate('/citizen/dashboard');
        }
      })
      .catch(err => {
        setOtpLoading(false);
        setError(extractStringError(err, 'Invalid OTP entered. Please try again.'));
      });
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');

    axios.post(`${API_BASE}/auth/login`, { email, password })
      .then(res => {
        if (res.data.success) {
          const u = res.data.user;
          setUser(u);
          localStorage.setItem('smartbin_user', JSON.stringify(u));
          if (u.role === 'admin') navigate('/admin/dashboard');
          else if (u.role === 'driver') navigate('/driver/dashboard');
          else navigate('/citizen/dashboard');
        }
      })
      .catch(err => {
        setError(extractStringError(err, 'Failed to login'));
      });
  };

  return (
    <div className="max-w-md mx-auto my-10 px-4">
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md font-black text-2xl">
            🗑️
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">SmartBin CG Portal</h2>
          <p className="text-xs text-slate-500 font-semibold">Fast Mobile OTP & Single Sign-On Access</p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-extrabold text-slate-600">
          <button
            onClick={() => setLoginMethod('otp')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${loginMethod === 'otp' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-slate-900'}`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>📱 Mobile OTP</span>
          </button>

          <button
            onClick={() => setLoginMethod('email')}
            className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${loginMethod === 'email' ? 'bg-white text-emerald-800 shadow-sm font-black' : 'hover:text-slate-900'}`}
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            <span>✉️ Password</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-2xl text-xs font-bold border border-red-200">
            ⚠️ {error}
          </div>
        )}

        {/* MOBILE OTP LOGIN TAB */}
        {loginMethod === 'otp' && (
          <div>
            {otpStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-800">मोबाइल नंबर दर्ज करें (10-Digit Mobile Number) *</label>
                  <div className="flex items-center gap-2">
                    <span className="bg-slate-100 text-slate-700 px-3 py-3 rounded-xl border border-slate-300 font-mono font-extrabold">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-sm font-black"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {otpLoading ? <span>Sending OTP...</span> : (
                    <>
                      <span>📱 मोबाइल पर ओटीपी भेजें (Send OTP)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-bold text-slate-700">
                <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-2xl text-emerald-900 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>OTP dispatched to <b>+91 {phone}</b></span>
                  </div>
                  <button type="button" onClick={() => setOtpStep(1)} className="text-[11px] font-black underline text-emerald-800">Change</button>
                </div>

                {demoOtp && (
                  <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl text-amber-900 text-xs font-bold text-center">
                    📱 Your Live Verification OTP: <span className="font-mono text-base font-black text-emerald-800">{demoOtp}</span>
                  </div>
                )}

                <div>
                  <label className="block mb-1 text-slate-800">6-अंकों का ओटीपी दर्ज करें (Enter 6-Digit OTP) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpEntered}
                    onChange={(e) => setOtpEntered(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono text-center text-xl tracking-widest font-black text-emerald-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={otpLoading}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2"
                >
                  {otpLoading ? <span>Verifying...</span> : (
                    <>
                      <span>🔑 सत्यापित करें और लॉगिन करें (Verify & Login)</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* EMAIL & PASSWORD LOGIN TAB */}
        {loginMethod === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-sm py-3.5 rounded-2xl shadow-lg transition active:scale-95"
            >
              Sign In to SmartBin
            </button>
          </form>
        )}

        {/* Demo Logins Footer */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500 space-y-1">
          <p className="font-extrabold text-slate-700">⚡ Quick Demo Accounts:</p>
          <div className="flex flex-wrap justify-center gap-2 text-[11px] font-bold text-slate-600">
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">📱 9876543210 (Citizen OTP)</span>
            <span className="bg-slate-100 px-2.5 py-1 rounded-lg">🚛 Driver: driver@smartbin.gov.in</span>
          </div>
        </div>

      </div>
    </div>
  );
}
