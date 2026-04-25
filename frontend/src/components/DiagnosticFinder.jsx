import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, Activity, Phone, ChevronRight, Info } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import CSS directly in JS for Vite
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom Marker Icons
const userIcon = L.divIcon({
  className: 'custom-marker-user',
  html: '<div class="user-loc-wrapper"><div class="user-loc-dot"></div><div class="user-loc-pulse"></div></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const getHealthcareIcon = (type) => {
  const color = type === 'hospital' ? '#e11d48' : '#4f46e5';
  return L.divIcon({
    className: 'custom-marker-healthcare',
    html: `<div class="pin-container"><svg width="32" height="40" viewBox="0 0 32 40" fill="none"><path d="M16 0C7.16344 0 0 7.16344 0 16C0 24.8366 16 40 16 40C16 40 32 24.8366 32 16C32 7.16344 24.8366 0 16 0Z" fill="${color}"/><circle cx="16" cy="16" r="14" fill="white" fill-opacity="0.2"/><path d="M16 10V22M10 16H22" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg></div>`,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView([center.lat, center.lng], 14, { animate: true });
    }
  }, [center, map]);
  return null;
};

const DiagnosticFinder = () => {
  const [location, setLocation] = useState(null);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [manualLocation, setManualLocation] = useState('');
  const [activeLab, setActiveLab] = useState(null);

  const findNearbyLabs = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const userLoc = { lat: latitude, lng: longitude };
        setLocation(userLoc);
        searchHealthcareCenters(latitude, longitude);
      },
      (err) => {
        setError("Unable to retrieve location. Please enter manually.");
        setLoading(false);
      },
      { timeout: 10000 }
    );
  };

  const handleManualSearch = async () => {
    if (!manualLocation) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(manualLocation)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const center = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setLocation(center);
        searchHealthcareCenters(center.lat, center.lng);
      } else {
        throw new Error("Location not found.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const searchHealthcareCenters = async (lat, lng) => {
    try {
      const query = `[out:json];(node["amenity"~"hospital|clinic|doctors"](around:5000,${lat},${lng});way["amenity"~"hospital|clinic|doctors"](around:5000,${lat},${lng});rel["amenity"~"hospital|clinic|doctors"](around:5000,${lat},${lng}););out center;`;
      const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query });
      const data = await response.json();
      const results = data.elements.map(el => ({
        id: el.id,
        name: el.tags.name || "Healthcare Centre",
        lat: el.lat || el.center.lat,
        lng: el.lon || el.center.lon,
        address: el.tags["addr:full"] || el.tags["addr:street"] || "Address not available",
        type: el.tags.amenity || "clinic",
        phone: el.tags.phone || el.tags["contact:phone"] || "N/A"
      }));
      setLabs(results);
      if (results.length === 0) setError("No centers found nearby.");
    } catch (err) {
      setError("Failed to fetch centers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full animate-in transition-colors duration-300">
      <div className="text-center mb-10">
        <h1 className="font-['Outfit'] text-4xl font-extrabold bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Diagnostic Finder</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Locate TB testing laboratories and hospitals near you.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border border-white/20 dark:border-slate-800 shadow-xl rounded-2xl p-6">
            <button onClick={findNearbyLabs} disabled={loading} className="cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/30 transition-all shadow-md px-6 py-3 w-full flex items-center justify-center gap-2 mb-6 disabled:cursor-not-allowed">
              {loading && !manualLocation ? <Activity className="animate-spin" size={20} /> : <Navigation size={20} />}
              {loading && !manualLocation ? "Detecting..." : "Auto-Detect Location"}
            </button>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Enter city..." 
                className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 transition-all text-sm" 
                value={manualLocation} 
                onChange={(e) => setManualLocation(e.target.value)} 
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch()} 
              />
              <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Search size={18} /></div>
              <button onClick={handleManualSearch} disabled={loading || !manualLocation} className="cursor-pointer absolute right-2 top-1.5 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 disabled:cursor-not-allowed"><ChevronRight size={18} /></button>
            </div>
          </div>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {labs.map((lab) => (
              <div key={lab.id} className={`bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border shadow-md rounded-2xl p-5 cursor-pointer hover:border-indigo-600/40 transition-colors ${activeLab?.id === lab.id ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/20' : 'border-white/20 dark:border-slate-800'}`} onClick={() => { setLocation({ lat: lab.lat, lng: lab.lng }); setActiveLab(lab); }}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{lab.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[9px] font-bold uppercase">{lab.type}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400"><MapPin size={12} className="inline mr-1" /> {lab.address}</p>
              </div>
            ))}
            {error && <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm border border-rose-100 dark:border-rose-800"><Info size={16} className="inline mr-2" /> {error}</div>}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner h-[500px] lg:h-[700px] lg:sticky lg:top-24">
          <MapContainer center={[20.5937, 78.9629]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OSM' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {location && <MapUpdater center={location} />}
            {location && <Marker position={[location.lat, location.lng]} icon={userIcon}><Popup>Your Location</Popup></Marker>}
            {labs.map(lab => (
              <Marker key={lab.id} position={[lab.lat, lab.lng]} icon={getHealthcareIcon(lab.type)} eventHandlers={{ click: () => setActiveLab(lab) }}>
                <Popup className="premium-popup">
                  <div className="popup-content p-4">
                    <h4 className="font-bold text-sm mb-1 dark:text-slate-900">{lab.name}</h4>
                    <p className="text-xs text-slate-500 mb-3">{lab.address}</p>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${lab.lat},${lab.lng}`} target="_blank" rel="noopener noreferrer" className="popup-btn p-2 bg-indigo-600 text-white rounded text-xs font-bold block text-center">Directions</a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticFinder;
