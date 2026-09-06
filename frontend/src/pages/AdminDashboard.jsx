import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Zap, Building2, Truck, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import axios from 'axios';
import { API_BASE } from '../App';

export default function AdminDashboard({ user, lang }) {
  const [adminData, setAdminData] = useState({
    current_date: '',
    kpis: { reports_today: 0, pending_review: 0, assigned_tasks: 0, cleaned_today: 0 },
    attention_required: { unverified_count: 0, high_priority_count: 0, inactive_drivers_count: 0, illegal_dumping_count: 0 },
    zones: [],
    dustbins: [],
    drivers: [],
    reports: []
  });

  const [selectedCity, setSelectedCity] = useState('Durg');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [optMessage, setOptMessage] = useState('');

  const loadAdminData = (city = selectedCity) => {
    axios.get(`${API_BASE}/admin/dashboard?city=${city}`)
      .then(res => {
        setAdminData(res.data);
        if (res.data.drivers.length > 0) {
          setSelectedDriver(res.data.drivers[0].id);
        } else {
          setSelectedDriver('');
        }
      })
      .catch(err => console.error("Failed to load admin dashboard", err));
  };

  useEffect(() => {
    loadAdminData(selectedCity);
  }, [selectedCity]);

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    setOptMessage('');
  };

  const handleOptimizeRoutes = (e) => {
    e.preventDefault();
    if (!selectedDriver) {
      alert(lang === 'hi' ? `कृपया ${selectedCity} क्षेत्र का ड्राइवर चुनें` : `Select a driver for ${selectedCity}`);
      return;
    }
    setOptMessage(`C++ VRP इंजन ${selectedCity} नगर निगम क्षेत्र के लिए निकटतम रूट बना रहा है...`);

    axios.post(`${API_BASE}/admin/optimize-routes`, { driver_id: selectedDriver })
      .then(res => {
        setOptMessage(res.data.message);
        loadAdminData(selectedCity);
      })
      .catch(() => setOptMessage('VRP Optimization failed'));
  };

  // City Depot Centers for Leaflet Map centering
  const cityMapCenters = {
    'Durg': [21.1904, 81.2849],
    'Bhilai': [21.2167, 81.3833],
    'Raipur': [21.2514, 81.6296],
    'Bilaspur': [22.0797, 82.1391],
    'Korba': [22.3595, 82.7501],
    'Rajnandgaon': [21.1000, 81.0333]
  };

  const currentCenter = cityMapCenters[selectedCity] || [21.1904, 81.2849];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex-grow p-6 max-w-7xl mx-auto">
        
        {/* Contextual Header with City Zone Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Chhattisgarh Municipal Corporations
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900">Good Morning, Admin</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{adminData.current_date} · {selectedCity} Municipal Corporation</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* City Municipal Zone Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border px-3 py-1.5 rounded-xl shadow-sm">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="text-xs font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
              >
                <option value="Durg">Durg Municipal Corporation</option>
                <option value="Bhilai">Bhilai Municipal Corporation</option>
                <option value="Raipur">Raipur Municipal Corporation</option>
                <option value="Bilaspur">Bilaspur Municipal Corporation</option>
                <option value="Korba">Korba Municipal Corporation</option>
                <option value="Rajnandgaon">Rajnandgaon Municipal Corporation</option>
              </select>
            </div>

            {/* C++ VRP Optimizer Button */}
            <form onSubmit={handleOptimizeRoutes} className="flex items-center gap-2">
              <select
                value={selectedDriver}
                onChange={e => setSelectedDriver(e.target.value)}
                className="px-3 py-2 border rounded-xl text-xs font-semibold bg-white outline-none shadow-sm"
              >
                {adminData.drivers.length > 0 ? (
                  adminData.drivers.map(d => (
                    <option key={d.id} value={d.id}>Assign Driver: {d.name}</option>
                  ))
                ) : (
                  <option value="">No driver in {selectedCity}</option>
                )}
              </select>

              <button
                type="submit"
                disabled={adminData.drivers.length === 0}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl shadow flex items-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4 text-amber-300" /> Optimize Route (C++ Engine)
              </button>
            </form>
          </div>
        </div>

        {optMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs mb-6 font-semibold flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{optMessage}</span>
          </div>
        )}

        {/* Live Snapshot KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-slate-400">Reports in {selectedCity}</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{adminData.kpis.reports_today}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-amber-500">Pending Review</span>
            <div className="text-3xl font-black text-amber-600 mt-1">{adminData.kpis.pending_review}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-blue-500">Assigned Tasks</span>
            <div className="text-3xl font-black text-blue-600 mt-1">{adminData.kpis.assigned_tasks}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase text-emerald-500">Cleaned Today</span>
            <div className="text-3xl font-black text-emerald-600 mt-1">{adminData.kpis.cleaned_today}</div>
          </div>
        </div>

        {/* Hero GIS Map & ATTENTION REQUIRED Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Live Waste Map Hero */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <MapPin className="text-emerald-600 w-4 h-4" /> {selectedCity} Municipal Corporation Map
              </h2>
              <div className="flex gap-3 text-[11px] font-semibold">
                <span className="text-red-600">🔴 Overflow</span>
                <span className="text-purple-600">🟣 Illegal</span>
                <span className="text-blue-500">🔵 Assigned</span>
                <span className="text-emerald-500">🟢 Cleaned</span>
              </div>
            </div>

            <div className="h-80 w-full border rounded-xl overflow-hidden shadow-inner">
              <MapContainer center={currentCenter} zoom={13} style={{ height: '100%', width: '100%' }} key={selectedCity}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {adminData.dustbins.map(b => (
                  <Marker key={`bin-${b.id}`} position={[b.lat, b.lng]}>
                    <Popup><b>Bin {b.code} ({b.city})</b><br />{b.name}</Popup>
                  </Marker>
                ))}
                {adminData.reports.map(r => (
                  <CircleMarker
                    key={`rep-${r.id}`}
                    center={[r.lat, r.lng]}
                    radius={9}
                    pathOptions={{
                      color: r.status === 'completed' ? 'green' : (r.is_illegal_dumping ? 'purple' : (r.status === 'assigned' ? 'blue' : 'red')),
                      fillColor: r.status === 'completed' ? 'green' : (r.is_illegal_dumping ? 'purple' : (r.status === 'assigned' ? 'blue' : 'red')),
                      fillOpacity: 0.8
                    }}
                  >
                    <Popup><b>{r.code} ({r.city})</b><br />{r.waste_type}<br />Status: {r.status}</Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* ATTENTION REQUIRED Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
            <h2 className="font-bold text-red-600 text-sm mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> ATTENTION REQUIRED ({selectedCity})
            </h2>

            <div className="space-y-3 flex-grow text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex justify-between items-center">
                <span>⏱️ {adminData.attention_required.unverified_count} reports waiting verification</span>
                <span className="font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-[10px]">REVIEW</span>
              </div>

              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 flex justify-between items-center">
                <span>🔥 {adminData.attention_required.high_priority_count} high-priority cases</span>
                <span className="font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded text-[10px]">URGENT</span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 flex justify-between items-center">
                <span>🚨 {adminData.attention_required.illegal_dumping_count} illegal dumping spots</span>
                <span className="font-bold bg-purple-200 text-purple-900 px-2 py-0.5 rounded text-[10px]">ILLEGAL</span>
              </div>
            </div>
          </div>

        </div>

        {/* Recent Reports */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm mb-4">REPORTS FEED ({selectedCity.toUpperCase()} ZONE)</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 uppercase font-semibold text-slate-500 border-b">
                <tr>
                  <th className="p-3">Report ID</th>
                  <th className="p-3">City Zone</th>
                  <th className="p-3">Waste Category</th>
                  <th className="p-3">AI Confidence</th>
                  <th className="p-3">Severity</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {adminData.reports.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{r.code}</td>
                    <td className="p-3 font-semibold text-emerald-800">{r.city}</td>
                    <td className="p-3">{r.waste_type}</td>
                    <td className="p-3 font-mono font-bold text-slate-800">{r.ai_confidence}%</td>
                    <td className="p-3">
                      {r.is_illegal_dumping ? (
                        <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-semibold">🚨 Illegal Dumping</span>
                      ) : (
                        <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded font-semibold">{r.severity.toUpperCase()}</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold">{r.status.toUpperCase()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
