/* ═══════════════════════════════════════════════════════════
   150 Chargers across Bangalore for Firebase Seeding
   Organized along 3 demo routes for hackathon presentation
   ═══════════════════════════════════════════════════════════ */

import { Charger } from "@/lib/types";

const OWNER_NAMES = [
  "Rajesh Kumar","Priya Nair","Vikram Shetty","Ananya Sharma","Suresh Reddy","Meena Iyer",
  "Arun Patel","Divya Menon","Karthik Rao","Lakshmi Devi","Naveen Gowda","Pooja Hegde",
  "Rahul Joshi","Sneha Bhat","Venkat Raman","Deepa Krishnan","Ganesh Murthy","Harini Das",
  "Jagdish Singh","Kavitha Nag","Mahesh Babu","Nandini Roy","Omkar Kulkarni","Pallavi Rao",
  "Ramya Srinivas","Sanjay Gupta","Tanvi Desai","Uma Shankar","Vivek Hegde","Wasim Khan",
  "Aditi Sharma","Bharat Rao","Chitra Menon","Dinesh Prasad","Esha Patel","Farhan Ahmed",
  "Geeta Devi","Hari Prasad","Indira Nair","Jayaram Shetty","Kishore Reddy","Latha Iyer",
  "Mohan Das","Neha Kulkarni","Padma Rao","Rakesh Gowda","Savitha Hegde","Tushar Joshi",
  "Usha Bhat","Varun Menon",
];

const AREAS: { name: string; lat: number; lng: number }[] = [
  // === ROUTE 1: Koramangala → Whitefield (East corridor) ===
  { name: "Koramangala 4th Block", lat: 12.9352, lng: 77.6245 },
  { name: "Koramangala 8th Block", lat: 12.9308, lng: 77.6263 },
  { name: "Koramangala 5th Block", lat: 12.9345, lng: 77.6170 },
  { name: "Ejipura", lat: 12.9450, lng: 77.6180 },
  { name: "Indiranagar", lat: 12.9784, lng: 77.6408 },
  { name: "Indiranagar 2nd Stage", lat: 12.9720, lng: 77.6390 },
  { name: "Domlur", lat: 12.9610, lng: 77.6387 },
  { name: "Old Airport Road", lat: 12.9670, lng: 77.6505 },
  { name: "HAL 2nd Stage", lat: 12.9590, lng: 77.6580 },
  { name: "Marathahalli", lat: 12.9591, lng: 77.7014 },
  { name: "Marathahalli Bridge", lat: 12.9565, lng: 77.7060 },
  { name: "Kadubeesanahalli", lat: 12.9360, lng: 77.6880 },
  { name: "Bellandur", lat: 12.9260, lng: 77.6780 },
  { name: "Varthur", lat: 12.9370, lng: 77.7440 },
  { name: "Whitefield Main Road", lat: 12.9698, lng: 77.7500 },
  { name: "ITPL Main Road", lat: 12.9854, lng: 77.7321 },
  { name: "Whitefield", lat: 12.9698, lng: 77.7500 },
  { name: "Brookefield", lat: 12.9693, lng: 77.7148 },
  { name: "Kundalahalli", lat: 12.9601, lng: 77.7200 },
  { name: "AECS Layout", lat: 12.9540, lng: 77.6950 },
  
  // === ROUTE 2: MG Road → Electronic City (South corridor) ===
  { name: "MG Road", lat: 12.9756, lng: 77.6074 },
  { name: "Brigade Road", lat: 12.9716, lng: 77.6070 },
  { name: "Residency Road", lat: 12.9690, lng: 77.6020 },
  { name: "Richmond Town", lat: 12.9620, lng: 77.6000 },
  { name: "Lalbagh", lat: 12.9507, lng: 77.5848 },
  { name: "Jayanagar 4th Block", lat: 12.9250, lng: 77.5840 },
  { name: "Jayanagar 9th Block", lat: 12.9180, lng: 77.5830 },
  { name: "JP Nagar", lat: 12.9100, lng: 77.5850 },
  { name: "JP Nagar 6th Phase", lat: 12.8970, lng: 77.5870 },
  { name: "Bannerghatta Road", lat: 12.8900, lng: 77.5980 },
  { name: "BTM Layout 1st Stage", lat: 12.9166, lng: 77.6101 },
  { name: "BTM Layout 2nd Stage", lat: 12.9080, lng: 77.6150 },
  { name: "Silk Board", lat: 12.9173, lng: 77.6230 },
  { name: "HSR Layout Sector 1", lat: 12.9116, lng: 77.6389 },
  { name: "HSR Layout Sector 3", lat: 12.9050, lng: 77.6410 },
  { name: "HSR Layout Sector 7", lat: 12.9020, lng: 77.6350 },
  { name: "Bommanahalli", lat: 12.8960, lng: 77.6240 },
  { name: "Begur", lat: 12.8720, lng: 77.6300 },
  { name: "Hongasandra", lat: 12.8800, lng: 77.6340 },
  { name: "Electronic City Phase 1", lat: 12.8456, lng: 77.6602 },
  { name: "Electronic City Phase 2", lat: 12.8380, lng: 77.6650 },
  { name: "Neeladri Nagar", lat: 12.8490, lng: 77.6680 },
  
  // === ROUTE 3: Hebbal → Kempegowda Airport (North corridor) ===
  { name: "Hebbal", lat: 13.0358, lng: 77.5970 },
  { name: "Sahakarnagar", lat: 13.0560, lng: 77.5930 },
  { name: "Yelahanka", lat: 13.1005, lng: 77.5960 },
  { name: "Yelahanka New Town", lat: 13.1100, lng: 77.5940 },
  { name: "Jakkur", lat: 13.0720, lng: 77.6010 },
  { name: "Thanisandra", lat: 13.0560, lng: 77.6350 },
  { name: "Nagavara", lat: 13.0380, lng: 77.6200 },
  { name: "Hennur", lat: 13.0340, lng: 77.6420 },
  { name: "Kalyan Nagar", lat: 13.0260, lng: 77.6400 },
  { name: "Banaswadi", lat: 13.0100, lng: 77.6470 },
  { name: "Ramamurthy Nagar", lat: 13.0120, lng: 77.6640 },
  
  // === Additional areas for density ===
  { name: "Malleshwaram", lat: 13.0035, lng: 77.5686 },
  { name: "Rajajinagar", lat: 12.9920, lng: 77.5560 },
  { name: "Basavanagudi", lat: 12.9420, lng: 77.5748 },
  { name: "Wilson Garden", lat: 12.9510, lng: 77.5980 },
  { name: "Shanthinagar", lat: 12.9560, lng: 77.6010 },
  { name: "Ulsoor", lat: 12.9817, lng: 77.6208 },
  { name: "Cox Town", lat: 12.9950, lng: 77.6150 },
  { name: "Fraser Town", lat: 12.9980, lng: 77.6100 },
  { name: "Sadashivanagar", lat: 13.0050, lng: 77.5800 },
  { name: "Sanjaynagar", lat: 13.0230, lng: 77.5720 },
  { name: "RT Nagar", lat: 13.0210, lng: 77.5960 },
  { name: "HBR Layout", lat: 13.0310, lng: 77.6310 },
  { name: "HRBR Layout", lat: 13.0160, lng: 77.6340 },
  { name: "Vijayanagar", lat: 12.9710, lng: 77.5340 },
  { name: "Nagarbhavi", lat: 12.9590, lng: 77.5130 },
  { name: "Banashankari", lat: 12.9250, lng: 77.5540 },
  { name: "Kumaraswamy Layout", lat: 12.9050, lng: 77.5620 },
  { name: "Padmanabhanagar", lat: 12.9080, lng: 77.5560 },
  { name: "Kanakapura Road", lat: 12.8850, lng: 77.5660 },
  { name: "Uttarahalli", lat: 12.8980, lng: 77.5430 },
  { name: "Sarjapur Road", lat: 12.9100, lng: 77.6800 },
  { name: "Haralur", lat: 12.9040, lng: 77.6680 },
  { name: "Hosa Road", lat: 12.8950, lng: 77.6500 },
];

const CONNECTOR_TYPES = ["Type 2", "CCS2", "CHAdeMO", "15A Socket"];
const POWER_BY_CONN: Record<string, number[]> = {
  "Type 2": [3.3, 7.2, 7.4, 11, 22],
  "CCS2": [25, 50, 60],
  "CHAdeMO": [25, 50],
  "15A Socket": [2.4, 3.3],
};
const AMENITIES_LIST = ["WiFi", "Parking", "Restroom", "Cafe", "Covered", "CCTV", "Seating Area", "Water"];

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function generateMassiveChargers(): Charger[] {
  const chargers: Charger[] = [];

  for (let i = 0; i < 150; i++) {
    const area = AREAS[i % AREAS.length];
    const ownerName = OWNER_NAMES[i % OWNER_NAMES.length];
    const connector = CONNECTOR_TYPES[Math.floor(seededRandom(i * 7) * CONNECTOR_TYPES.length)];
    const powers = POWER_BY_CONN[connector];
    const powerKW = powers[Math.floor(seededRandom(i * 13) * powers.length)];
    const rating = Math.round((3.5 + seededRandom(i * 17) * 1.5) * 10) / 10;
    const pricePerUnit = Math.round((4 + seededRandom(i * 23) * 8) * 10) / 10;
    const statuses: ("available" | "charging" | "booked" | "offline")[] = ["available", "available", "available", "available", "charging", "booked", "offline"];
    const status = statuses[Math.floor(seededRandom(i * 31) * statuses.length)];
    const numAmenities = 1 + Math.floor(seededRandom(i * 37) * 4);
    const amenities: string[] = [];
    for (let a = 0; a < numAmenities; a++) {
      const am = AMENITIES_LIST[Math.floor(seededRandom(i * 41 + a * 3) * AMENITIES_LIST.length)];
      if (!amenities.includes(am)) amenities.push(am);
    }

    // Small position jitter so chargers at same area aren't stacked
    const latJitter = (seededRandom(i * 53) - 0.5) * 0.004;
    const lngJitter = (seededRandom(i * 59) - 0.5) * 0.004;

    chargers.push({
      id: `charger_${String(i + 1).padStart(3, "0")}`,
      ownerName,
      connectorType: connector,
      powerKW,
      pricePerUnit,
      status,
      rating,
      location: {
        lat: area.lat + latJitter,
        lng: area.lng + lngJitter,
        address: `${Math.floor(10 + seededRandom(i * 67) * 90)}, ${area.name}`,
        city: "Bangalore",
        state: "Karnataka",
      },
      amenities,
      availableHours: seededRandom(i * 71) > 0.3 ? "6:00 AM - 10:00 PM" : "24/7",
      phoneNumber: `+91${String(Math.floor(7000000000 + seededRandom(i * 73) * 3000000000))}`,
    });
  }

  return chargers;
}
