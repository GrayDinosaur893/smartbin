import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, MapPin, Search, Crosshair, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../App';

// Helper component to center map programmatically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, 15);
    }
  }, [coords, map]);
  return null;
}

// Custom Leaflet Icons using L.divIcon for modern visual appearance
const dustbinIcon = L.divIcon({
  className: 'custom-dustbin-marker',
  html: `<div style="background-color:#059669; color:white; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 6px rgba(0,0,0,0.3); border:2px solid white; font-weight:bold;">🗑️</div>`,
  iconSize: [34, 34],
  iconAnchor: [17, 17]
});

const userLiveIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color:#2563eb; color:white; width:36px; height:36px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 6px rgba(37,99,235,0.3); border:2px solid white; font-weight:bold;">📍</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18]
});

export default function Home({ user, lang }) {
  const [data, setData] = useState({ dustbins: [], reports: [], stats: { active_reports: 0, cleaned_today: 0 } });
  const [mapCenter, setMapCenter] = useState([21.1904, 81.2849]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    axios.get(`${API_BASE}/public/waste-map`)
      .then(res => setData(res.data))
      .catch(err => console.error("Failed to load map data", err));

    // Dominos / Rapido style instant automatic live GPS permission prompt on load
    getLiveUserLocation();
  }, []);

  // Get user's live current location & update home map
  const getLiveUserLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'ब्राउज़र में जीपीएस समर्थित नहीं है' : 'Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setMapCenter(coords);
      },
      (err) => {
        setLocating(false);
        alert(lang === 'hi' ? 'लाइव जीपीएस लोकेशन प्राप्त करने में विफल। कृपया जीपीएस अनुमति दें।' : 'Failed to get live location');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // OpenStreetMap Search Handler for Home Map
  const handleOsmSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
    axios.get(searchUrl, { headers: { 'User-Agent': 'SmartBin/1.0' } })
      .then(res => {
        if (res.data && res.data.length > 0) {
          const first = res.data[0];
          const newCoords = [parseFloat(first.lat), parseFloat(first.lon)];
          setMapCenter(newCoords);
        } else {
          alert(lang === 'hi' ? 'OpenStreetMap पर यह स्थान नहीं मिला' : 'Location not found');
        }
      })
      .catch(() => alert('OpenStreetMap API search failed'));
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white py-12 px-4 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <span className="bg-emerald-600 text-emerald-100 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {lang === 'hi' ? 'Vite + React + OpenStreetMap + C++ प्लेटफार्म' : 'Vite + React + OpenStreetMap + C++ Platform'}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold mt-3 tracking-tight">
              {lang === 'hi' ? 'AI-संचालित स्मार्ट कचरा प्रबंधन' : 'AI-Powered Smart Waste Management'}
            </h1>
            <p className="mt-3 text-emerald-100 max-w-xl text-sm leading-relaxed">
              {lang === 'hi'
                ? 'अपने शहर को स्वच्छ रखें। फोटो खींचकर कचरा रिपोर्ट करें, AI से सत्यापन करवाएं, और पुरस्कार अर्जित करें।'
                : 'Keep your city clean. Snap a photo of overflowing bins, verify with AI, and earn micro cash rewards & government vouchers.'}
            </p>
          </div>

          <div className="w-full md:w-auto">
            <Link
              to="/report-waste"
              className="bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg flex items-center justify-center gap-3 text-lg transition transform hover:-translate-y-0.5"
            >
              <Camera className="w-6 h-6" />
              <span>{lang === 'hi' ? '📷 कचरा रिपोर्ट करें' : '📷 Report Waste Now'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Section: Interactive GIS Map & Snapshot */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Leaflet Map with OpenStreetMap Controls */}
          <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="text-emerald-600 w-5 h-5" />
                  {lang === 'hi' ? 'लाइव कचरा मानचित्र' : 'Live Community Waste Map'}
                </h2>
                <p className="text-xs text-slate-500">
                  {lang === 'hi' 
                    ? 'दुर्ग क्षेत्र में रिपोर्ट किए गए कचरे के डिब्बों और अवैध डंपिंग की वास्तविक समय स्थिति।' 
                    : 'Real-time status of reported dustbins & illegal dumping in Durg Zone.'}
                </p>
              </div>

              {/* Live Location Button */}
              <button
                onClick={getLiveUserLocation}
                disabled={locating}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition border border-emerald-300 shadow-sm shrink-0"
              >
                <Crosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
                {locating 
                  ? (lang === 'hi' ? 'जीपीएस लिया जा रहा है...' : 'Locating...') 
                  : (lang === 'hi' ? '📍 मेरी लाइव लोकेशन लें' : '📍 Use Live GPS Location')}
              </button>
            </div>

            {/* OpenStreetMap Search Bar */}
            <form onSubmit={handleOsmSearch} className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'OpenStreetMap पर जगह खोजें (उदा: दुर्ग बस स्टैंड)...' : 'Search place on OpenStreetMap...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-grow px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Search className="w-4 h-4" /> {lang === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </form>

            <div className="h-96 w-full border rounded-xl overflow-hidden shadow-inner relative">
              <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeMapView coords={mapCenter} />

                {/* User Live Location Marker if active */}
                {userLocation && (
                  <Marker position={userLocation} icon={userLiveIcon}>
                    <Popup><b>📍 {lang === 'hi' ? 'आपकी लाइव लोकेशन' : 'Your Live Location'}</b></Popup>
                  </Marker>
                )}

                {/* Custom Official Dustbin Markers */}
                {data.dustbins.map(b => (
                  <Marker key={`bin-${b.id}`} position={[b.lat, b.lng]} icon={dustbinIcon}>
                    <Popup>
                      <b>{lang === 'hi' ? 'डस्टबिन' : 'Dustbin'} {b.code}</b><br />
                      {b.location_name}<br />
                      {lang === 'hi' ? 'क्षमता' : 'Capacity'}: {b.capacity}L
                    </Popup>
                  </Marker>
                ))}

                {/* Active Reported Waste Circle Markers */}
                {data.reports.map(r => (
                  <CircleMarker
                    key={`rep-${r.id}`}
                    center={[r.lat, r.lng]}
                    radius={9}
                    pathOptions={{
                      color: r.status === 'completed' ? '#059669' : (r.is_illegal_dumping ? '#9333ea' : '#dc2626'),
                      fillColor: r.status === 'completed' ? '#059669' : (r.is_illegal_dumping ? '#9333ea' : '#dc2626'),
                      fillOpacity: 0.85
                    }}
                  >
                    <Popup>
                      <b>{lang === 'hi' ? 'रिपोर्ट' : 'Report'} {r.code}</b><br />
                      {lang === 'hi' ? 'प्रकार' : 'Type'}: {r.waste_type}<br />
                      {lang === 'hi' ? 'स्थिति' : 'Status'}: {r.status}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap gap-4 text-xs font-semibold mt-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border">
              <span className="flex items-center gap-1.5"><span class="text-base">🗑️</span> {lang === 'hi' ? 'सरकारी डस्टबिन' : 'Municipal Dustbin'}</span>
              <span className="flex items-center gap-1.5 text-red-600">🔴 {lang === 'hi' ? 'ओवरफ्लो कचरा' : 'Overflow Waste'}</span>
              <span className="flex items-center gap-1.5 text-purple-600">🟣 {lang === 'hi' ? 'अवैध डंपिंग' : 'Illegal Dumping'}</span>
              <span className="flex items-center gap-1.5 text-emerald-600">🟢 {lang === 'hi' ? 'साफ किया गया' : 'Cleaned'}</span>
            </div>
          </div>

          {/* Impact Stats */}
          <div className="flex flex-col gap-6">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">
                {lang === 'hi' ? 'आज का लाइव शहर का स्नैपशॉट' : "Today's Live City Snapshot"}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <span className="text-3xl font-black text-emerald-600">{data.stats.active_reports}</span>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {lang === 'hi' ? 'सक्रिय रिपोर्टें' : 'Active Reports'}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                  <span className="text-3xl font-black text-teal-600">{data.stats.cleaned_today}</span>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    {lang === 'hi' ? 'आज साफ किया गया' : 'Cleaned Today'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex-grow">
              <h3 className="font-bold text-slate-800 text-sm mb-3">
                {lang === 'hi' ? 'हाल की रिपोर्ट फ़ीड' : 'Recent Reports Feed'}
              </h3>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {data.reports.map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{r.code}</span>
                      <p className="text-slate-500">{r.waste_type}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded font-semibold ${r.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {r.status === 'completed'
                        ? (lang === 'hi' ? 'साफ किया गया ✅' : 'CLEANED ✅')
                        : (r.status === 'verified'
                            ? (lang === 'hi' ? 'सत्यापित' : 'VERIFIED')
                            : r.status.toUpperCase())}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
