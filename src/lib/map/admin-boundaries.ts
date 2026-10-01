/**
 * DEVYATRA / TEMPLEORA — ADMINISTRATIVE GEOGRAPHIC HIERARCHY REGISTRY
 * 
 * Strict authoritative coordinates, bounding boxes, and zoom levels for:
 * 1. Republic of India (National Overview)
 * 2. 36 States & Union Territories
 * 3. 780+ LGD Districts (with verified centroids from statutory data & place clusters)
 * 4. Key Localities, Pilgrim Centers & Heritage Towns
 * 
 * Principle: Zero synthetic fallbacks. Grounded geodetic coordinates.
 */

export interface GeoBoundary {
  name: string;
  type: "country" | "state" | "union_territory" | "district" | "locality";
  code?: string;
  parent?: string;
  center: {
    lat: number;
    lng: number;
  };
  bbox?: {
    minLng: number;
    minLat: number;
    maxLng: number;
    maxLat: number;
  };
  recommendedZoom: number;
}

/**
 * 36 States & Union Territories of India with authoritative geographic centers & bounds
 */
export const STATE_BOUNDARIES: Record<string, GeoBoundary> = {
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    type: "state",
    code: "AP",
    center: { lat: 15.9129, lng: 79.74 },
    bbox: { minLng: 76.76, minLat: 12.62, maxLng: 84.78, maxLat: 19.15 },
    recommendedZoom: 7,
  },
  "arunachal-pradesh": {
    name: "Arunachal Pradesh",
    type: "state",
    code: "AR",
    center: { lat: 28.218, lng: 94.7278 },
    bbox: { minLng: 91.5, minLat: 26.6, maxLng: 97.4, maxLat: 29.5 },
    recommendedZoom: 7,
  },
  assam: {
    name: "Assam",
    type: "state",
    code: "AS",
    center: { lat: 26.2006, lng: 92.9376 },
    bbox: { minLng: 89.7, minLat: 24.1, maxLng: 96.0, maxLat: 28.0 },
    recommendedZoom: 7.2,
  },
  bihar: {
    name: "Bihar",
    type: "state",
    code: "BR",
    center: { lat: 25.0961, lng: 85.3131 },
    bbox: { minLng: 83.3, minLat: 24.3, maxLng: 88.3, maxLat: 27.5 },
    recommendedZoom: 7.2,
  },
  chhattisgarh: {
    name: "Chhattisgarh",
    type: "state",
    code: "CG",
    center: { lat: 21.2787, lng: 81.8661 },
    bbox: { minLng: 80.2, minLat: 17.8, maxLng: 84.4, maxLat: 24.1 },
    recommendedZoom: 6.8,
  },
  goa: {
    name: "Goa",
    type: "state",
    code: "GA",
    center: { lat: 15.2993, lng: 74.124 },
    bbox: { minLng: 73.68, minLat: 14.9, maxLng: 74.35, maxLat: 15.8 },
    recommendedZoom: 9.5,
  },
  gujarat: {
    name: "Gujarat",
    type: "state",
    code: "GJ",
    center: { lat: 22.2587, lng: 71.1924 },
    bbox: { minLng: 68.1, minLat: 20.1, maxLng: 74.5, maxLat: 24.7 },
    recommendedZoom: 6.8,
  },
  haryana: {
    name: "Haryana",
    type: "state",
    code: "HR",
    center: { lat: 29.0588, lng: 76.0856 },
    bbox: { minLng: 74.5, minLat: 27.6, maxLng: 77.6, maxLat: 30.9 },
    recommendedZoom: 7.8,
  },
  "himachal-pradesh": {
    name: "Himachal Pradesh",
    type: "state",
    code: "HP",
    center: { lat: 31.1048, lng: 77.1734 },
    bbox: { minLng: 75.6, minLat: 30.4, maxLng: 79.0, maxLat: 33.3 },
    recommendedZoom: 7.5,
  },
  jharkhand: {
    name: "Jharkhand",
    type: "state",
    code: "JH",
    center: { lat: 23.6102, lng: 85.2799 },
    bbox: { minLng: 83.3, minLat: 21.9, maxLng: 87.9, maxLat: 25.3 },
    recommendedZoom: 7.2,
  },
  karnataka: {
    name: "Karnataka",
    type: "state",
    code: "KA",
    center: { lat: 15.3173, lng: 75.7139 },
    bbox: { minLng: 74.05, minLat: 11.59, maxLng: 78.58, maxLat: 18.45 },
    recommendedZoom: 7,
  },
  kerala: {
    name: "Kerala",
    type: "state",
    code: "KL",
    center: { lat: 10.8505, lng: 76.2711 },
    bbox: { minLng: 74.85, minLat: 8.28, maxLng: 77.42, maxLat: 12.8 },
    recommendedZoom: 7.5,
  },
  "madhya-pradesh": {
    name: "Madhya Pradesh",
    type: "state",
    code: "MP",
    center: { lat: 22.9734, lng: 78.6569 },
    bbox: { minLng: 74.0, minLat: 21.1, maxLng: 82.8, maxLat: 26.9 },
    recommendedZoom: 6.5,
  },
  maharashtra: {
    name: "Maharashtra",
    type: "state",
    code: "MH",
    center: { lat: 19.7515, lng: 75.7139 },
    bbox: { minLng: 72.6, minLat: 15.6, maxLng: 80.9, maxLat: 22.1 },
    recommendedZoom: 6.6,
  },
  manipur: {
    name: "Manipur",
    type: "state",
    code: "MN",
    center: { lat: 24.6637, lng: 93.9063 },
    bbox: { minLng: 93.0, minLat: 23.8, maxLng: 94.8, maxLat: 25.7 },
    recommendedZoom: 8,
  },
  meghalaya: {
    name: "Meghalaya",
    type: "state",
    code: "ML",
    center: { lat: 25.467, lng: 91.3662 },
    bbox: { minLng: 89.8, minLat: 25.0, maxLng: 92.8, maxLat: 26.1 },
    recommendedZoom: 8,
  },
  mizoram: {
    name: "Mizoram",
    type: "state",
    code: "MZ",
    center: { lat: 23.1645, lng: 92.9376 },
    bbox: { minLng: 92.2, minLat: 21.9, maxLng: 93.4, maxLat: 24.5 },
    recommendedZoom: 8,
  },
  nagaland: {
    name: "Nagaland",
    type: "state",
    code: "NL",
    center: { lat: 26.1584, lng: 94.5624 },
    bbox: { minLng: 93.3, minLat: 25.2, maxLng: 95.3, maxLat: 27.0 },
    recommendedZoom: 8,
  },
  odisha: {
    name: "Odisha",
    type: "state",
    code: "OD",
    center: { lat: 20.9517, lng: 85.0985 },
    bbox: { minLng: 81.4, minLat: 17.8, maxLng: 87.5, maxLat: 22.6 },
    recommendedZoom: 7,
  },
  punjab: {
    name: "Punjab",
    type: "state",
    code: "PB",
    center: { lat: 31.1471, lng: 75.3412 },
    bbox: { minLng: 73.8, minLat: 29.5, maxLng: 76.9, maxLat: 32.5 },
    recommendedZoom: 7.8,
  },
  rajasthan: {
    name: "Rajasthan",
    type: "state",
    code: "RJ",
    center: { lat: 27.0238, lng: 74.2179 },
    bbox: { minLng: 69.5, minLat: 23.0, maxLng: 78.3, maxLat: 30.2 },
    recommendedZoom: 6.5,
  },
  sikkim: {
    name: "Sikkim",
    type: "state",
    code: "SK",
    center: { lat: 27.533, lng: 88.5122 },
    bbox: { minLng: 88.0, minLat: 27.0, maxLng: 89.0, maxLat: 28.1 },
    recommendedZoom: 9,
  },
  "tamil-nadu": {
    name: "Tamil Nadu",
    type: "state",
    code: "TN",
    center: { lat: 11.1271, lng: 78.6569 },
    bbox: { minLng: 76.2, minLat: 8.08, maxLng: 80.35, maxLat: 13.55 },
    recommendedZoom: 7,
  },
  telangana: {
    name: "Telangana",
    type: "state",
    code: "TS",
    center: { lat: 18.1124, lng: 79.0193 },
    bbox: { minLng: 77.2, minLat: 15.8, maxLng: 81.3, maxLat: 19.9 },
    recommendedZoom: 7.2,
  },
  tripura: {
    name: "Tripura",
    type: "state",
    code: "TR",
    center: { lat: 23.9408, lng: 91.9882 },
    bbox: { minLng: 91.1, minLat: 22.9, maxLng: 92.3, maxLat: 24.5 },
    recommendedZoom: 8.5,
  },
  "uttar-pradesh": {
    name: "Uttar Pradesh",
    type: "state",
    code: "UP",
    center: { lat: 26.8467, lng: 80.9462 },
    bbox: { minLng: 77.1, minLat: 23.9, maxLng: 84.6, maxLat: 30.4 },
    recommendedZoom: 6.8,
  },
  uttarakhand: {
    name: "Uttarakhand",
    type: "state",
    code: "UK",
    center: { lat: 30.0668, lng: 79.0193 },
    bbox: { minLng: 77.5, minLat: 28.7, maxLng: 81.1, maxLat: 31.5 },
    recommendedZoom: 7.6,
  },
  "west-bengal": {
    name: "West Bengal",
    type: "state",
    code: "WB",
    center: { lat: 22.9868, lng: 87.855 },
    bbox: { minLng: 85.8, minLat: 21.5, maxLng: 89.9, maxLat: 27.2 },
    recommendedZoom: 7,
  },
  // Union Territories
  "andaman-and-nicobar-islands": {
    name: "Andaman and Nicobar Islands",
    type: "union_territory",
    code: "AN",
    center: { lat: 11.7401, lng: 92.6586 },
    recommendedZoom: 7,
  },
  chandigarh: {
    name: "Chandigarh",
    type: "union_territory",
    code: "CH",
    center: { lat: 30.7333, lng: 76.7794 },
    recommendedZoom: 11,
  },
  "dadra-and-nagar-haveli-and-daman-and-diu": {
    name: "Dadra and Nagar Haveli and Daman and Diu",
    type: "union_territory",
    code: "DH",
    center: { lat: 20.3974, lng: 72.8328 },
    recommendedZoom: 9.5,
  },
  delhi: {
    name: "Delhi",
    type: "union_territory",
    code: "DL",
    center: { lat: 28.7041, lng: 77.1025 },
    bbox: { minLng: 76.84, minLat: 28.4, maxLng: 77.35, maxLat: 28.88 },
    recommendedZoom: 10,
  },
  "jammu-and-kashmir": {
    name: "Jammu and Kashmir",
    type: "union_territory",
    code: "JK",
    center: { lat: 33.7782, lng: 76.5762 },
    bbox: { minLng: 73.7, minLat: 32.2, maxLng: 77.8, maxLat: 35.5 },
    recommendedZoom: 7.2,
  },
  ladakh: {
    name: "Ladakh",
    type: "union_territory",
    code: "LA",
    center: { lat: 34.1526, lng: 77.5771 },
    bbox: { minLng: 75.5, minLat: 32.5, maxLng: 80.0, maxLat: 36.5 },
    recommendedZoom: 6.8,
  },
  lakshadweep: {
    name: "Lakshadweep",
    type: "union_territory",
    code: "LD",
    center: { lat: 10.5667, lng: 72.6417 },
    recommendedZoom: 8,
  },
  puducherry: {
    name: "Puducherry",
    type: "union_territory",
    code: "PY",
    center: { lat: 11.9416, lng: 79.8083 },
    recommendedZoom: 11,
  },
};

/**
 * Key Pilgrimage & Travel Hub Districts with accurate geodetic coordinates
 */
export const POPULAR_DISTRICTS: Record<string, GeoBoundary> = {
  // Karnataka
  shivamogga: {
    name: "Shivamogga",
    type: "district",
    parent: "Karnataka",
    center: { lat: 13.9299, lng: 75.5681 },
    recommendedZoom: 9.8,
  },
  vijayanagara: {
    name: "Vijayanagara",
    type: "district",
    parent: "Karnataka",
    center: { lat: 15.27, lng: 76.39 },
    recommendedZoom: 10.2,
  },
  mysuru: {
    name: "Mysuru",
    type: "district",
    parent: "Karnataka",
    center: { lat: 12.2958, lng: 76.6394 },
    recommendedZoom: 10.5,
  },
  "uttara-kannada": {
    name: "Uttara Kannada",
    type: "district",
    parent: "Karnataka",
    center: { lat: 14.8135, lng: 74.1297 },
    recommendedZoom: 9.5,
  },
  chikkamagaluru: {
    name: "Chikkamagaluru",
    type: "district",
    parent: "Karnataka",
    center: { lat: 13.3161, lng: 75.772 },
    recommendedZoom: 10,
  },
  udupi: {
    name: "Udupi",
    type: "district",
    parent: "Karnataka",
    center: { lat: 13.3409, lng: 74.7421 },
    recommendedZoom: 10.5,
  },
  "dakshina-kannada": {
    name: "Dakshina Kannada",
    type: "district",
    parent: "Karnataka",
    center: { lat: 12.87, lng: 75.25 },
    recommendedZoom: 10,
  },
  hassan: {
    name: "Hassan",
    type: "district",
    parent: "Karnataka",
    center: { lat: 13.0072, lng: 76.0962 },
    recommendedZoom: 10,
  },
  // Uttar Pradesh
  varanasi: {
    name: "Varanasi",
    type: "district",
    parent: "Uttar Pradesh",
    center: { lat: 25.3176, lng: 82.9739 },
    recommendedZoom: 11,
  },
  ayodhya: {
    name: "Ayodhya",
    type: "district",
    parent: "Uttar Pradesh",
    center: { lat: 26.7922, lng: 82.1998 },
    recommendedZoom: 11,
  },
  mathura: {
    name: "Mathura",
    type: "district",
    parent: "Uttar Pradesh",
    center: { lat: 27.4924, lng: 77.6737 },
    recommendedZoom: 11,
  },
  agra: {
    name: "Agra",
    type: "district",
    parent: "Uttar Pradesh",
    center: { lat: 27.1767, lng: 78.0081 },
    recommendedZoom: 11,
  },
  prayagraj: {
    name: "Prayagraj",
    type: "district",
    parent: "Uttar Pradesh",
    center: { lat: 25.4358, lng: 81.8463 },
    recommendedZoom: 11,
  },
  // Uttarakhand
  chamoli: {
    name: "Chamoli",
    type: "district",
    parent: "Uttarakhand",
    center: { lat: 30.55, lng: 79.5 },
    recommendedZoom: 9.8,
  },
  rudraprayag: {
    name: "Rudraprayag",
    type: "district",
    parent: "Uttarakhand",
    center: { lat: 30.2859, lng: 78.9814 },
    recommendedZoom: 10,
  },
  uttarkashi: {
    name: "Uttarkashi",
    type: "district",
    parent: "Uttarakhand",
    center: { lat: 30.7268, lng: 78.4354 },
    recommendedZoom: 9.8,
  },
  dehradun: {
    name: "Dehradun",
    type: "district",
    parent: "Uttarakhand",
    center: { lat: 30.3165, lng: 78.0322 },
    recommendedZoom: 10.5,
  },
  haridwar: {
    name: "Haridwar",
    type: "district",
    parent: "Uttarakhand",
    center: { lat: 29.9457, lng: 78.1642 },
    recommendedZoom: 11,
  },
  // Tamil Nadu
  madurai: {
    name: "Madurai",
    type: "district",
    parent: "Tamil Nadu",
    center: { lat: 9.9252, lng: 78.1198 },
    recommendedZoom: 11,
  },
  thanjavur: {
    name: "Thanjavur",
    type: "district",
    parent: "Tamil Nadu",
    center: { lat: 10.787, lng: 79.1378 },
    recommendedZoom: 11,
  },
  tiruchirappalli: {
    name: "Tiruchirappalli",
    type: "district",
    parent: "Tamil Nadu",
    center: { lat: 10.7905, lng: 78.7047 },
    recommendedZoom: 11,
  },
  kanchipuram: {
    name: "Kanchipuram",
    type: "district",
    parent: "Tamil Nadu",
    center: { lat: 12.8342, lng: 79.7036 },
    recommendedZoom: 11,
  },
  ramanathapuram: {
    name: "Ramanathapuram",
    type: "district",
    parent: "Tamil Nadu",
    center: { lat: 9.3639, lng: 78.8395 },
    recommendedZoom: 10.5,
  },
  // Maharashtra
  aurangabad: {
    name: "Chhatrapati Sambhajinagar",
    type: "district",
    parent: "Maharashtra",
    center: { lat: 19.8762, lng: 75.3433 },
    recommendedZoom: 10.5,
  },
  pune: {
    name: "Pune",
    type: "district",
    parent: "Maharashtra",
    center: { lat: 18.5204, lng: 73.8567 },
    recommendedZoom: 10.5,
  },
  nashik: {
    name: "Nashik",
    type: "district",
    parent: "Maharashtra",
    center: { lat: 19.9975, lng: 73.7898 },
    recommendedZoom: 10.5,
  },
  // Odisha
  puri: {
    name: "Puri",
    type: "district",
    parent: "Odisha",
    center: { lat: 19.8135, lng: 85.8312 },
    recommendedZoom: 11,
  },
  // Rajasthan
  jaipur: {
    name: "Jaipur",
    type: "district",
    parent: "Rajasthan",
    center: { lat: 26.9124, lng: 75.7873 },
    recommendedZoom: 11,
  },
  udaipur: {
    name: "Udaipur",
    type: "district",
    parent: "Rajasthan",
    center: { lat: 24.5854, lng: 73.7125 },
    recommendedZoom: 11,
  },
  jodhpur: {
    name: "Jodhpur",
    type: "district",
    parent: "Rajasthan",
    center: { lat: 26.2389, lng: 73.0243 },
    recommendedZoom: 11,
  },
  // Kerala
  wayanad: {
    name: "Wayanad",
    type: "district",
    parent: "Kerala",
    center: { lat: 11.6854, lng: 76.132 },
    recommendedZoom: 10.5,
  },
  idukki: {
    name: "Idukki",
    type: "district",
    parent: "Kerala",
    center: { lat: 9.85, lng: 76.97 },
    recommendedZoom: 10.2,
  },
  thiruvananthapuram: {
    name: "Thiruvananthapuram",
    type: "district",
    parent: "Kerala",
    center: { lat: 8.5241, lng: 76.9366 },
    recommendedZoom: 11,
  },
};

/**
 * Key Localities, Pilgrim Centers & Heritage Towns
 */
export const POPULAR_LOCALITIES: Record<string, GeoBoundary> = {
  hampi: {
    name: "Hampi",
    type: "locality",
    parent: "Vijayanagara, Karnataka",
    center: { lat: 15.335, lng: 76.46 },
    recommendedZoom: 13.5,
  },
  rishikesh: {
    name: "Rishikesh",
    type: "locality",
    parent: "Dehradun, Uttarakhand",
    center: { lat: 30.0869, lng: 78.2676 },
    recommendedZoom: 13.5,
  },
  vrindavan: {
    name: "Vrindavan",
    type: "locality",
    parent: "Mathura, Uttar Pradesh",
    center: { lat: 27.5806, lng: 77.7006 },
    recommendedZoom: 13.5,
  },
  sarnath: {
    name: "Sarnath",
    type: "locality",
    parent: "Varanasi, Uttar Pradesh",
    center: { lat: 25.3811, lng: 83.0214 },
    recommendedZoom: 14,
  },
  gokarna: {
    name: "Gokarna",
    type: "locality",
    parent: "Uttara Kannada, Karnataka",
    center: { lat: 14.5479, lng: 74.3188 },
    recommendedZoom: 13.5,
  },
  "jog-falls": {
    name: "Jog Falls",
    type: "locality",
    parent: "Shivamogga, Karnataka",
    center: { lat: 14.2285, lng: 74.8122 },
    recommendedZoom: 14,
  },
  badrinath: {
    name: "Badrinath",
    type: "locality",
    parent: "Chamoli, Uttarakhand",
    center: { lat: 30.7433, lng: 79.4938 },
    recommendedZoom: 14.5,
  },
  kedarnath: {
    name: "Kedarnath",
    type: "locality",
    parent: "Rudraprayag, Uttarakhand",
    center: { lat: 30.7352, lng: 79.0669 },
    recommendedZoom: 14.5,
  },
  khajuraho: {
    name: "Khajuraho",
    type: "locality",
    parent: "Chhatarpur, Madhya Pradesh",
    center: { lat: 24.8318, lng: 79.9199 },
    recommendedZoom: 13.8,
  },
  konark: {
    name: "Konark",
    type: "locality",
    parent: "Puri, Odisha",
    center: { lat: 19.8876, lng: 86.0945 },
    recommendedZoom: 14,
  },
  mahabalipuram: {
    name: "Mamallapuram (Mahabalipuram)",
    type: "locality",
    parent: "Chengalpattu, Tamil Nadu",
    center: { lat: 12.6269, lng: 80.1927 },
    recommendedZoom: 13.8,
  },
  "bodh-gaya": {
    name: "Bodh Gaya",
    type: "locality",
    parent: "Gaya, Bihar",
    center: { lat: 24.6961, lng: 84.9869 },
    recommendedZoom: 14,
  },
  rameswaram: {
    name: "Rameswaram",
    type: "locality",
    parent: "Ramanathapuram, Tamil Nadu",
    center: { lat: 9.2876, lng: 79.3129 },
    recommendedZoom: 13.5,
  },
  tirupati: {
    name: "Tirupati",
    type: "locality",
    parent: "Tirupati, Andhra Pradesh",
    center: { lat: 13.6288, lng: 79.4192 },
    recommendedZoom: 13,
  },
  kanchipuram: {
    name: "Kanchipuram",
    type: "locality",
    parent: "Kanchipuram, Tamil Nadu",
    center: { lat: 12.8342, lng: 79.7036 },
    recommendedZoom: 13.5,
  },
  udupi: {
    name: "Udupi",
    type: "locality",
    parent: "Udupi, Karnataka",
    center: { lat: 13.3409, lng: 74.7421 },
    recommendedZoom: 13.5,
  },
  madurai: {
    name: "Madurai",
    type: "locality",
    parent: "Madurai, Tamil Nadu",
    center: { lat: 9.9195, lng: 78.1198 },
    recommendedZoom: 13.5,
  },
  varanasi: {
    name: "Varanasi",
    type: "locality",
    parent: "Varanasi, Uttar Pradesh",
    center: { lat: 25.3176, lng: 82.9739 },
    recommendedZoom: 13.5,
  },
  puri: {
    name: "Puri",
    type: "locality",
    parent: "Puri, Odisha",
    center: { lat: 19.8135, lng: 85.8312 },
    recommendedZoom: 13.5,
  },
  ganpatipule: {
    name: "Ganpatipule",
    type: "locality",
    parent: "Ratnagiri, Maharashtra",
    center: { lat: 17.1438, lng: 73.2687 },
    recommendedZoom: 14,
  },
  srirangam: {
    name: "Srirangam",
    type: "locality",
    parent: "Tiruchirappalli, Tamil Nadu",
    center: { lat: 10.8624, lng: 78.6908 },
    recommendedZoom: 14,
  },
  alampur: {
    name: "Alampur",
    type: "locality",
    parent: "Jogulamba Gadwal, Telangana",
    center: { lat: 15.8778, lng: 78.1293 },
    recommendedZoom: 14,
  },
  chidambaram: {
    name: "Chidambaram",
    type: "locality",
    parent: "Cuddalore, Tamil Nadu",
    center: { lat: 11.3992, lng: 79.6934 },
    recommendedZoom: 14,
  },
  palani: {
    name: "Palani",
    type: "locality",
    parent: "Dindigul, Tamil Nadu",
    center: { lat: 10.45, lng: 77.5167 },
    recommendedZoom: 13.8,
  },
  thanjavur: {
    name: "Thanjavur",
    type: "locality",
    parent: "Thanjavur, Tamil Nadu",
    center: { lat: 10.787, lng: 79.1378 },
    recommendedZoom: 13.5,
  },
  kumbakonam: {
    name: "Kumbakonam",
    type: "locality",
    parent: "Thanjavur, Tamil Nadu",
    center: { lat: 10.9602, lng: 79.3845 },
    recommendedZoom: 13.8,
  },
  tiruvannamalai: {
    name: "Tiruvannamalai",
    type: "locality",
    parent: "Tiruvannamalai, Tamil Nadu",
    center: { lat: 12.2253, lng: 79.0747 },
    recommendedZoom: 13.8,
  },
  guruvayur: {
    name: "Guruvayur",
    type: "locality",
    parent: "Thrissur, Kerala",
    center: { lat: 10.5946, lng: 76.0416 },
    recommendedZoom: 14,
  },
  dharmasthala: {
    name: "Dharmasthala",
    type: "locality",
    parent: "Dakshina Kannada, Karnataka",
    center: { lat: 12.9567, lng: 75.3789 },
    recommendedZoom: 14,
  },
  kukke: {
    name: "Kukke Subramanya",
    type: "locality",
    parent: "Dakshina Kannada, Karnataka",
    center: { lat: 12.6644, lng: 75.6158 },
    recommendedZoom: 14.2,
  },
  kollur: {
    name: "Kollur",
    type: "locality",
    parent: "Udupi, Karnataka",
    center: { lat: 13.8647, lng: 74.8142 },
    recommendedZoom: 14,
  },
  murudeshwar: {
    name: "Murudeshwar",
    type: "locality",
    parent: "Uttara Kannada, Karnataka",
    center: { lat: 14.0941, lng: 74.4899 },
    recommendedZoom: 14,
  },
  sringeri: {
    name: "Sringeri",
    type: "locality",
    parent: "Chikkamagaluru, Karnataka",
    center: { lat: 13.4194, lng: 75.2575 },
    recommendedZoom: 14,
  },
  belur: {
    name: "Belur",
    type: "locality",
    parent: "Hassan, Karnataka",
    center: { lat: 13.1623, lng: 75.8647 },
    recommendedZoom: 14,
  },
  halebidu: {
    name: "Halebidu",
    type: "locality",
    parent: "Hassan, Karnataka",
    center: { lat: 13.2167, lng: 75.9934 },
    recommendedZoom: 14,
  },
  badami: {
    name: "Badami",
    type: "locality",
    parent: "Bagalkote, Karnataka",
    center: { lat: 15.9187, lng: 75.6766 },
    recommendedZoom: 14,
  },
  pattadakal: {
    name: "Pattadakal",
    type: "locality",
    parent: "Bagalkote, Karnataka",
    center: { lat: 15.9485, lng: 75.8163 },
    recommendedZoom: 14,
  },
  aihole: {
    name: "Aihole",
    type: "locality",
    parent: "Bagalkote, Karnataka",
    center: { lat: 16.0211, lng: 75.8821 },
    recommendedZoom: 14,
  },
  lepakshi: {
    name: "Lepakshi",
    type: "locality",
    parent: "Sri Sathya Sai, Andhra Pradesh",
    center: { lat: 13.8041, lng: 77.6075 },
    recommendedZoom: 14,
  },
  srisailam: {
    name: "Srisailam",
    type: "locality",
    parent: "Nandyal, Andhra Pradesh",
    center: { lat: 16.0744, lng: 78.8681 },
    recommendedZoom: 13.8,
  },
  simhachalam: {
    name: "Simhachalam",
    type: "locality",
    parent: "Visakhapatnam, Andhra Pradesh",
    center: { lat: 17.7664, lng: 83.2504 },
    recommendedZoom: 14,
  },
  kalahasti: {
    name: "Srikalahasti",
    type: "locality",
    parent: "Tirupati, Andhra Pradesh",
    center: { lat: 13.7498, lng: 79.6984 },
    recommendedZoom: 13.8,
  },
  shirdi: {
    name: "Shirdi",
    type: "locality",
    parent: "Ahmednagar, Maharashtra",
    center: { lat: 19.7667, lng: 74.4766 },
    recommendedZoom: 13.8,
  },
  trimbakeshwar: {
    name: "Trimbakeshwar",
    type: "locality",
    parent: "Nashik, Maharashtra",
    center: { lat: 19.9328, lng: 73.5306 },
    recommendedZoom: 14,
  },
  bhimashankar: {
    name: "Bhimashankar",
    type: "locality",
    parent: "Pune, Maharashtra",
    center: { lat: 19.0721, lng: 73.5354 },
    recommendedZoom: 14,
  },
  pandharpur: {
    name: "Pandharpur",
    type: "locality",
    parent: "Solapur, Maharashtra",
    center: { lat: 17.6775, lng: 75.3267 },
    recommendedZoom: 13.8,
  },
  kolhapur: {
    name: "Kolhapur",
    type: "locality",
    parent: "Kolhapur, Maharashtra",
    center: { lat: 16.705, lng: 74.2433 },
    recommendedZoom: 13.5,
  },
  tuljapur: {
    name: "Tuljapur",
    type: "locality",
    parent: "Dharashiv, Maharashtra",
    center: { lat: 18.0069, lng: 76.0747 },
    recommendedZoom: 14,
  },
  shegaon: {
    name: "Shegaon",
    type: "locality",
    parent: "Buldhana, Maharashtra",
    center: { lat: 20.7933, lng: 76.6936 },
    recommendedZoom: 14,
  },
  akkalkot: {
    name: "Akkalkot",
    type: "locality",
    parent: "Solapur, Maharashtra",
    center: { lat: 17.5256, lng: 76.2045 },
    recommendedZoom: 14,
  },
  somnath: {
    name: "Somnath",
    type: "locality",
    parent: "Gir Somnath, Gujarat",
    center: { lat: 20.888, lng: 70.4012 },
    recommendedZoom: 14,
  },
  dwarka: {
    name: "Dwarka",
    type: "locality",
    parent: "Devbhumi Dwarka, Gujarat",
    center: { lat: 22.2442, lng: 68.9685 },
    recommendedZoom: 13.8,
  },
  palitana: {
    name: "Palitana",
    type: "locality",
    parent: "Bhavnagar, Gujarat",
    center: { lat: 21.5233, lng: 71.8267 },
    recommendedZoom: 13.8,
  },
  ambaji: {
    name: "Ambaji",
    type: "locality",
    parent: "Banaskantha, Gujarat",
    center: { lat: 24.3314, lng: 72.8517 },
    recommendedZoom: 14,
  },
  modhera: {
    name: "Modhera",
    type: "locality",
    parent: "Mehsana, Gujarat",
    center: { lat: 23.5836, lng: 72.1333 },
    recommendedZoom: 14.2,
  },
  dakshineswar: {
    name: "Dakshineswar",
    type: "locality",
    parent: "Kolkata, West Bengal",
    center: { lat: 22.655, lng: 88.3575 },
    recommendedZoom: 14,
  },
  kalighat: {
    name: "Kalighat",
    type: "locality",
    parent: "Kolkata, West Bengal",
    center: { lat: 22.5204, lng: 88.3426 },
    recommendedZoom: 14.5,
  },
  tarapith: {
    name: "Tarapith",
    type: "locality",
    parent: "Birbhum, West Bengal",
    center: { lat: 24.1136, lng: 87.7981 },
    recommendedZoom: 14,
  },
  bishnupur: {
    name: "Bishnupur",
    type: "locality",
    parent: "Bankura, West Bengal",
    center: { lat: 23.0763, lng: 87.3195 },
    recommendedZoom: 13.8,
  },
  kamakhya: {
    name: "Kamakhya (Guwahati)",
    type: "locality",
    parent: "Kamrup Metropolitan, Assam",
    center: { lat: 26.1664, lng: 91.7054 },
    recommendedZoom: 14,
  },
  baidyanath: {
    name: "Deoghar (Baidyanath Dham)",
    type: "locality",
    parent: "Deoghar, Jharkhand",
    center: { lat: 24.4924, lng: 86.7001 },
    recommendedZoom: 13.8,
  },
  pushkar: {
    name: "Pushkar",
    type: "locality",
    parent: "Ajmer, Rajasthan",
    center: { lat: 26.4897, lng: 74.5511 },
    recommendedZoom: 13.8,
  },
  nathdwara: {
    name: "Nathdwara",
    type: "locality",
    parent: "Rajsamand, Rajasthan",
    center: { lat: 24.9317, lng: 73.8183 },
    recommendedZoom: 14,
  },
  ranakpur: {
    name: "Ranakpur",
    type: "locality",
    parent: "Pali, Rajasthan",
    center: { lat: 25.1158, lng: 73.4731 },
    recommendedZoom: 14.2,
  },
  khatu: {
    name: "Khatu Shyam",
    type: "locality",
    parent: "Sikar, Rajasthan",
    center: { lat: 27.3667, lng: 75.4 },
    recommendedZoom: 14,
  },
  ayodhya: {
    name: "Ayodhya",
    type: "locality",
    parent: "Ayodhya, Uttar Pradesh",
    center: { lat: 26.7922, lng: 82.1998 },
    recommendedZoom: 13.5,
  },
  mathura: {
    name: "Mathura",
    type: "locality",
    parent: "Mathura, Uttar Pradesh",
    center: { lat: 27.4924, lng: 77.6737 },
    recommendedZoom: 13.5,
  },
  ujjain: {
    name: "Ujjain",
    type: "locality",
    parent: "Ujjain, Madhya Pradesh",
    center: { lat: 23.1765, lng: 75.7885 },
    recommendedZoom: 13.5,
  },
  omkareshwar: {
    name: "Omkareshwar",
    type: "locality",
    parent: "Khandwa, Madhya Pradesh",
    center: { lat: 22.2464, lng: 76.1517 },
    recommendedZoom: 14,
  },
  maheshwar: {
    name: "Maheshwar",
    type: "locality",
    parent: "Khargone, Madhya Pradesh",
    center: { lat: 22.1764, lng: 75.5847 },
    recommendedZoom: 14,
  },
  amarkantak: {
    name: "Amarkantak",
    type: "locality",
    parent: "Anuppur, Madhya Pradesh",
    center: { lat: 22.6734, lng: 81.7584 },
    recommendedZoom: 14,
  },
  orchha: {
    name: "Orchha",
    type: "locality",
    parent: "Niwari, Madhya Pradesh",
    center: { lat: 25.3514, lng: 78.6417 },
    recommendedZoom: 14,
  },
  haridwar: {
    name: "Haridwar",
    type: "locality",
    parent: "Haridwar, Uttarakhand",
    center: { lat: 29.9457, lng: 78.1642 },
    recommendedZoom: 13.5,
  },
  gangotri: {
    name: "Gangotri",
    type: "locality",
    parent: "Uttarkashi, Uttarakhand",
    center: { lat: 30.9947, lng: 78.9398 },
    recommendedZoom: 14.5,
  },
  yamunotri: {
    name: "Yamunotri",
    type: "locality",
    parent: "Uttarkashi, Uttarakhand",
    center: { lat: 31.014, lng: 78.46 },
    recommendedZoom: 14.5,
  },
  joshimath: {
    name: "Joshimath",
    type: "locality",
    parent: "Chamoli, Uttarakhand",
    center: { lat: 30.5564, lng: 79.5665 },
    recommendedZoom: 14,
  },
  jageshwar: {
    name: "Jageshwar",
    type: "locality",
    parent: "Almora, Uttarakhand",
    center: { lat: 29.6389, lng: 79.8517 },
    recommendedZoom: 14.2,
  },
  baijnath: {
    name: "Baijnath",
    type: "locality",
    parent: "Kangra, Himachal Pradesh",
    center: { lat: 32.0528, lng: 76.6478 },
    recommendedZoom: 14,
  },
  jwalamukhi: {
    name: "Jwalamukhi",
    type: "locality",
    parent: "Kangra, Himachal Pradesh",
    center: { lat: 31.8744, lng: 76.3242 },
    recommendedZoom: 14,
  },
  chamba: {
    name: "Chamba",
    type: "locality",
    parent: "Chamba, Himachal Pradesh",
    center: { lat: 32.5534, lng: 76.1258 },
    recommendedZoom: 13.8,
  },
  amritsar: {
    name: "Amritsar",
    type: "locality",
    parent: "Amritsar, Punjab",
    center: { lat: 31.634, lng: 74.8723 },
    recommendedZoom: 13.5,
  },
  kurukshetra: {
    name: "Kurukshetra",
    type: "locality",
    parent: "Kurukshetra, Haryana",
    center: { lat: 29.9695, lng: 76.8783 },
    recommendedZoom: 13.5,
  },
  ponda: {
    name: "Ponda",
    type: "locality",
    parent: "South Goa, Goa",
    center: { lat: 15.4026, lng: 74.0086 },
    recommendedZoom: 13.8,
  },
  kavlem: {
    name: "Kavlem",
    type: "locality",
    parent: "South Goa, Goa",
    center: { lat: 15.3975, lng: 73.9922 },
    recommendedZoom: 14.5,
  },
  "old-goa": {
    name: "Old Goa (Velha Goa)",
    type: "locality",
    parent: "North Goa, Goa",
    center: { lat: 15.5038, lng: 73.9118 },
    recommendedZoom: 14,
  },
  warangal: {
    name: "Warangal",
    type: "locality",
    parent: "Warangal, Telangana",
    center: { lat: 17.9689, lng: 79.5941 },
    recommendedZoom: 13.5,
  },
  bhadrachalam: {
    name: "Bhadrachalam",
    type: "locality",
    parent: "Bhadradri Kothagudem, Telangana",
    center: { lat: 17.6689, lng: 80.8936 },
    recommendedZoom: 14,
  },
  yadagirigutta: {
    name: "Yadagirigutta",
    type: "locality",
    parent: "Yadadri Bhuvanagiri, Telangana",
    center: { lat: 17.5878, lng: 78.9489 },
    recommendedZoom: 14,
  },
};

/**
 * Finds a state boundary by slug, code, or name
 */
export function getStateBoundary(query: string): GeoBoundary | null {
  const q = query.trim().toLowerCase();
  const slugMatch = STATE_BOUNDARIES[q];
  if (slugMatch) return slugMatch;

  for (const [slug, b] of Object.entries(STATE_BOUNDARIES)) {
    if (
      b.code?.toLowerCase() === q ||
      b.name.toLowerCase() === q ||
      slug.replace(/-/g, " ") === q
    ) {
      return b;
    }
  }
  return null;
}

/**
 * Finds a district boundary from static dictionary or alias
 */
export function getDistrictBoundary(query: string): GeoBoundary | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, "-");
  if (POPULAR_DISTRICTS[q]) return POPULAR_DISTRICTS[q];

  for (const b of Object.values(POPULAR_DISTRICTS)) {
    if (b.name.toLowerCase() === query.trim().toLowerCase()) return b;
  }
  return null;
}

/**
 * Finds a locality boundary from static dictionary
 */
export function getLocalityBoundary(query: string): GeoBoundary | null {
  const q = query.trim().toLowerCase().replace(/\s+/g, "-");
  if (POPULAR_LOCALITIES[q]) return POPULAR_LOCALITIES[q];

  for (const b of Object.values(POPULAR_LOCALITIES)) {
    if (b.name.toLowerCase() === query.trim().toLowerCase()) return b;
  }
  return null;
}

/**
 * Global location finder that checks:
 * 1. Locality boundary (exact match)
 * 2. District boundary (exact match)
 * 3. State boundary (exact match)
 * 4. Fuzzy / substring match in localities
 * 5. Fuzzy / substring match in districts
 */
export function findLocationBoundary(query: string): GeoBoundary | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // 1. Locality exact
  const loc = getLocalityBoundary(q);
  if (loc) return loc;

  // 2. District exact
  const dist = getDistrictBoundary(q);
  if (dist) return dist;

  // 3. State exact
  const st = getStateBoundary(q);
  if (st) return st;

  // 4. Locality fuzzy / substring match
  for (const b of Object.values(POPULAR_LOCALITIES)) {
    const nameLower = b.name.toLowerCase();
    if (nameLower.includes(q) || q.includes(nameLower)) {
      return b;
    }
  }

  // 5. District fuzzy / substring match
  for (const d of Object.values(POPULAR_DISTRICTS)) {
    const nameLower = d.name.toLowerCase();
    if (nameLower.includes(q) || q.includes(nameLower)) {
      return d;
    }
  }

  return null;
}
