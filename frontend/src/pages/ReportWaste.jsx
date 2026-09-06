import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Image, MapPin, Cpu, CheckCircle2, AlertTriangle, Search, Crosshair, Ban } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import axios from 'axios';
import { API_BASE } from '../App';

// Chhattisgarh Geographic Boundary Box (Lat: 17.7 to 24.15, Lng: 80.2 to 84.4)
function isInsideChhattisgarh(lat, lng) {
  return lat >= 17.70 && lat <= 24.15 && lng >= 80.20 && lng <= 84.40;
}

// Helper component to center Leaflet map programmatically
function ChangeMapView({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords && coords[0] && coords[1]) {
      map.setView(coords, 16);
    }
  }, [coords, map]);
  return null;
}

// Leaflet marker update handler with OpenStreetMap Nominatim Reverse Geocoding API
function LocationMarker({ position, setPosition, setAddress, setIsInCg }) {
  useMapEvents({
    click(e) {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      setPosition([lat, lng]);
      setIsInCg(isInsideChhattisgarh(lat, lng));
      fetchOsmAddress(lat, lng, setAddress);
    },
  });

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition([pos.lat, pos.lng]);
          setIsInCg(isInsideChhattisgarh(pos.lat, pos.lng));
          fetchOsmAddress(pos.lat, pos.lng, setAddress);
        },
      }}
    />
  );
}

// OpenStreetMap Nominatim Reverse Geocoding API Function
function fetchOsmAddress(lat, lng, setAddress) {
  setAddress('OpenStreetMap से पता खोजा जा रहा है...');
  const osmUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
  
  axios.get(osmUrl, { headers: { 'User-Agent': 'SmartBin/1.0' } })
    .then(res => {
      if (res.data && res.data.display_name) {
        setAddress(res.data.display_name);
      } else {
        setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
      }
    })
    .catch(() => {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    });
}

export default function ReportWaste({ user, lang }) {
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detectedLocation, setDetectedLocation] = useState([21.1904, 81.2849]);
  const [userLocation, setUserLocation] = useState([21.1904, 81.2849]);
  const [isInCg, setIsInCg] = useState(true);
  const [osmAddress, setOsmAddress] = useState('Durg, Chhattisgarh, India');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const getCurrentLiveLocation = () => {
    if (!navigator.geolocation) {
      alert(lang === 'hi' ? 'ब्राउज़र में जियोलोकेशन समर्थित नहीं है' : 'Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    // Request FRESH live hardware GPS position (maximumAge: 0 bypasses cached/recorded data)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setDetectedLocation(coords);
        setUserLocation(coords);
        setIsInCg(isInsideChhattisgarh(coords[0], coords[1]));
        fetchOsmAddress(coords[0], coords[1], setOsmAddress);
      },
      (err) => {
        setLocating(false);
        console.warn('High accuracy GPS retry...', err);
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const coords = [pos.coords.latitude, pos.coords.longitude];
            setDetectedLocation(coords);
            setUserLocation(coords);
            setIsInCg(isInsideChhattisgarh(coords[0], coords[1]));
            fetchOsmAddress(coords[0], coords[1], setOsmAddress);
          },
          () => alert(lang === 'hi' ? 'लाइव जीपीएस लोकेशन प्राप्त करने में विफल। कृपया जीपीएस अनुमति चालू करें।' : 'Failed to get live GPS location. Please turn on device GPS.'),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    getCurrentLiveLocation();

    // Continuous live real-time GPS position tracking
    let watchId = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setDetectedLocation(coords);
          setUserLocation(coords);
          setIsInCg(isInsideChhattisgarh(coords[0], coords[1]));
        },
        (err) => console.log('Live GPS watch active:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }
    return () => {
      if (watchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const handleOsmSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
    axios.get(searchUrl, { headers: { 'User-Agent': 'SmartBin/1.0' } })
      .then(res => {
        if (res.data && res.data.length > 0) {
          const first = res.data[0];
          const newCoords = [parseFloat(first.lat), parseFloat(first.lon)];
          setUserLocation(newCoords);
          setIsInCg(isInsideChhattisgarh(newCoords[0], newCoords[1]));
          setOsmAddress(first.display_name);
        } else {
          alert(lang === 'hi' ? 'OpenStreetMap पर यह स्थान नहीं मिला' : 'Location not found on OpenStreetMap');
        }
      })
      .catch(() => alert('OpenStreetMap API search failed'));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isInCg) {
      setError(lang === 'hi'
        ? 'क्षमा करें! स्मार्टबिन सेवा केवल छत्तीसगढ़ राज्य में उपलब्ध है।'
        : 'Sorry, SmartBin currently operates only in Chhattisgarh state!');
      return;
    }

    if (!photo) {
      setError(lang === 'hi' ? 'कृपया कचरे की फोटो लें या चुनें।' : 'Please take or select a photo of the waste.');
      return;
    }
    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('photo', photo);
    formData.append('user_id', user?.id || '');
    formData.append('lat_detected', detectedLocation[0]);
    formData.append('lng_detected', detectedLocation[1]);
    formData.append('lat_user', userLocation[0]);
    formData.append('lng_user', userLocation[1]);
    formData.append('user_notes', `${notes} [Address: ${osmAddress}]`);

    axios.post(`${API_BASE}/citizen/report-waste`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(res => {
        setLoading(false);
        if (res.data.success) {
          setResult(res.data);
        }
      })
      .catch((err) => {
        setLoading(false);
        setError(err.response?.data?.error || 'Failed to submit report. Please try again.');
      });
  };

  if (result) {
    const { report } = result;
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center">
          {report.status === 'verified' ? (
            <>
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 shadow-sm animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {lang === 'hi' ? 'सत्यापन पूर्ण' : 'Verification Complete'}
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-2">
                {lang === 'hi' ? 'रिपोर्ट सत्यापित ✅' : 'REPORT VERIFIED ✅'}
              </h1>
              <p className="text-xs text-slate-500 mt-1 mb-6">
                {lang === 'hi' ? 'रिपोर्ट आईडी' : 'Report ID'}: <span className="font-bold text-slate-900">{report.code}</span>
              </p>

              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-left text-xs space-y-3 mb-6">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{lang === 'hi' ? 'कचरा पहचाना गया' : 'Waste Detected'}</span>
                  <span className="font-bold text-emerald-600">✓ YES</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{lang === 'hi' ? 'नगर निगम राज्य' : 'State Jurisdiction'}</span>
                  <span className="font-bold text-emerald-800">Chhattisgarh</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{lang === 'hi' ? 'वर्गीकरण' : 'Classification'}</span>
                  <span className="font-bold text-slate-800">{report.waste_type}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-slate-500">{lang === 'hi' ? 'OpenStreetMap पता' : 'OpenStreetMap Address'}</span>
                  <span className="font-semibold text-slate-700 max-w-[200px] truncate">{osmAddress}</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl text-xs mb-3 font-medium">
                🎁 {lang === 'hi' ? 'आपने इस रिपोर्ट के लिए +100 इको-पॉइंट्स और ₹1.00 नकद पुरस्कार (100 अंक = ₹1.00) अर्जित किए हैं!' : 'You earned +100 Eco-Points & ₹1.00 Cash Reward (100 Pts = ₹1.00) for this report!'}
              </div>

              {/* 100% FREE Direct Cellular SMS & WhatsApp Alert Action */}
              <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-teal-900 text-white p-4 rounded-2xl mb-6 shadow-md text-left space-y-3 border border-emerald-500/40">
                <div className="flex items-center justify-between">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase">
                    {lang === 'hi' ? '100% मुफ्त मोबाइल एसएमएस / व्हाट्सएप अलर्ट' : '100% Free Cellular Alert'}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-mono font-bold">Target: +91 {user?.phone || '9876543210'}</span>
                </div>

                <p className="text-xs text-emerald-100 font-medium">
                  {lang === 'hi'
                    ? 'बिना किसी शुल्क के मोबाइल पर तुरंत एसएमएस या व्हाट्सएप संदेश भेजें:'
                    : 'Send 100% free direct SMS or WhatsApp alert straight to your phone:'}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <a
                    href={`sms:${user?.phone || '9876543210'}?body=${encodeURIComponent(`[SMARTBIN CG] Report ${report.code} Successful in ${report.city}! Waste: ${report.waste_type}`)}`}
                    className="flex-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs shadow text-center transition flex items-center justify-center gap-1.5"
                  >
                    <span>💬 {lang === 'hi' ? 'मुफ्त SMS ऐप खोलें' : 'Open Free SMS App'}</span>
                  </a>

                  <a
                    href={`https://api.whatsapp.com/send?phone=91${user?.phone || '9876543210'}&text=${encodeURIComponent(`[SMARTBIN CG] Report ${report.code} Successful in ${report.city}! Waste: ${report.waste_type}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-500 text-white font-black py-2.5 px-3 rounded-xl text-xs shadow text-center transition flex items-center justify-center gap-1.5"
                  >
                    <span>🟢 {lang === 'hi' ? 'व्हाट्सएप से भेजें' : 'Send WhatsApp Alert'}</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto text-4xl mb-4 shadow-sm">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-2">VERIFICATION UNCERTAIN ⚠️</h1>
              <p className="text-xs text-slate-500 mt-1 mb-6">Report ID: {report.code}</p>
            </>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate('/citizen/dashboard')} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition">
              {lang === 'hi' ? 'मेरा डैशबोर्ड' : 'My Dashboard'}
            </button>
            <button onClick={() => setResult(null)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs transition">
              {lang === 'hi' ? 'दूसरा स्थान रिपोर्ट करें' : 'Report Another Spot'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        <div className="border-b pb-4 mb-6">
          <span className="text-xs font-bold text-emerald-600 uppercase">
            {lang === 'hi' ? 'चरण 1 का 2' : 'Step 1 of 2'}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
            {lang === 'hi' ? 'कचरा / ओवरफ्लो डिब्बा रिपोर्ट करें' : 'Report Waste / Overflowing Bin'}
          </h1>
          <p className="text-xs text-slate-500">
            {lang === 'hi' ? 'AI विश्लेषण के लिए एक फोटो प्रदान करें और OpenStreetMap स्थिति सत्यापित करें।' : 'Provide a photo and verify your location with OpenStreetMap API.'}
          </p>
        </div>

        {/* DOMINOS / RAPIDO STYLE INSTANT AUTO-LOCATION BAR */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white p-4 rounded-2xl mb-6 shadow-md flex items-center justify-between gap-3 border border-emerald-400/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white text-emerald-700 rounded-xl flex items-center justify-center font-black shrink-0 shadow-sm">
              📍
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-900 text-emerald-200 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                  {lang === 'hi' ? 'लाइव जीपीएस ऑटो-डिटेक्ट' : 'Dominos & Rapido Style Auto-GPS'}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
              </div>
              <p className="text-xs font-bold text-white mt-0.5 truncate max-w-[240px] sm:max-w-md">
                {osmAddress || (lang === 'hi' ? 'आपकी लाइव लोकेशन ली जा रही है...' : 'Detecting your live GPS address...')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={getCurrentLiveLocation}
            className="bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-extrabold px-3.5 py-2 rounded-xl shadow transition shrink-0 active:scale-95 flex items-center gap-1 border border-emerald-200"
          >
            <Crosshair className={`w-4 h-4 text-emerald-700 ${locating ? 'animate-spin' : ''}`} />
            <span>{lang === 'hi' ? 'जीपीएस रिफ्रेश' : 'Refresh GPS'}</span>
          </button>
        </div>

        {/* OUTSIDE CHHATTISGARH STATE WARNING BANNER */}
        {!isInCg && (
          <div className="bg-red-50 border-2 border-red-500 text-red-900 p-4 rounded-xl text-xs mb-6 font-bold flex items-center gap-3 shadow-md animate-pulse">
            <Ban className="w-8 h-8 text-red-600 shrink-0" />
            <div>
              <span className="text-sm block">
                {lang === 'hi'
                  ? 'क्षमा करें! स्मार्टबिन सेवा केवल छत्तीसगढ़ राज्य में उपलब्ध है।'
                  : 'Sorry, SmartBin currently operates only in Chhattisgarh state!'}
              </span>
              <span className="text-[11px] font-normal text-red-700">
                {lang === 'hi'
                  ? 'कृपया नक्शे के पिन को छत्तीसगढ़ (दुर्ग, रायपुर, बिलासपुर, भिलाई...) में रखें।'
                  : 'Please move the map pin inside Chhattisgarh state boundaries (Durg, Raipur, Bilaspur...).'}
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Photo Step */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              📷 {lang === 'hi' ? 'फोटो कैप्चर / अपलोड' : 'Photo Capture / Upload'}
            </label>
            <div className="grid grid-cols-2 gap-4 mb-3">
              <label className="border-2 border-dashed border-emerald-400 hover:bg-emerald-50 p-4 rounded-xl text-center cursor-pointer transition">
                <Camera className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-800">{lang === 'hi' ? 'लाइव फोटो लें' : 'Take Photo (Live)'}</span>
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              </label>
              <label className="border-2 border-dashed border-slate-300 hover:bg-slate-50 p-4 rounded-xl text-center cursor-pointer transition">
                <Image className="w-8 h-8 text-slate-500 mx-auto mb-1" />
                <span className="block text-xs font-bold text-slate-800">{lang === 'hi' ? 'गैलरी से अपलोड करें' : 'Upload Gallery'}</span>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
            {preview && (
              <div className="text-center mt-2">
                <img src={preview} className="max-h-48 mx-auto rounded-lg border shadow-sm" />
              </div>
            )}
          </div>

          {/* OpenStreetMap Search, Live Location Button & Pin */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1">
                <MapPin className="w-4 h-4 text-emerald-600" />
                {lang === 'hi' ? 'OpenStreetMap स्थान पहचान' : 'OpenStreetMap Geolocation API'}
              </label>

              <button
                type="button"
                onClick={getCurrentLiveLocation}
                disabled={locating}
                className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold px-3 py-1 rounded-lg flex items-center gap-1 transition shadow-sm border border-emerald-300"
              >
                <Crosshair className={`w-3.5 h-3.5 ${locating ? 'animate-spin' : ''}`} />
                {locating ? (lang === 'hi' ? 'जीपीएस लिया जा रहा है...' : 'Locating...') : (lang === 'hi' ? '📍 मेरी लाइव लोकेशन लें' : '📍 Use Live GPS Location')}
              </button>
            </div>

            {/* OpenStreetMap Search Input */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={lang === 'hi' ? 'OpenStreetMap पर जगह खोजें (उदा: दुर्ग बस स्टैंड)...' : 'Search location on OpenStreetMap...'}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-grow px-3 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleOsmSearch}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition"
              >
                <Search className="w-4 h-4" /> {lang === 'hi' ? 'खोजें' : 'Search'}
              </button>
            </div>

            <div className="h-60 w-full border rounded-xl overflow-hidden shadow-inner mb-2">
              <MapContainer center={userLocation} zoom={16} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <ChangeMapView coords={userLocation} />
                <LocationMarker position={userLocation} setPosition={setUserLocation} setAddress={setOsmAddress} setIsInCg={setIsInCg} />
              </MapContainer>
            </div>

            {/* OpenStreetMap Address Display */}
            <div className={`p-3 rounded-xl text-xs border ${isInCg ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-300'}`}>
              <span className="font-bold block mb-0.5 text-slate-900">
                📍 {lang === 'hi' ? 'OpenStreetMap पता:' : 'OpenStreetMap Address:'}
              </span>
              <span className="font-medium text-slate-800">{osmAddress}</span>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              📝 {lang === 'hi' ? 'अतिरिक्त टिप्पणी (वैकल्पिक)' : 'Additional Note (Optional)'}
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows="2"
              placeholder={lang === 'hi' ? 'उदा: कचरा कल से ओवरफ्लो हो रहा है...' : 'e.g. Garbage overflowing since yesterday...'}
              className="w-full px-3 py-2 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isInCg}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2"
          >
            {loading ? <span>{lang === 'hi' ? 'AI द्वारा विश्लेषण किया जा रहा है...' : 'Analyzing with AI...'}</span> : (
              <>
                <span>{lang === 'hi' ? 'AI विश्लेषण के लिए जमा करें' : 'Submit for AI Analysis'}</span>
                <Cpu className="w-5 h-5 text-emerald-300" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
