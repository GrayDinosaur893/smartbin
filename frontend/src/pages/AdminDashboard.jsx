import React, { useEffect, useState } from 'react';
import { AlertTriangle, MapPin, Zap, Building2, Truck, ShieldAlert, CheckCircle2, Clock, Trash2, Camera, Eye, PlusCircle, User, Check, Sparkles, Filter, X, Send } from 'lucide-react';
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

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'dustbins', 'drivers', 'photos'
  const [selectedCity, setSelectedCity] = useState('Durg');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [optMessage, setOptMessage] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  // Selected report for photo inspection modal
  const [inspectReport, setInspectReport] = useState(null);

  // New Dustbin Form state
  const [showAddBinModal, setShowAddBinModal] = useState(false);
  const [newBinForm, setNewBinForm] = useState({
    location_name: '',
    city_name: 'Durg',
    lat: '21.1904',
    lng: '81.2849',
    capacity_liters: 750
  });

  const loadAdminData = (city = selectedCity) => {
    axios.get(`${API_BASE}/admin/dashboard?city=${city}`)
      .then(res => {
        setAdminData(res.data);
        if (res.data.drivers && res.data.drivers.length > 0) {
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
    setNewBinForm(prev => ({ ...prev, city_name: city }));
    setOptMessage('');
    setAssignSuccess('');
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

  // Assign Driver to a specific report
  const handleAssignDriverToReport = (reportId, driverId) => {
    if (!driverId) {
      alert('Please select a driver first');
      return;
    }
    axios.post(`${API_BASE}/admin/assign-driver`, { report_id: reportId, driver_id: driverId })
      .then(res => {
        if (res.data.success) {
          setAssignSuccess(res.data.message);
          loadAdminData(selectedCity);
          setTimeout(() => setAssignSuccess(''), 3000);
        }
      })
      .catch(err => alert('Failed to assign driver'));
  };

  // Create new Garbage Station / Dump Location
  const handleAddBinSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/admin/add-dustbin`, newBinForm)
      .then(res => {
        if (res.data.success) {
          alert(res.data.message);
          setShowAddBinModal(false);
          setNewBinForm({
            location_name: '',
            city_name: selectedCity,
            lat: '21.1904',
            lng: '81.2849',
            capacity_liters: 750
          });
          loadAdminData(selectedCity);
        }
      })
      .catch(err => alert('Failed to add garbage station'));
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
  const reportsList = adminData?.reports || [];
  const dustbinsList = adminData?.dustbins || [];
  const driversList = adminData?.drivers || [];

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
        
        {/* Contextual Header with City Zone Selector */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-700 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Chhattisgarh Municipal Admin
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900">Swachh Control Room Dashboard</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{adminData.current_date} · {selectedCity} Municipal Corporation</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* City Municipal Zone Selector Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-2xl shadow-sm">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <select
                value={selectedCity}
                onChange={handleCityChange}
                className="text-xs font-extrabold text-slate-800 bg-transparent outline-none cursor-pointer"
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
                className="px-3 py-2 border rounded-2xl text-xs font-extrabold bg-slate-50 outline-none shadow-sm"
              >
                {driversList.length > 0 ? (
                  driversList.map(d => (
                    <option key={d.id} value={d.id}>Assign Driver: {d.name}</option>
                  ))
                ) : (
                  <option value="">No driver in {selectedCity}</option>
                )}
              </select>

              <button
                type="submit"
                disabled={driversList.length === 0}
                className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 transition active:scale-95"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-current" /> Optimize Route (C++ Engine)
              </button>
            </form>
          </div>
        </div>

        {/* Feedback Messages */}
        {optMessage && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm">
            <Zap className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{optMessage}</span>
          </div>
        )}

        {assignSuccess && (
          <div className="bg-blue-50 border border-blue-300 text-blue-900 p-4 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{assignSuccess}</span>
          </div>
        )}

        {/* Navigation Admin Menu Tabs */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2 text-xs font-extrabold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{lang === 'hi' ? '📊 जीआईएस मैप व ओवरव्यू' : '📊 GIS Map & Overview'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dustbins')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
              activeTab === 'dustbins' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{lang === 'hi' ? '🗑️ डस्टबिन व डंप स्टेशन' : '🗑️ Garbage Stations & Dump Locations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
              activeTab === 'drivers' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{lang === 'hi' ? '🚛 चालक असाइनमेंट (Driver Dispatch)' : '🚛 Driver Assignment & Dispatch'}</span>
          </button>

          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition ${
              activeTab === 'photos' ? 'bg-emerald-700 text-white shadow' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>{lang === 'hi' ? '📸 कचरा फोटो निरीक्षण' : '📸 Waste Photo Inspection Feed'}</span>
          </button>
        </div>

        {/* Tab 1: Overview & GIS Map */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Snapshot KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-slate-400">Reports in {selectedCity}</span>
                <div className="text-3xl font-black text-slate-900 mt-1">{adminData.kpis.reports_today}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-amber-500">Pending Review</span>
                <div className="text-3xl font-black text-amber-600 mt-1">{adminData.kpis.pending_review}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-blue-500">Assigned Tasks</span>
                <div className="text-3xl font-black text-blue-600 mt-1">{adminData.kpis.assigned_tasks}</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold uppercase text-emerald-500">Cleaned Today</span>
                <div className="text-3xl font-black text-emerald-600 mt-1">{adminData.kpis.cleaned_today}</div>
              </div>
            </div>

            {/* Hero GIS Map & ATTENTION REQUIRED Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Live Waste Map Hero */}
              <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <MapPin className="text-emerald-600 w-4 h-4" /> {selectedCity} Municipal GIS Map
                  </h2>
                  <div className="flex flex-wrap gap-3 text-[11px] font-bold">
                    <span className="text-red-600">🔴 Overflow</span>
                    <span className="text-purple-600">🟣 Illegal</span>
                    <span className="text-blue-600">🔵 Assigned</span>
                    <span className="text-emerald-600">🟢 Cleaned</span>
                  </div>
                </div>

                <div className="h-96 w-full border rounded-2xl overflow-hidden shadow-inner">
                  <MapContainer center={currentCenter} zoom={13} style={{ height: '100%', width: '100%' }} key={selectedCity}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {dustbinsList.map(b => (
                      <Marker key={`bin-${b.id}`} position={[b.lat, b.lng]}>
                        <Popup><b>Bin {b.code} ({b.city})</b><br />{b.name}<br />Capacity: {b.capacity}L</Popup>
                      </Marker>
                    ))}
                    {reportsList.map(r => (
                      <CircleMarker
                        key={`rep-${r.id}`}
                        center={[r.lat, r.lng]}
                        radius={9}
                        pathOptions={{
                          color: r.status === 'completed' ? '#059669' : (r.is_illegal_dumping ? '#9333ea' : (r.status === 'assigned' ? '#2563eb' : '#dc2626')),
                          fillColor: r.status === 'completed' ? '#059669' : (r.is_illegal_dumping ? '#9333ea' : (r.status === 'assigned' ? '#2563eb' : '#dc2626')),
                          fillOpacity: 0.85
                        }}
                      >
                        <Popup>
                          <b>{r.code} ({r.city})</b><br />
                          {r.waste_type}<br />
                          Status: {r.status}
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                </div>
              </div>

              {/* ATTENTION REQUIRED Panel */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="font-extrabold text-red-600 text-sm mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> ATTENTION REQUIRED ({selectedCity})
                  </h2>

                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex justify-between items-center">
                      <span>⏱️ {adminData.attention_required.unverified_count} unverified reports</span>
                      <span className="font-extrabold bg-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-[10px]">REVIEW</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex justify-between items-center">
                      <span>🔥 {adminData.attention_required.high_priority_count} high-priority cases</span>
                      <span className="font-extrabold bg-red-200 text-red-900 px-2.5 py-1 rounded-lg text-[10px]">URGENT</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 flex justify-between items-center">
                      <span>🚨 {adminData.attention_required.illegal_dumping_count} illegal dumping spots</span>
                      <span className="font-extrabold bg-purple-200 text-purple-900 px-2.5 py-1 rounded-lg text-[10px]">ILLEGAL</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('photos')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-3 rounded-2xl shadow transition active:scale-95 flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Inspect All Waste Photos</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Garbage Stations & Dump Locations */}
        {activeTab === 'dustbins' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-emerald-600" />
                  <span>Municipal Garbage Stations & Dump Locations ({selectedCity})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Manage official municipal dustbins, dump yards, and transfer stations.</p>
              </div>

              <button
                onClick={() => setShowAddBinModal(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow flex items-center gap-1.5 transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Garbage Station / Dump Location</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dustbinsList.length === 0 ? (
                <div className="col-span-full bg-white p-8 rounded-3xl text-center border border-slate-200 text-slate-500 font-bold">
                  No garbage stations found for {selectedCity}. Click above to add one.
                </div>
              ) : (
                dustbinsList.map(bin => (
                  <div key={bin.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="bg-emerald-100 text-emerald-800 font-extrabold text-xs px-3 py-1 rounded-full">
                        {bin.code}
                      </span>
                      <span className="bg-slate-100 text-slate-700 font-bold text-[11px] px-2.5 py-1 rounded-lg">
                        {bin.capacity || 750}L Capacity
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">{bin.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Lat: {bin.lat}, Lng: {bin.lng}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-emerald-700 font-bold">Active Station</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bin.lat},${bin.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 hover:text-slate-900 font-bold underline"
                      >
                        Map View 🧭
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Driver Assignment & Dispatch */}
        {activeTab === 'drivers' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Driver Assignment & Dispatch ({selectedCity} Zone)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Assign pending waste reports and overflow cases to available municipal drivers.</p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 uppercase font-extrabold text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-4">Report Code</th>
                      <th className="p-4">Waste Type</th>
                      <th className="p-4">Severity</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4">Assigned Driver</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold">
                    {reportsList.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-4 font-extrabold text-slate-900">{r.code}</td>
                        <td className="p-4">{r.waste_type}</td>
                        <td className="p-4">
                          {r.is_illegal_dumping ? (
                            <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg font-black">🚨 Illegal Dump</span>
                          ) : (
                            <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-lg uppercase">{r.severity}</span>
                          )}
                        </td>
                        <td className="p-4 uppercase text-slate-800">{r.status}</td>
                        <td className="p-4">
                          <span className="text-emerald-800 font-extrabold">
                            {r.assigned_driver_name || 'Unassigned'}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <select
                              defaultValue={r.assigned_driver_id || ''}
                              id={`driver-select-${r.id}`}
                              className="px-2.5 py-1.5 border border-slate-300 rounded-xl text-xs font-bold bg-white"
                            >
                              <option value="">Select Driver</option>
                              {driversList.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => {
                                const sel = document.getElementById(`driver-select-${r.id}`);
                                handleAssignDriverToReport(r.id, sel ? sel.value : '');
                              }}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold px-3 py-1.5 rounded-xl shadow-sm transition active:scale-95 text-[11px]"
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Waste Photo Inspection Feed */}
        {activeTab === 'photos' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-emerald-600" />
                  <span>Waste Photo Inspection Feed ({selectedCity})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Inspect citizen waste uploads, AI vision analysis, and selfie verifications.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {reportsList.map(r => (
                <div key={r.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-4 space-y-3">
                    
                    {/* Waste Photo Container */}
                    <div className="relative h-48 bg-slate-900 rounded-2xl overflow-hidden group">
                      {r.image_url ? (
                        <img
                          src={r.image_url}
                          alt={r.code}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=60';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                          <Trash2 className="w-8 h-8" />
                          <span className="text-xs font-bold">Photo Uploaded</span>
                        </div>
                      )}

                      <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                        {r.code}
                      </div>

                      <div className="absolute bottom-3 left-3 bg-emerald-950/80 backdrop-blur-md text-emerald-300 text-[11px] font-bold px-2.5 py-1 rounded-lg">
                        AI: {r.ai_confidence}% Confidence
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h3 className="font-extrabold text-slate-900 text-sm">{r.waste_type}</h3>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-semibold">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>Reported by {r.user_name || 'Citizen'} ({r.city})</span>
                      </p>
                    </div>

                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100">
                    <button
                      onClick={() => setInspectReport(r)}
                      className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-sm transition active:scale-95 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>Inspect Full Photo & Verification</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal 1: Add Garbage Station Modal */}
        {showAddBinModal && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Trash2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base">Add Garbage Station</h3>
                    <p className="text-[11px] text-slate-500">Register new official dustbin or dump location</p>
                  </div>
                </div>
                <button onClick={() => setShowAddBinModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              <form onSubmit={handleAddBinSubmit} className="space-y-3 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Station / Location Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nehru Chowk Transfer Station"
                    value={newBinForm.location_name}
                    onChange={e => setNewBinForm({...newBinForm, location_name: e.target.value})}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">City Zone</label>
                    <select
                      value={newBinForm.city_name}
                      onChange={e => setNewBinForm({...newBinForm, city_name: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Durg">Durg</option>
                      <option value="Bhilai">Bhilai</option>
                      <option value="Raipur">Raipur</option>
                      <option value="Bilaspur">Bilaspur</option>
                      <option value="Korba">Korba</option>
                      <option value="Rajnandgaon">Rajnandgaon</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Capacity (Liters)</label>
                    <input
                      type="number"
                      value={newBinForm.capacity_liters}
                      onChange={e => setNewBinForm({...newBinForm, capacity_liters: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Latitude</label>
                    <input
                      type="text"
                      value={newBinForm.lat}
                      onChange={e => setNewBinForm({...newBinForm, lat: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Longitude</label>
                    <input
                      type="text"
                      value={newBinForm.lng}
                      onChange={e => setNewBinForm({...newBinForm, lng: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs py-3 rounded-xl shadow transition active:scale-95"
                >
                  Save Station Location
                </button>
              </form>

            </div>
          </div>
        )}

        {/* Modal 2: Photo Inspection Modal */}
        {inspectReport && (
          <div className="fixed inset-0 z-[10000] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                    Report {inspectReport.code}
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-base mt-0.5">{inspectReport.waste_type}</h3>
                </div>
                <button onClick={() => setInspectReport(null)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
              </div>

              {/* Full Waste Image */}
              <div className="h-64 bg-slate-950 rounded-2xl overflow-hidden relative">
                <img
                  src={inspectReport.image_url}
                  alt={inspectReport.code}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Details & AI Verification */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">AI CONFIDENCE</span>
                  <span className="font-mono font-extrabold text-slate-900">{inspectReport.ai_confidence}%</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">SEVERITY LEVEL</span>
                  <span className="font-extrabold text-amber-800 uppercase">{inspectReport.severity}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">CITY MUNICIPALITY</span>
                  <span className="font-bold text-slate-800">{inspectReport.city}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px] font-bold">REPORTED BY</span>
                  <span className="font-bold text-slate-800">{inspectReport.user_name || 'Citizen'}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${inspectReport.lat},${inspectReport.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-xs underline flex items-center gap-1"
                >
                  <MapPin className="w-3.5 h-3.5" /> Open Coordinates in Google Maps
                </a>

                <button
                  onClick={() => setInspectReport(null)}
                  className="bg-slate-900 text-white font-extrabold text-xs px-5 py-2 rounded-xl"
                >
                  Close Inspection
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
