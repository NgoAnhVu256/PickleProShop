"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, Search } from "lucide-react";

// Fix for default Leaflet icon in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapSelectorProps {
  onLocationSelect: (addressData: { 
    addressComponent: string;
    province: string;
    district: string;
    ward: string; 
  }) => void;
}

function LocationMarker({ position, setPosition, onSelect }: { position: L.LatLng | null, setPosition: any, onSelect: any }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      fetchAddress(e.latlng.lat, e.latlng.lng).then(data => {
        if(data) onSelect(data);
      });
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}></Marker>
  );
}

const fetchAddress = async (lat: number, lon: number) => {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
    const data = await res.json();
    if (data && data.address) {
      const addr = data.address;
      const province = addr.city || addr.province || addr.state || "";
      const district = addr.county || addr.district || addr.suburb || "";
      const ward = addr.quarter || addr.neighbourhood || addr.village || "";
      const street = addr.road ? `${addr.house_number ? addr.house_number + " " : ""}${addr.road}` : "";
      
      const parts = [street, ward, district, province].filter(Boolean);
      const full = parts.join(", ");

      return {
        addressComponent: full,
        province,
        district,
        ward
      };
    }
  } catch (error) {
    console.error("Geocoding error", error);
  }
  return null;
};

export default function MapSelector({ onLocationSelect }: MapSelectorProps) {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const mapRef = useRef(null);

  // Default to Hanoi
  const defaultCenter = [21.0285, 105.8542]; 

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const latlng = new L.LatLng(lat, lng);
          setPosition(latlng);
          const data = await fetchAddress(lat, lng);
          if (data) onLocationSelect(data);
          setLoading(false);
        },
        () => {
          setLoading(false);
          alert("Không thể lấy vị trí hiện tại của bạn.");
        }
      );
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <MapPin size={16} className="text-[#a757ff]" />
          <span>Vị trí giao hàng</span>
        </div>
        <button 
          onClick={getCurrentLocation}
          disabled={loading}
          type="button"
          className="text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-1 transition-all"
        >
          {loading ? "Đang định vị..." : "Định vị tôi"}
        </button>
      </div>
      
      <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
        <MapContainer 
          center={position || (defaultCenter as any)} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onSelect={onLocationSelect} />
        </MapContainer>
        {/* Placeholder overlay to tell user to click */}
        {!position && !loading && (
          <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center z-[400]">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-xs font-bold text-gray-700 flex items-center gap-2 pointer-events-auto">
              <Search size={14} className="text-[#a757ff]" />
              Nhấn vào bản đồ để chọn vị trí
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
