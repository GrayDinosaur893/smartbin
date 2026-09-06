import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../App';

export default function Register({ setUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('citizen');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    axios.post(`${API_BASE}/auth/register`, { name, email, phone, role, password })
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
        setError(err.response?.data?.error || 'Registration failed');
      });
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border border-slate-100">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Create SmartBin Account</h2>
      <p className="text-sm text-slate-500 mb-6">Earn Eco-Points & Micro Cash Rewards for reporting waste.</p>

      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Email Address</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded-lg bg-white outline-none">
            <option value="citizen">Citizen (Report & Track Waste)</option>
            <option value="driver">Garbage Truck Driver / Worker</option>
            <option value="admin">Municipal Authority / Officer</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" />
        </div>

        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg shadow transition">
          Create Account
        </button>
      </form>
    </div>
  );
}
