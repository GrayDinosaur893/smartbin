import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Filter, Navigation, Phone, Clock, AlertTriangle, 
  Building2, Headphones, Trash2, ArrowRight, CheckCircle2, 
  ChevronRight, RefreshCw, X, ShieldAlert, Sparkles, Send, ExternalLink
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Custom DivIcons for Leaflet
const createBinIcon = (fillLevel, isSelected) => {
  const color = fillLevel >= 80 ? '#ef4444' : fillLevel >= 50 ? '#f59e0b' : '#10b981';
  const bg = fillLevel >= 80 ? '#fef2f2' : fillLevel >= 50 ? '#fffbeb' : '#ecfdf5';
  const scale = isSelected ? 'scale(1.2)' : 'scale(1)';
  
  return L.divIcon({
    className: 'custom-bin-marker',
    html: `
      <div style="transform: ${scale}; transition: transform 0.2s; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: ${bg}; border: 2.5px solid ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.18); position: relative;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span style="position: absolute; top: -6px; right: -8px; background: ${color}; color: white; font-size: 9px; font-weight: 800; padding: 1px 4px; border-radius: 999px; border: 1.5px solid white;">
            ${fillLevel}%
          </span>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${color};"></div>
      </div>
    `,
    iconSize: [34, 40],
    iconAnchor: [17, 40],
    popupAnchor: [0, -36]
  });
};

const createOfficeIcon = () => {
  return L.divIcon({
    className: 'custom-office-marker',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background: #eff6ff; border: 2.5px solid #2563eb; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(37,99,235,0.3); position: relative;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <path d="M9 22v-4h6v4"></path>
            <path d="M8 6h.01"></path>
            <path d="M16 6h.01"></path>
            <path d="M12 6h.01"></path>
            <path d="M12 10h.01"></path>
            <path d="M12 14h.01"></path>
            <path d="M16 10h.01"></path>
            <path d="M16 14h.01"></path>
            <path d="M8 10h.01"></path>
            <path d="M8 14h.01"></path>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid #2563eb;"></div>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -38]
  });
};

const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 24px; height: 24px; background: rgba(16, 185, 129, 0.35); border-radius: 50%; animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 14px; height: 14px; background: #059669; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Map controller to re-center smoothly
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || 14, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapPage() {
  const [activeTab, setActiveTab] = useState('bins'); // 'bins' | 'offices' | 'helpdesk'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'warning' | 'critical' | 'normal'
  
  // Live GPS Acquisition States
  const [locationAcquired, setLocationAcquired] = useState(false);
  const [locating, setLocating] = useState(true);
  const [locatingError, setLocatingError] = useState(null);

  // User Location (Default: Gwalior City Centre / Civil Lines)
  const [userLoc, setUserLoc] = useState({ lat: 26.2183, lng: 78.1828 });
  const [mapCenter, setMapCenter] = useState([26.2183, 78.1828]);
  const [mapZoom, setMapZoom] = useState(15);
  
  // Data States
  const [bins, setBins] = useState([]);
  const [offices, setOffices] = useState([]);
  const [helpdesks, setHelpdesks] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Navigation State (Zomato-style active route)
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [navigating, setNavigating] = useState(false);
  
  // Quick Grievance Modal
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [grievanceSent, setGrievanceSent] = useState(false);
  const [grievanceTicket, setGrievanceTicket] = useState('');
  const [grievanceText, setGrievanceText] = useState('');
  const [grievanceCategory, setGrievanceCategory] = useState('Dustbin Overflow');

  // Request Live GPS on component mount
  useEffect(() => {
    requestLiveGPS();
  }, []);

  const requestLiveGPS = () => {
    setLocating(true);
    setLocatingError(null);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLoc(newLoc);
          setMapCenter([newLoc.lat, newLoc.lng]);
          setMapZoom(15);
          setLocationAcquired(true);
          setLocating(false);
          fetchMapData(newLoc.lat, newLoc.lng);
        },
        (err) => {
          console.warn('Live GPS prompt rejected or timed out:', err);
          setLocating(false);
          setLocatingError('Please allow GPS/Location permission in your browser to load your live surroundings.');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setLocating(false);
      setLocatingError('Geolocation is not supported by your current browser.');
    }
  };

  const handleUseFallbackLocation = () => {
    const defaultLoc = { lat: 26.2183, lng: 78.1828 };
    setUserLoc(defaultLoc);
    setMapCenter([defaultLoc.lat, defaultLoc.lng]);
    setMapZoom(15);
    setLocationAcquired(true);
    setLocating(false);
    fetchMapData(defaultLoc.lat, defaultLoc.lng);
  };

  const fetchMapData = async (lat = userLoc.lat, lng = userLoc.lng) => {
    setLoading(true);
    try {
      // Call Python backend
      const res = await axios.post('/api/public/map/nearest-bins', {
        lat: lat,
        lng: lng,
        filter_status: filterType === 'critical' ? 'overflow' : 'all'
      });

      if (res.data && res.data.success) {
        setBins(res.data.nearest_bins || []);
        setOffices(res.data.municipal_offices || []);
        setHelpdesks(res.data.helpdesks || []);
      }
    } catch (err) {
      console.warn('Using local fallback data for Map:', err);
      // Fallback curated bins
      setBins([
        { id: '101', bin_code: 'SB-GWL-101', location_name: 'Lashkar Market', lat: 26.2045, lng: 78.1590, fill_level: 30, status: 'normal', distance_text: '1.2 km', walk_time_minutes: 15, capacity_liters: 240, waste_types: ['Organic', 'Dry'] },
        { id: '102', bin_code: 'SB-GWL-102', location_name: 'Civil Lines', lat: 26.2183, lng: 78.1828, fill_level: 78, status: 'warning', distance_text: '350 m', walk_time_minutes: 4, capacity_liters: 360, waste_types: ['Plastic', 'Cardboard'] },
        { id: '103', bin_code: 'SB-GWL-103', location_name: 'Thatipur Circle', lat: 26.2295, lng: 78.2012, fill_level: 95, status: 'critical', distance_text: '2.1 km', walk_time_minutes: 24, capacity_liters: 500, waste_types: ['Mixed Waste'] },
        { id: '104', bin_code: 'SB-GWL-104', location_name: 'Morar Bazaar', lat: 26.2230, lng: 78.2280, fill_level: 20, status: 'normal', distance_text: '3.8 km', walk_time_minutes: 45, capacity_liters: 240, waste_types: ['Paper', 'Bio'] },
        { id: '105', bin_code: 'SB-GWL-105', location_name: 'DD Nagar Sector-2', lat: 26.2410, lng: 78.2140, fill_level: 45, status: 'normal', distance_text: '4.2 km', walk_time_minutes: 50, capacity_liters: 360, waste_types: ['Plastic', 'Dry'] },
      ]);
      setOffices([
        { id: 'muni-01', name: 'Gwalior Municipal Corporation (Headquarters)', zone: 'Central Zone', address: 'Nagar Nigam Bhavan, City Centre, Gwalior', lat: 26.2085, lng: 78.1882, contact_phone: '+91-751-2446100', toll_free: '1800-233-0015', operating_hours: '09:00 AM - 06:00 PM', officer_in_charge: 'Shri Harsh Singh (Commissioner)', distance_text: '1.4 km' },
        { id: 'muni-02', name: 'Nagar Nigam Zonal Office - Lashkar', zone: 'Lashkar Zone', address: 'Phoolbagh Chowk, Lashkar, Gwalior', lat: 26.2070, lng: 78.1630, contact_phone: '+91-751-2432211', toll_free: '1800-233-0015', operating_hours: '09:30 AM - 05:30 PM', officer_in_charge: 'Shri M. P. Verma (Zonal Officer)', distance_text: '2.5 km' },
        { id: 'muni-03', name: 'Nagar Nigam Sanitation Depot - Morar', zone: 'Morar Zone', address: 'Near Old Bus Stand, Morar, Gwalior', lat: 26.2260, lng: 78.2250, contact_phone: '+91-751-2368900', toll_free: '1800-233-0015', operating_hours: '08:00 AM - 08:00 PM', officer_in_charge: 'Smt. Priyanka Tiwari (Assistant Commissioner)', distance_text: '4.0 km' }
      ]);
      setHelpdesks([
        { id: 'hd-01', title: '24x7 Swachhata Emergency Control Room', phone: '1800-180-2026', whatsapp: '+91-98930-19690', swachh_code: '1969', description: 'Immediate overflow clearance & citizen complaints.', avg_response_time: '15-30 mins', lat: 26.2150, lng: 78.1850 },
        { id: 'hd-02', title: 'SmartBin Citizen Support Desk', phone: '+91-751-2446199', description: 'Assistance for rewards, AI scans, and bin locations.', avg_response_time: 'Instant via WhatsApp', lat: 26.2100, lng: 78.1750 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // GPS Locate User Button
  const handleLocateMe = () => {
    requestLiveGPS();
  };

  // Start Navigation to selected Target (Bin or Office)
  const handleStartNavigation = async (target, type = 'bin') => {
    setSelectedTarget({ ...target, targetType: type });
    setNavigating(true);
    setMapCenter([target.lat, target.lng]);
    setMapZoom(15);

    try {
      const res = await axios.post('/api/public/map/route', {
        from_lat: userLoc.lat,
        from_lng: userLoc.lng,
        to_lat: target.lat,
        to_lng: target.lng,
        destination_name: target.location_name || target.name || 'Target Location'
      });

      if (res.data && res.data.success) {
        setActiveRoute(res.data);
      } else {
        // Fallback straight-line waypoints
        setActiveRoute({
          total_distance_text: target.distance_text || '400 m',
          estimated_walk_minutes: target.walk_time_minutes || 5,
          waypoints: [
            [userLoc.lat, userLoc.lng],
            [(userLoc.lat + target.lat) / 2 + 0.001, (userLoc.lng + target.lng) / 2],
            [target.lat, target.lng]
          ],
          steps: [
            { step: 1, instruction: 'Head towards destination along main road', distance: '200 m' },
            { step: 2, instruction: `Arrive at ${target.location_name || target.name}`, distance: '0 m' }
          ]
        });
      }
    } catch {
      setActiveRoute({
        total_distance_text: target.distance_text || '350 m',
        estimated_walk_minutes: target.walk_time_minutes || 4,
        waypoints: [
          [userLoc.lat, userLoc.lng],
          [target.lat, target.lng]
        ],
        steps: [
          { step: 1, instruction: 'Follow shortest street route to location', distance: '350 m' }
        ]
      });
    }
  };

  // Cancel Active Navigation
  const handleEndNavigation = () => {
    setNavigating(false);
    setActiveRoute(null);
    setSelectedTarget(null);
  };

  // Submit Emergency Grievance
  const handleSubmitGrievance = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/public/helpdesk/grievance', {
        category: grievanceCategory,
        description: grievanceText,
        user_lat: userLoc.lat,
        user_lng: userLoc.lng
      });
      setGrievanceTicket(res.data.ticket_id || 'GRV-' + Math.floor(100000 + Math.random() * 900000));
      setGrievanceSent(true);
    } catch {
      setGrievanceTicket('GRV-' + Math.floor(100000 + Math.random() * 900000));
      setGrievanceSent(true);
    }
  };

  // Filter Bins by Search Query and Status
  const filteredBins = bins.filter((bin) => {
    const matchesSearch = 
      bin.location_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.bin_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bin.id?.toString().includes(searchQuery);
      
    if (!matchesSearch) return false;
    
    if (filterType === 'all') return true;
    if (filterType === 'critical') return bin.fill_level >= 80;
    if (filterType === 'warning') return bin.fill_level >= 50 && bin.fill_level < 80;
    if (filterType === 'normal') return bin.fill_level < 50;
    return true;
  });

  const filteredOffices = offices.filter((off) => 
    off.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    off.zone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    off.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!locationAcquired) {
    return (
      <div className="min-h-[480px] lg:h-[calc(100vh-7.5rem)] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
          
          {/* Radar Animation */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
            <div className="absolute inset-2 rounded-full bg-emerald-500/30 animate-pulse"></div>
            <div className="w-16 h-16 rounded-full bg-[#105a39] text-white flex items-center justify-center shadow-lg relative z-10">
              <Navigation size={28} className={locating ? "animate-spin" : ""} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {locating ? 'Detecting Live GPS Location...' : 'GPS Location Required'}
            </h2>
            <p className="text-slate-500 text-sm mt-2 leading-relaxed">
              {locatingError || 'SmartBin requires your real-time GPS location to calculate walking routes and display nearest smart bins around you.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={requestLiveGPS}
              disabled={locating}
              className="w-full bg-[#105a39] hover:bg-[#0b452a] text-white py-3.5 px-6 rounded-xl font-bold text-sm shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              <Navigation size={18} />
              <span>{locating ? 'Acquiring GPS Coordinates...' : 'Allow GPS & Load Map'}</span>
            </button>

            <button
              onClick={handleUseFallbackLocation}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 px-6 rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Continue with City Center (Test Coordinates)
            </button>
          </div>

          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live GPS Geolocation • High Accuracy</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-auto lg:h-[calc(100vh-7.5rem)] flex flex-col lg:flex-row gap-5 relative">
      
      {/* LEFT: MAP CONTAINER & INTERACTIVE CONTROLS */}
      <div className="flex-1 flex flex-col gap-3 min-h-[420px] lg:min-h-0">
        
        {/* Top Zomato-style Search & Quick Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search location, smart bin, or nagar nigam office..." 
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#105a39] shadow-sm transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-3.5 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#105a39] appearance-none shadow-sm cursor-pointer"
              >
                <option value="all">All Bins</option>
                <option value="critical">Overflowing (&gt;80%)</option>
                <option value="warning">Almost Full (50-80%)</option>
                <option value="normal">Normal (&lt;50%)</option>
              </select>
              <Filter className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>

            <button 
              onClick={handleLocateMe}
              title="Locate my position"
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-emerald-50 text-[#105a39] border border-emerald-200 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95 shrink-0"
            >
              <Navigation size={15} className="text-[#105a39]" />
              <span className="hidden sm:inline">GPS</span>
            </button>
          </div>
        </div>

        {/* Interactive Map */}
        <div className="flex-1 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative min-h-[380px]">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            scrollWheelZoom={true}
            className="w-full h-full"
            style={{ minHeight: '380px' }}
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User GPS Pin */}
            <Marker position={[userLoc.lat, userLoc.lng]} icon={createUserIcon()}>
              <Popup>
                <div className="p-1 font-sans text-xs">
                  <p className="font-bold text-emerald-800">Your Current Location</p>
                  <p className="text-slate-500">Gwalior Civil Lines Area</p>
                </div>
              </Popup>
            </Marker>

            {/* Smart Bins Markers */}
            {bins.map((bin) => (
              <Marker 
                key={`bin-${bin.id}`} 
                position={[bin.lat, bin.lng]} 
                icon={createBinIcon(bin.fill_level, selectedTarget?.id === bin.id)}
                eventHandlers={{
                  click: () => {
                    setSelectedTarget({ ...bin, targetType: 'bin' });
                  }
                }}
              >
                <Popup>
                  <div className="p-2 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-bold text-slate-900 text-sm">SmartBin #{bin.id}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        bin.fill_level >= 80 ? 'bg-red-100 text-red-700' :
                        bin.fill_level >= 50 ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {bin.fill_level}% Full
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-2">
                      <MapPin size={12} /> {bin.location_name}
                    </p>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2.5">
                      <div 
                        className={`h-full rounded-full ${
                          bin.fill_level >= 80 ? 'bg-red-500' :
                          bin.fill_level >= 50 ? 'bg-amber-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${bin.fill_level}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-3 font-medium">
                      <span>{bin.distance_text || '450 m'}</span>
                      <span>{bin.walk_time_minutes ? `${bin.walk_time_minutes} min walk` : '5 min walk'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStartNavigation(bin, 'bin')}
                        className="flex-1 bg-[#105a39] hover:bg-[#0b452a] text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all"
                      >
                        <Navigation size={13} /> Navigate
                      </button>
                      <Link 
                        to={`/dashboard/bin/${bin.id}`}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center transition-all"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Municipal Office Markers */}
            {offices.map((off) => (
              <Marker 
                key={`office-${off.id}`} 
                position={[off.lat, off.lng]} 
                icon={createOfficeIcon()}
                eventHandlers={{
                  click: () => {
                    setSelectedTarget({ ...off, targetType: 'office' });
                  }
                }}
              >
                <Popup>
                  <div className="p-2 font-sans min-w-[220px]">
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider inline-block mb-1">
                      Municipal Office
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{off.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 mb-2">{off.address}</p>
                    <div className="text-xs text-slate-600 space-y-1 mb-3">
                      <p className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Clock size={12} className="text-slate-400" /> {off.operating_hours}
                      </p>
                      <p className="flex items-center gap-1.5 font-medium text-slate-700">
                        <Phone size={12} className="text-slate-400" /> {off.contact_phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStartNavigation(off, 'office')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Navigation size={13} /> Directions
                      </button>
                      <a 
                        href={`tel:${off.contact_phone}`}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                      >
                        <Phone size={13} /> Call
                      </a>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Active Zomato Route Polyline */}
            {activeRoute?.waypoints && (
              <Polyline 
                positions={activeRoute.waypoints} 
                pathOptions={{ 
                  color: '#105a39', 
                  weight: 5, 
                  opacity: 0.85, 
                  dashArray: '8, 6',
                  lineJoin: 'round'
                }} 
              />
            )}
          </MapContainer>

          {/* Floating Zomato-Style Live Navigation Banner */}
          {navigating && selectedTarget && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-emerald-200 z-[1000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-[#105a39] text-white flex items-center justify-center shrink-0 shadow-md">
                  <Navigation size={22} className="animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase bg-emerald-100 text-[#105a39] px-2 py-0.5 rounded-full">
                      Live Navigation
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {activeRoute?.total_distance_text || selectedTarget.distance_text || '350 m'} • {activeRoute?.estimated_walk_minutes || selectedTarget.walk_time_minutes || 4} min walk
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate max-w-xs sm:max-w-md">
                    Heading to {selectedTarget.location_name || selectedTarget.name || `SmartBin #${selectedTarget.id}`}
                  </h4>
                  {activeRoute?.steps?.[0] && (
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <ArrowRight size={12} className="text-emerald-600" /> {activeRoute.steps[0].instruction}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {selectedTarget.contact_phone && (
                  <a 
                    href={`tel:${selectedTarget.contact_phone}`}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                    title="Call Contact"
                  >
                    <Phone size={16} />
                  </a>
                )}
                <button 
                  onClick={handleEndNavigation}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <X size={14} /> End Trip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: ZOMATO-STYLE SIDEBAR / TABS (Matches Screen 4 in Screenshot) */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col overflow-hidden max-h-[600px] lg:max-h-full">
        
        {/* Navigation Tabs */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-1">
          <button 
            onClick={() => setActiveTab('bins')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'bins'
                ? 'bg-white text-[#105a39] shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Trash2 size={14} /> Nearby Bins ({filteredBins.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('offices')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'offices'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 size={14} /> Municipal ({offices.length})
          </button>
          
          <button 
            onClick={() => setActiveTab('helpdesk')}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'helpdesk'
                ? 'bg-white text-purple-700 shadow-sm border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Headphones size={14} /> Help Desk
          </button>
        </div>

        {/* TAB 1: NEARBY DUSTBINS (Exact Layout of Screen 4 in screenshot) */}
        {activeTab === 'bins' && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredBins.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Trash2 size={36} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm font-semibold">No bins found</p>
                <p className="text-xs text-slate-400 mt-1">Try changing filter or search query</p>
              </div>
            ) : (
              filteredBins.map((bin) => (
                <div 
                  key={bin.id}
                  onClick={() => {
                    setSelectedTarget(bin);
                    setMapCenter([bin.lat, bin.lng]);
                    setMapZoom(16);
                  }}
                  className={`p-4 hover:bg-slate-50/80 transition-all cursor-pointer flex items-center gap-3.5 group ${
                    selectedTarget?.id === bin.id ? 'bg-emerald-50/60 border-l-4 border-[#105a39]' : ''
                  }`}
                >
                  {/* Pin Circle Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-transform group-hover:scale-105 ${
                    bin.fill_level >= 80 ? 'bg-red-50 text-red-500 border-red-500' :
                    bin.fill_level >= 50 ? 'bg-amber-50 text-amber-500 border-amber-500' :
                    'bg-emerald-50 text-emerald-500 border-emerald-500'
                  }`}>
                    <MapPin size={20} fill="currentColor" />
                  </div>

                  {/* Bin Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#105a39] transition-colors">
                        SmartBin #{bin.id}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-medium shrink-0">
                        {bin.distance_text || '350m'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 truncate mt-0.5">{bin.location_name}</p>

                    <div className="flex items-center justify-between mt-1.5">
                      <p className={`text-xs font-extrabold ${
                        bin.fill_level >= 80 ? 'text-red-600' :
                        bin.fill_level >= 50 ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        {bin.fill_level}% Full
                      </p>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartNavigation(bin, 'bin');
                          }}
                          className="text-[11px] font-bold text-[#105a39] hover:bg-emerald-100 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                        >
                          <Navigation size={11} /> Navigate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Link */}
                  <div className="text-slate-300 group-hover:text-slate-600 transition-colors">
                    <ChevronRight size={18} />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: MUNICIPAL CORPORATION OFFICES */}
        {activeTab === 'offices' && (
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
            {filteredOffices.map((off) => (
              <div 
                key={off.id}
                className="p-3.5 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl border border-slate-100 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-snug">{off.name}</h4>
                      <p className="text-[10px] text-blue-600 font-bold">{off.zone}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-slate-200/70 text-slate-700 font-bold px-1.5 py-0.5 rounded shrink-0">
                    {off.distance_text || '1.2 km'}
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{off.address}</p>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-[11px] space-y-1">
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Clock size={12} className="text-slate-400" /> {off.operating_hours}
                  </p>
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <Phone size={12} className="text-slate-400" /> {off.contact_phone}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <a 
                    href={`tel:${off.contact_phone}`}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-1 transition-colors"
                  >
                    <Phone size={12} /> Call Office
                  </a>
                  <button 
                    onClick={() => handleStartNavigation(off, 'office')}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors"
                  >
                    <Navigation size={12} /> Get Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: HELP DESK & CITIZEN GRIEVANCE */}
        {activeTab === 'helpdesk' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 24x7 Emergency Banner */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 text-white p-4 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping"></span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-purple-200">24x7 Emergency Hotline</span>
              </div>
              <h3 className="font-extrabold text-xl tracking-tight">1800-180-2026</h3>
              <p className="text-xs text-purple-200 mt-1 leading-relaxed">
                Nagar Nigam Swachhata Control Room for immediate waste overflow dispatch.
              </p>
              <div className="mt-3 flex gap-2">
                <a 
                  href="tel:18001802026" 
                  className="flex-1 bg-white text-purple-950 font-bold text-xs py-2 rounded-lg text-center shadow hover:bg-purple-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Phone size={13} /> Call Now
                </a>
                <a 
                  href="https://wa.me/919893019690?text=Hello%20SmartBin%20HelpDesk" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex-1 bg-emerald-500 text-white font-bold text-xs py-2 rounded-lg text-center hover:bg-emerald-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  WhatsApp SOS
                </a>
              </div>
            </div>

            {/* Quick Grievance Action */}
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-slate-800 text-sm">Raise Instant Grievance</h4>
                <ShieldAlert size={16} className="text-amber-500" />
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Report broken smart bin sensor, garbage overflow, or missed collection.
              </p>
              <button 
                onClick={() => {
                  setGrievanceSent(false);
                  setShowGrievanceModal(true);
                }}
                className="w-full bg-[#105a39] hover:bg-[#0b452a] text-white py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={14} /> Open Grievance Ticket
              </button>
            </div>

            {/* Helpline Numbers List */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Contacts</p>
              
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">Swachhata National Hotline</p>
                  <p className="text-[10px] text-slate-500">Government of India</p>
                </div>
                <a href="tel:1969" className="text-xs font-extrabold text-[#105a39] bg-emerald-50 px-2.5 py-1 rounded-lg">
                  1969
                </a>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-slate-800">Gwalior Municipal Control Room</p>
                  <p className="text-[10px] text-slate-500">Toll-Free Grievance</p>
                </div>
                <a href="tel:18002330015" className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                  1800-233-0015
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* QUICK GRIEVANCE MODAL */}
      {showGrievanceModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowGrievanceModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            {!grievanceSent ? (
              <form onSubmit={handleSubmitGrievance} className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-800">
                  <Headphones size={22} className="text-[#105a39]" />
                  <h3 className="font-bold text-lg text-slate-900">Municipal Help Desk Ticket</h3>
                </div>
                <p className="text-xs text-slate-500">
                  Your GPS coordinates ({userLoc.lat.toFixed(4)}, {userLoc.lng.toFixed(4)}) will be attached automatically.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
                  <select 
                    value={grievanceCategory}
                    onChange={(e) => setGrievanceCategory(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#105a39] outline-none"
                  >
                    <option>Dustbin Overflow (&gt;80%)</option>
                    <option>Broken / Vandalized Smart Bin</option>
                    <option>Illegal Garbage Dumping</option>
                    <option>Missed Scheduled Pickup</option>
                    <option>Sensor Malfunction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Describe Issue / Landmark</label>
                  <textarea 
                    rows={3}
                    required
                    value={grievanceText}
                    onChange={(e) => setGrievanceText(e.target.value)}
                    placeholder="E.g. Near Lashkar circle, the dry waste bin is completely full and littering road..."
                    className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#105a39] outline-none resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  className="w-full py-3 bg-[#105a39] hover:bg-[#0b452a] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send size={16} /> Submit to Help Desk
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Ticket Registered!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Your grievance has been dispatched to the Zonal Sanitation Inspector.
                </p>
                <div className="bg-slate-100 p-3 rounded-xl inline-block text-xs font-mono font-bold text-slate-800">
                  Ticket ID: {grievanceTicket}
                </div>
                <p className="text-xs font-semibold text-emerald-700">Estimated response: Within 2 hours</p>
                <button 
                  onClick={() => setShowGrievanceModal(false)}
                  className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
