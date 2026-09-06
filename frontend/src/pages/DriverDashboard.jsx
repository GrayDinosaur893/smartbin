import React, { useEffect, useState } from 'react';
import { Truck, Camera, Navigation, CheckCircle2, ShieldCheck, MapPin, Route, X, Layers, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { API_BASE } from '../App';

// Custom Leaflet Icons for Driver Navigation
const driverMarkerIcon = L.divIcon({
  className: 'custom-driver-icon',
  html: `<div style="background-color:#2563eb; color:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(37,99,235,0.4); border:3px solid white; font-weight:bold; font-size:18px;">🚛</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

export default function DriverDashboard({ user, lang }) {
  const [driverData, setDriverData] = useState({ driver: {}, tasks: [], completed_today: 0 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [navTask, setNavTask] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [driverCoords, setDriverCoords] = useState([21.1904, 81.2849]);

  const loadDriverData = () => {
    axios.get(`${API_BASE}/driver/dashboard/${user.id}`)
      .then(res => setDriverData(res.data))
      .catch(err => console.error("Failed to load driver dashboard", err));
  };

  useEffect(() => {
    if (user?.id) loadDriverData();
    
    // Always request live hardware GPS position (maximumAge: 0 bypasses cached location)
    let watchId = null;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          if (coords[0] >= 17.7 && coords[0] <= 24.15) {
            setDriverCoords(coords);
          }
        },
        null,
        { enableHighAccuracy: true, maximumAge: 0, timeout: 15000 }
      );

      // Continuous live driver location tracking
      watchId = navigator.geolocation.watchPosition(
        pos => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          if (coords[0] >= 17.7 && coords[0] <= 24.15) {
            setDriverCoords(coords);
          }
        },
        null,
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [user]);

  const handleClockIn = (e) => {
    e.preventDefault();
    if (!selfie) return alert(lang === 'hi' ? "सेल्फी लेना आवश्यक है" : "Selfie required to clock in");

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('selfie', selfie);
    formData.append('lat', driverCoords[0]);
    formData.append('lng', driverCoords[1]);

    axios.post(`${API_BASE}/driver/clock-in`, formData)
      .then(() => loadDriverData())
      .catch(() => alert("Clock in failed"));
  };

  const handleSubmitCleaning = (e) => {
    e.preventDefault();
    if (!afterPhoto || !selectedTask) return alert(lang === 'hi' ? "सफाई के बाद की फोटो आवश्यक है" : "After photo required");

    const formData = new FormData();
    formData.append('user_id', user.id);
    formData.append('after_photo', afterPhoto);
    formData.append('driver_lat', selectedTask.lat);
    formData.append('driver_lng', selectedTask.lng);

    axios.post(`${API_BASE}/driver/submit-cleaning/${selectedTask.task_id}`, formData)
      .then(() => {
        setSelectedTask(null);
        setAfterPhoto(null);
        setNavTask(null);
        loadDriverData();
      })
      .catch(() => alert("Failed to submit proof"));
  };

  // Compute map center focused on driver or stops
  const mapCenter = driverData.tasks.length > 0 ? [driverData.tasks[0].lat, driverData.tasks[0].lng] : driverCoords;

  const polylinePoints = [
    driverCoords,
    ...driverData.tasks.map(t => [t.lat, t.lng])
  ];

  return (
    <div className="bg-slate-100 min-h-screen pb-12">
      {/* Premium Driver Header */}
      <div className="bg-slate-900 text-white py-8 px-4 border-b border-slate-800 shadow-md">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg">
              <Truck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {lang === 'hi' ? 'कचरा ट्रक चालक पोर्टल' : 'Garbage Truck Driver Portal'}
                </span>
              </div>
              <h1 className="text-2xl font-black mt-1 tracking-tight text-white">{driverData.driver?.name}</h1>
              <p className="text-xs text-slate-400 font-medium">
                {lang === 'hi' ? 'वाहन' : 'Vehicle'}: <span className="text-slate-200 font-bold">{driverData.driver?.vehicle_number}</span> · {driverData.driver?.assigned_zone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {driverData.driver?.clocked_in ? (
              <span className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 shadow">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse"></span>
                {lang === 'hi' ? 'ड्यूटी पर (ON DUTY)' : 'ON DUTY'}
              </span>
            ) : (
              <span className="bg-red-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow">
                {lang === 'hi' ? 'ऑफ ड्यूटी (OFF DUTY)' : 'OFF DUTY'}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-6">
        
        {/* Clock In Banner */}
        {!driverData.driver?.clocked_in && (
          <div className="bg-amber-50 border-2 border-amber-400 p-6 rounded-2xl shadow-sm text-center">
            <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto text-xl mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-base font-bold text-amber-900">
              {lang === 'hi' ? 'शिफ्ट क्लॉक-इन आवश्यक है' : 'Shift Clock-In Required'}
            </h2>
            <p className="text-xs text-amber-700 max-w-md mx-auto mt-1 mb-4">
              {lang === 'hi' ? 'आज का इष्टतम रूट अनलॉक करने के लिए अपने वाहन/डिपो पर एक सेल्फी लें।' : 'Take a verification selfie at your depot/vehicle to unlock today\'s route.'}
            </p>

            <form onSubmit={handleClockIn} className="max-w-xs mx-auto space-y-3">
              <input type="file" accept="image/*" capture="user" onChange={e => setSelfie(e.target.files[0])} className="text-xs border p-2 rounded-xl w-full bg-white" />
              <button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow transition">
                {lang === 'hi' ? 'शिफ्ट शुरू करें (Clock In)' : 'Clock In Shift Now'}
              </button>
            </form>
          </div>
        )}

        {/* Polished In-App Live Driver GIS Route Map */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-600" />
                {lang === 'hi' ? 'इन-ऐप चालक नेविगेशन नक्शा (C++ ऑप्टिमाइज़्ड)' : 'In-App Driver Route Map (C++ VRP)'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi' ? 'एप के अंदर सीधे प्रदर्शित लाइव टर्न-बाय-टर्न संग्रहण मार्ग।' : 'Live turn-by-turn collection sequence displayed directly inside the app.'}
              </p>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
              {driverData.tasks.length} {lang === 'hi' ? 'सक्रिय स्टॉप' : 'Active Stops'}
            </span>
          </div>

          {/* Map Container with Proper Height, Responsive Scaling & Isolated Z-Index */}
          <div className="h-64 sm:h-80 w-full border rounded-xl overflow-hidden shadow-inner relative z-0">
            <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© OpenStreetMap'
              />

              {/* Driver Live Location Marker */}
              <Marker position={driverCoords} icon={driverMarkerIcon}>
                <Popup><b>🚛 {lang === 'hi' ? 'आपका कचरा ट्रक' : 'Your Garbage Truck'}</b><br />{driverData.driver?.vehicle_number}</Popup>
              </Marker>

              {/* C++ VRP Optimized Route Polyline */}
              {driverData.tasks.length > 0 && (
                <Polyline positions={polylinePoints} color="#059669" weight={5} opacity={0.85} dashArray="6, 8" />
              )}

              {/* Collection Stops Markers */}
              {driverData.tasks.map(t => (
                <CircleMarker
                  key={`task-map-${t.task_id}`}
                  center={[t.lat, t.lng]}
                  radius={14}
                  pathOptions={{
                    color: t.is_illegal_dumping ? '#9333ea' : '#dc2626',
                    fillColor: t.is_illegal_dumping ? '#9333ea' : '#dc2626',
                    fillOpacity: 0.9
                  }}
                >
                  <Popup>
                    <b>Stop #{t.route_sequence}: {t.report_code}</b><br />
                    Type: {t.waste_type}<br />
                    <button
                      onClick={() => setSelectedTask(t)}
                      style={{ marginTop: '6px', backgroundColor: '#059669', color: 'white', padding: '5px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      Snap After Photo
                    </button>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* C++ VRP Task List */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                {lang === 'hi' ? 'आज का संग्रहण मार्ग' : "Today's Collection Route"}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {lang === 'hi' ? 'न्यूनतम दूरी और ईंधन की बचत के लिए C++ VRP इंजन द्वारा व्यवस्थित स्टॉप।' : 'Stops ordered by C++ solver for minimum distance and fuel usage.'}
              </p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-800 font-extrabold px-3 py-1.5 rounded-lg border border-slate-200">
              {lang === 'hi' ? 'आज पूर्ण:' : 'Completed Today:'} {driverData.completed_today}
            </span>
          </div>

          {driverData.tasks.length > 0 ? (
            <div className="space-y-4">
              {driverData.tasks.map(t => (
                <div key={t.task_id} className="border-2 border-slate-100 hover:border-emerald-500 rounded-2xl p-5 bg-white shadow-sm transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow">
                      #{t.route_sequence}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-slate-900">{t.report_code}</span>
                        {t.is_illegal_dumping ? (
                          <span className="bg-purple-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">🚨 ILLEGAL DUMPING</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">{t.severity.toUpperCase()}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 font-semibold mt-1">{t.waste_type}</p>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">GPS: {t.lat.toFixed(4)}, {t.lng.toFixed(4)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full md:w-auto">
                    <button
                      onClick={() => setNavTask(t)}
                      className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Navigation className="w-4 h-4" /> {lang === 'hi' ? 'नेविगेशन नक्शा' : 'In-App Nav Map'}
                    </button>
                    <button
                      onClick={() => setSelectedTask(t)}
                      className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl text-center transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Camera className="w-4 h-4" /> {lang === 'hi' ? 'सफाई की फोटो' : 'After Photo'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <span className="font-bold text-slate-700 text-sm block">
                {lang === 'hi' ? 'आपके मार्ग में वर्तमान में कोई सक्रिय कार्य नहीं है।' : 'No active tasks assigned to your route right now.'}
              </span>
            </div>
          )}
        </div>

        {/* In-App Turn-by-Turn Navigation Modal */}
        {navTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider">In-App Navigation Mode</span>
                  <h3 className="font-black text-xl text-slate-900 mt-0.5">Navigating to Stop #{navTask.route_sequence}: {navTask.report_code}</h3>
                </div>
                <button onClick={() => setNavTask(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="h-72 w-full border rounded-2xl overflow-hidden mb-4 shadow-inner">
                <MapContainer center={[navTask.lat, navTask.lng]} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={driverCoords} icon={driverMarkerIcon}>
                    <Popup><b>🚛 Your Truck Location</b></Popup>
                  </Marker>
                  <Marker position={[navTask.lat, navTask.lng]}>
                    <Popup><b>Target Stop: {navTask.report_code}</b></Popup>
                  </Marker>
                  <Polyline positions={[driverCoords, [navTask.lat, navTask.lng]]} color="#2563eb" weight={6} />
                </MapContainer>
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border mb-5 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">Target Waste Location</span>
                  <span className="font-bold text-slate-900 text-sm">{navTask.waste_type}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block font-medium">Target GPS</span>
                  <span className="font-mono font-bold text-blue-600">{navTask.lat.toFixed(4)}, {navTask.lng.toFixed(4)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setNavTask(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl text-xs transition">
                  Close Nav
                </button>
                <button
                  onClick={() => { setSelectedTask(navTask); setNavTask(null); }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition"
                >
                  <Camera className="w-4 h-4" /> Snap After Cleaning Photo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Submit After Photo Modal */}
        {selectedTask && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100">
              <h3 className="font-black text-xl text-slate-900 mb-1">Submit Proof of Cleaning</h3>
              <p className="text-xs text-slate-500 mb-5">Task ID: <span className="font-bold text-slate-900">{selectedTask.report_code}</span></p>

              <form onSubmit={handleSubmitCleaning} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">📸 Take "After Cleaning" Photo</label>
                  <input type="file" accept="image/*" capture="environment" onChange={e => setAfterPhoto(e.target.files[0])} required className="text-xs border p-3 rounded-xl w-full bg-slate-50" />
                </div>

                <div className="flex gap-3">
                  <button type="button" onClick={() => setSelectedTask(null)} className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl text-xs transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs shadow transition">
                    Submit Proof
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
