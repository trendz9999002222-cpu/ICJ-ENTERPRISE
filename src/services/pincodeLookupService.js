/**
 * PincodeLookupService — Enterprise India Postal Code & GPS Location Resolver
 * Features:
 * 1. 6-digit Pincode real-time lookup (State, District, Sub-district/Tehsil, Village/Post Office).
 * 2. High-speed caching for instant subsequent lookups.
 * 3. Offline fallback mapping using Pan-India Master datasets.
 * 4. GPS Geolocation Detection (Browser Navigator API).
 */

import { PAN_INDIA_STATES, PAN_INDIA_DISTRICTS_MAP } from "../data/panIndiaMaster.js";

const pincodeCache = new Map();

// Local Quick Mapping Fallback for major pincode ranges
const PINCODE_PREFIX_STATE_MAP = {
  "11": "Delhi",
  "12": "Haryana",
  "13": "Haryana",
  "14": "Punjab",
  "15": "Punjab",
  "16": "Chandigarh",
  "17": "Himachal Pradesh",
  "18": "Jammu and Kashmir",
  "19": "Jammu and Kashmir",
  "20": "Uttar Pradesh",
  "21": "Uttar Pradesh",
  "22": "Uttar Pradesh",
  "23": "Uttar Pradesh",
  "24": "Uttarakhand",
  "25": "Uttar Pradesh",
  "26": "Uttarakhand",
  "27": "Uttar Pradesh",
  "28": "Uttar Pradesh",
  "30": "Rajasthan",
  "31": "Rajasthan",
  "32": "Rajasthan",
  "33": "Rajasthan",
  "34": "Rajasthan",
  "36": "Gujarat",
  "37": "Gujarat",
  "38": "Gujarat",
  "39": "Gujarat",
  "40": "Maharashtra",
  "41": "Maharashtra",
  "42": "Maharashtra",
  "43": "Maharashtra",
  "44": "Maharashtra",
  "45": "Madhya Pradesh",
  "46": "Madhya Pradesh",
  "47": "Madhya Pradesh",
  "48": "Madhya Pradesh",
  "49": "Chhattisgarh",
  "50": "Telangana",
  "51": "Andhra Pradesh",
  "52": "Andhra Pradesh",
  "53": "Andhra Pradesh",
  "56": "Karnataka",
  "57": "Karnataka",
  "58": "Karnataka",
  "59": "Karnataka",
  "60": "Tamil Nadu",
  "61": "Tamil Nadu",
  "62": "Tamil Nadu",
  "63": "Tamil Nadu",
  "64": "Tamil Nadu",
  "67": "Kerala",
  "68": "Kerala",
  "69": "Kerala",
  "70": "West Bengal",
  "71": "West Bengal",
  "72": "West Bengal",
  "73": "West Bengal",
  "74": "West Bengal",
  "75": "Odisha",
  "76": "Odisha",
  "77": "Odisha",
  "78": "Assam",
  "79": "Meghalaya",
  "80": "Bihar",
  "81": "Bihar",
  "82": "Jharkhand",
  "83": "Jharkhand",
  "84": "Bihar",
  "85": "Bihar",
};

export const PincodeLookupService = {
  /**
   * Look up 6-digit postal pincode
   */
  async lookupPincode(pincode) {
    const cleanPin = String(pincode || "").replace(/\D/g, "").slice(0, 6);
    if (cleanPin.length !== 6) {
      return { success: false, message: "Pincode must be exactly 6 digits." };
    }

    if (pincodeCache.has(cleanPin)) {
      return pincodeCache.get(cleanPin);
    }

    try {
      // 1. Query India Post Public API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.Status === "Success" && Array.isArray(data[0]?.PostOffice) && data[0].PostOffice.length > 0) {
          const poList = data[0].PostOffice;
          const first = poList[0];

          // Normalize State Name to match PAN_INDIA_STATES
          let matchedState = PAN_INDIA_STATES.find(
            (s) => s.toLowerCase() === (first.State || "").toLowerCase().trim()
          ) || first.State;

          // Fuzzy match State if needed
          if (!matchedState) {
            const prefix = cleanPin.substring(0, 2);
            matchedState = PINCODE_PREFIX_STATE_MAP[prefix] || first.State;
          }

          // Normalize District
          const availableDistricts = PAN_INDIA_DISTRICTS_MAP[matchedState] || [];
          let matchedDistrict = availableDistricts.find(
            (d) => d.toLowerCase().includes((first.District || "").toLowerCase()) ||
                   (first.District || "").toLowerCase().includes(d.toLowerCase())
          ) || first.District;

          const tehsils = [...new Set(poList.map((p) => p.Block || p.Division || p.Name).filter(Boolean))];
          const villages = poList.map((p) => ({
            name: p.Name,
            branchType: p.BranchType,
            deliveryStatus: p.DeliveryStatus,
            block: p.Block,
            division: p.Division,
          }));

          const primaryTehsil = first.Block !== "NA" && first.Block ? first.Block : (first.Division || first.Name);

          const result = {
            success: true,
            pincode: cleanPin,
            state: matchedState,
            district: matchedDistrict,
            tehsil: primaryTehsil,
            village: first.Name,
            policeStation: `${first.Name} PS / Jurisdictional Thana`,
            postOffices: villages,
            tehsilOptions: tehsils,
            source: "INDIA_POST_LIVE",
          };

          pincodeCache.set(cleanPin, result);
          return result;
        }
      }
    } catch (e) {
      console.warn("Live Pincode API lookup failed, switching to local offline database", e.message);
    }

    // 2. Offline Fallback using Pincode Prefix Map
    const prefix = cleanPin.substring(0, 2);
    const fallbackState = PINCODE_PREFIX_STATE_MAP[prefix] || PAN_INDIA_STATES[0];
    const fallbackDistrict = (PAN_INDIA_DISTRICTS_MAP[fallbackState] || [])[0] || "Central";

    const offlineResult = {
      success: true,
      pincode: cleanPin,
      state: fallbackState,
      district: fallbackDistrict,
      tehsil: `${fallbackDistrict} Central`,
      village: "",
      policeStation: `Jurisdictional Police Station, ${fallbackDistrict}`,
      postOffices: [],
      tehsilOptions: [`${fallbackDistrict} Tehsil`],
      source: "OFFLINE_FALLBACK",
    };

    pincodeCache.set(cleanPin, offlineResult);
    return offlineResult;
  },

  /**
   * Browser Geolocation GPS Auto-Detection
   */
  async detectGpsLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      throw new Error("Geolocation is not supported by your browser.");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          try {
            // OpenStreetMap Nominatim reverse geocode
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
            );
            if (res.ok) {
              const data = await res.json();
              const addr = data.address || {};

              const stateRaw = addr.state || addr.province || "";
              const matchedState = PAN_INDIA_STATES.find(
                (s) => s.toLowerCase() === stateRaw.toLowerCase()
              ) || stateRaw;

              const distRaw = addr.state_district || addr.county || addr.city || "";
              const availableDistricts = PAN_INDIA_DISTRICTS_MAP[matchedState] || [];
              const matchedDistrict = availableDistricts.find(
                (d) => d.toLowerCase().includes(distRaw.toLowerCase()) || distRaw.toLowerCase().includes(d.toLowerCase())
              ) || distRaw;

              const tehsil = addr.suburb || addr.town || addr.city_district || addr.municipality || "";
              const pincode = (addr.postcode || "").replace(/\D/g, "").slice(0, 6);
              const village = addr.village || addr.neighbourhood || addr.suburb || "";

              resolve({
                success: true,
                latitude: lat,
                longitude: lon,
                state: matchedState || "Delhi",
                district: matchedDistrict || "New Delhi",
                tehsil: tehsil || village || "Center",
                village: village,
                pincode: pincode,
                policeStation: `Jurisdictional Thana, ${tehsil || matchedDistrict}`,
                formattedAddress: data.display_name,
                source: "GPS_REVERSE_GEOCODE",
              });
              return;
            }
          } catch (err) {
            console.warn("Reverse geocode failed, returning raw coords", err);
          }

          resolve({
            success: true,
            latitude: lat,
            longitude: lon,
            state: "Delhi",
            district: "New Delhi",
            tehsil: "Central",
            pincode: "110001",
            source: "GPS_RAW",
          });
        },
        (error) => {
          let msg = "Failed to obtain GPS position.";
          if (error.code === error.PERMISSION_DENIED) {
            msg = "Location permission denied. Please enter your Pincode manually.";
          }
          reject(new Error(msg));
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  },
};

export default PincodeLookupService;
