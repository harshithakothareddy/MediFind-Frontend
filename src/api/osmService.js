/**
 * Overpass API service — fetches real pharmacies near a lat/lng from OpenStreetMap
 */

const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';
const nearbySearchCache = new Map();

/**
 * Fetch pharmacies near a given location using Overpass API
 * @param {number} lat
 * @param {number} lng
 * @param {number} radiusMeters — default 5000 (5 km)
 * @returns {Promise<Array>} list of pharmacy objects
 */
export function fetchNearbyPharmacies(lat, lng, radiusMeters = 5000) {
  const cacheKey = `${lat}:${lng}:${radiusMeters}`;
  const cached = nearbySearchCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = loadNearbyPharmacies(lat, lng, radiusMeters);
  nearbySearchCache.set(cacheKey, { expiresAt: Date.now() + 300000, promise });
  promise.catch(() => {
    if (nearbySearchCache.get(cacheKey)?.promise === promise) nearbySearchCache.delete(cacheKey);
  });
  return promise;
}

async function loadNearbyPharmacies(lat, lng, radiusMeters) {
  const query = `
    [out:json][timeout:15];
    (
      nwr["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
      nwr["healthcare"="pharmacy"](around:${radiusMeters},${lat},${lng});
      nwr["shop"="chemist"](around:${radiusMeters},${lat},${lng});
    );
    out center tags;
  `;

  const controllers = OVERPASS_URLS.map(() => new AbortController());
  const timeoutIds = controllers.map(controller => setTimeout(() => controller.abort(), 20000));
  let json;

  try {
    json = await Promise.any(OVERPASS_URLS.map(async (url, index) => {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controllers[index].signal,
      });

      if (!response.ok) throw new Error(`Overpass API error: ${response.status}`);
      return response.json();
    }));
  } finally {
    timeoutIds.forEach(clearTimeout);
    controllers.forEach(controller => controller.abort());
  }

  return json.elements
    .map((el, idx) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLng = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null || !Number.isFinite(Number(elLat)) || !Number.isFinite(Number(elLng))) return null;

      const tags = el.tags || {};
      const name = tags.name || tags['name:en'] || tags.brand || `Pharmacy ${idx + 1}`;
      const latitude = Number(elLat);
      const longitude = Number(elLng);
      const distance = haversine(lat, lng, latitude, longitude);
      const openingHours = tags.opening_hours || null;
      const isOpen24 = openingHours === '24/7';
      const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile'] || null;
      const website = tags.website || tags['contact:website'] || null;
      const brand = tags.brand || null;

      return {
        id: `osm-${el.type}-${el.id}`,
        osmId: el.id,
        osmType: el.type,
        name,
        brand,
        address: formatAddress(tags),
        phone,
        website,
        lat: latitude,
        lng: longitude,
        distance,          // in km
        distanceText: distance < 1
          ? `${Math.round(distance * 1000)} m`
          : `${distance.toFixed(1)} km`,
        openingHours,
        open24Hours: isOpen24,
        open: isOpen24 || isCurrentlyOpen(openingHours),
        verified: false,
        rating: null,
        source: 'OpenStreetMap',
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' pharmacy')}&query_place_id=${latitude},${longitude}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance);
}

/**
 * Reverse-geocode coordinates to a human-readable address
 */
export async function reverseGeocode(lat, lng) {
  const url = `${NOMINATIM_URL}/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'MediFind/1.0' },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.display_name || json.address?.road || null;
  } catch {
    return null;
  }
}

/**
 * Forward geocode a search query to lat/lng
 */
export async function geocodeAddress(query) {
  const url = `${NOMINATIM_URL}/search?format=jsonv2&q=${encodeURIComponent(query)}&limit=5`;
  try {
    const res = await fetch(url, {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'MediFind/1.0' },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.map(r => ({
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      displayName: r.display_name,
    }));
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function formatAddress(tags) {
  if (tags['addr:full']) return tags['addr:full'];

  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:place'] || tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || tags['addr:municipality'],
    tags['addr:district'] || tags['addr:state_district'],
    tags['addr:state'],
    tags['addr:postcode'],
  ].filter(Boolean);
  const uniqueParts = [...new Set(parts)];
  return uniqueParts.length > 0 ? uniqueParts.join(', ') : 'Address not listed by map source';
}

function isCurrentlyOpen(openingHoursStr) {
  if (!openingHoursStr) return null;
  if (openingHoursStr === '24/7') return true;

  try {
    const now = new Date();
    const dayAbbr = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Simple parsing for common formats like "Mo-Sa 08:00-22:00"
    const rules = openingHoursStr.split(';');
    let hasParseableTime = false;
    for (const rule of rules) {
      const trimmed = rule.trim();
      const timeMatch = trimmed.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
      if (!timeMatch) continue;
      hasParseableTime = true;

      const start = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]);
      const end = parseInt(timeMatch[3]) * 60 + parseInt(timeMatch[4]);

      const dayPart = trimmed.replace(/\d{2}:\d{2}-\d{2}:\d{2}/, '').trim();

      let dayMatch = false;
      if (!dayPart || dayPart === 'Mo-Su' || dayPart === 'Mo-Sa Su') {
        dayMatch = true;
      } else if (dayPart.includes(dayAbbr)) {
        dayMatch = true;
      } else if (dayPart.includes('-')) {
        const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
        const rangeParts = dayPart.split('-');
        const startIdx = days.indexOf(rangeParts[0]?.trim());
        const endIdx = days.indexOf(rangeParts[1]?.trim().substring(0, 2));
        if (startIdx !== -1 && endIdx !== -1) {
          const dayIdx = days.indexOf(dayAbbr);
          dayMatch = dayIdx >= startIdx && dayIdx <= endIdx;
        }
      }

      if (dayMatch && currentMinutes >= start && currentMinutes <= end) {
        return true;
      }
    }
    return hasParseableTime ? false : null;
  } catch {
    return null;
  }
}
