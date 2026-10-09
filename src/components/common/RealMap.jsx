/**
 * RealMap.jsx — Interactive Leaflet map with OpenStreetMap tiles
 * Shows pharmacies as markers; user location as a blue dot.
 *
 * Props:
 *  userCoords   { lat, lng }  — user position
 *  pharmacies   Array         — array of pharmacy objects
 *  selectedId   string|null   — currently selected pharmacy id
 *  onSelect     (pharmacy) => void
 *  height       string        — CSS height, default '100%'
 */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Phone, Clock, Star, X } from 'lucide-react';

// Fix Leaflet default marker icon (Vite / webpack issue)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icon factory
const makeIcon = (color) => L.divIcon({
  className: '',
  html: `<div style="
    width:32px;height:42px;
    display:flex;flex-direction:column;
    align-items:center;
  ">
    <div style="
      width:32px;height:32px;
      background:${color};
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
    "></div>
    <div style="
      width:6px;height:10px;
      background:${color};
      border-radius:0 0 3px 3px;
      margin-top:-1px;
    "></div>
  </div>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
});

const GREEN_ICON  = makeIcon('#059669');  // open
const AMBER_ICON  = makeIcon('#ca8a04');  // unknown
const RED_ICON    = makeIcon('#dc2626');  // closed
const BLUE_ICON   = makeIcon('#064e3b');  // user location

const RealMap = ({
  userCoords,
  pharmacies = [],
  selectedId,
  onSelect,
  onMapClick,
  height = '100%',
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);

  // ── Init map once ───────────────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return; // already initialised

    const center = userCoords
      ? [userCoords.lat, userCoords.lng]
      : [20.5937, 78.9629]; // India center fallback

    const map = L.map(mapContainerRef.current, {
      center,
      zoom: userCoords ? 14 : 5,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !onMapClick) return;

    const handleMapClick = (event) => {
      onMapClick({ lat: event.latlng.lat, lng: event.latlng.lng });
    };

    map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [onMapClick]);

  // ── User location marker ────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !userCoords) return;
    const { lat, lng } = userCoords;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const userIcon = L.divIcon({
        className: '',
        html: `<div style="
          width:20px;height:20px;
          background:#059669;
          border:3px solid white;
          border-radius:50%;
          box-shadow:0 0 0 4px rgba(5,150,105,0.3);
        "></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });
      userMarkerRef.current = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
        .addTo(mapRef.current)
        .bindPopup('<strong>📍 Your Location</strong>');
    }
    mapRef.current.setView([lat, lng], 14);
  }, [userCoords]);

  // ── Pharmacy markers ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove old markers not in current pharmacies (using string IDs to prevent type mismatch)
    const currentIds = new Set(pharmacies.map(p => String(p.id)));
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      if (!currentIds.has(String(id))) {
        marker.remove();
        delete markersRef.current[id];
      }
    });

    pharmacies.forEach((ph) => {
      const lat = Number(ph.lat ?? ph.latitude);
      const lng = Number(ph.lng ?? ph.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

      const icon = ph.open ? GREEN_ICON : ph.open === false ? RED_ICON : AMBER_ICON;
      const markerKey = String(ph.id || `${lat}_${lng}`);

      const popupHtml = `
        <div style="font-family:system-ui,-apple-system,sans-serif;min-width:200px;padding:4px 2px;">
          <div style="font-weight:700;font-size:13px;color:#111827;line-height:1.3;margin-bottom:3px;">
            🏥 ${ph.name || 'Pharmacy'}
          </div>
          <div style="font-size:11px;color:#4b5563;line-height:1.4;margin-bottom:8px;">
            ${ph.address || ''}
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e5e7eb;padding-top:6px;">
            <span style="font-size:10px;font-weight:700;padding:2px 6px;border-radius:4px;background:${ph.open ? '#dcfce7;color:#15803d' : '#f3f4f6;color:#374151'};">
              ${ph.open ? '● Open Now' : '● Verified Store'}
            </span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener noreferrer" style="font-size:11px;font-weight:700;color:#0d9488;text-decoration:none;">
              Directions ↗
            </a>
          </div>
        </div>
      `;

      if (markersRef.current[markerKey]) {
        markersRef.current[markerKey].setLatLng([lat, lng]);
        markersRef.current[markerKey].setIcon(icon);
        markersRef.current[markerKey].setPopupContent(popupHtml);
      } else {
        const marker = L.marker([lat, lng], { icon, title: ph.name })
          .addTo(mapRef.current)
          .bindPopup(popupHtml)
          .on('click', () => onSelect && onSelect(ph));

        markersRef.current[markerKey] = marker;

        // Auto-open popup if this is the only pharmacy on the map
        if (pharmacies.length === 1) {
          marker.openPopup();
        }
      }
    });
  }, [pharmacies, onSelect]);

  useEffect(() => {
    if (!mapRef.current) return;

    const points = pharmacies
      .map(ph => ({
        lat: Number(ph.lat ?? ph.latitude),
        lng: Number(ph.lng ?? ph.longitude),
      }))
      .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng))
      .map(p => [p.lat, p.lng]);

    if (userCoords && Number.isFinite(userCoords.lat) && Number.isFinite(userCoords.lng)) {
      points.push([userCoords.lat, userCoords.lng]);
    }

    if (points.length === 1) {
      mapRef.current.setView(points[0], 15);
    } else if (points.length > 1) {
      mapRef.current.fitBounds(L.latLngBounds(points).pad(0.15), { maxZoom: 15 });
    }
  }, [pharmacies, userCoords]);

  // ── Pan to selected pharmacy ────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const ph = pharmacies.find(p => String(p.id) === String(selectedId));
    const lat = Number(ph?.lat ?? ph?.latitude);
    const lng = Number(ph?.lng ?? ph?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      mapRef.current.setView([lat, lng], 16, { animate: true });
      if (markersRef.current[String(selectedId)]) {
        markersRef.current[String(selectedId)].openPopup();
      }
    }
  }, [selectedId, pharmacies]);

  return (
    <div ref={mapContainerRef} style={{ height, width: '100%', minHeight: '300px' }} />
  );
};

export default RealMap;
