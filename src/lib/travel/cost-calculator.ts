export interface CostCalculatorInput {
  totalDays: number;
  groupSize: number;
  travelMode: "car" | "bus" | "train" | "walking";
  accommodationType: "dharamshala" | "budget_hotel" | "comfort_hotel";
  foodPreference: "annadanam_temple" | "vegetarian_mess" | "restaurant";
  totalEstimatedKm: number;
  templeCount: number;
  specialDarshanCount?: number;
}

export interface CostBreakdownItem {
  category: string;
  amountInr: number;
  perPersonInr: number;
  description: string;
  isOptional?: boolean;
}

export interface TripCostSummary {
  totalInr: number;
  perPersonInr: number;
  breakdown: CostBreakdownItem[];
  emergencyBufferInr: number;
  freshnessLabel: "ESTIMATED";
  disclaimer: string;
}

/**
 * Calculates a realistic, transparent pilgrimage budget breakdown (Phase 11).
 * All rates derived from verified Indian pilgrim transit and trust accommodation benchmarks.
 * Never presented as a live quotation or guaranteed price.
 */
export function calculateTripCost(input: CostCalculatorInput): TripCostSummary {
  const {
    totalDays,
    groupSize,
    travelMode,
    accommodationType,
    foodPreference,
    totalEstimatedKm,
    templeCount,
    specialDarshanCount = 0,
  } = input;

  const validGroup = Math.max(1, groupSize);
  const validDays = Math.max(1, totalDays);

  // 1. Long-Distance / Intercity Transport
  let transportTotal = 0;
  let transportDesc = "";
  if (travelMode === "car") {
    // ₹14/km standard sedan/SUV driver rate + toll allowance
    const fuelAndRental = totalEstimatedKm * 14;
    const tollAllowance = Math.round((totalEstimatedKm / 100) * 150);
    transportTotal = Math.round(fuelAndRental + tollAllowance);
    transportDesc = `Private vehicle fuel & tolls (${totalEstimatedKm} km @ ₹14/km + tolls)`;
  } else if (travelMode === "train") {
    // ₹450 per person average 3AC/Sleeper intercity
    transportTotal = validGroup * 500 * (totalEstimatedKm > 500 ? 2 : 1);
    transportDesc = `Train fares for ${validGroup} pilgrim(s)`;
  } else if (travelMode === "bus") {
    // ₹1.5/km per person State Road Transport Corporation (KSRTC/MSRTC/APSRTC)
    transportTotal = Math.round(validGroup * totalEstimatedKm * 1.6);
    transportDesc = `State express transport for ${validGroup} passenger(s)`;
  } else {
    transportTotal = 0;
    transportDesc = "Pada Yatra (Walking Pilgrimage)";
  }

  // 2. Accommodation (Dharamshala vs Trust Guest House vs Hotel)
  const roomCount = Math.ceil(validGroup / 2);
  const nights = Math.max(1, validDays - 1);
  let perRoomNight = 400; // Dharamshala
  let accomDesc = "Temple Trust Dharamshala / Pilgrim Choultry";

  if (accommodationType === "budget_hotel") {
    perRoomNight = 1200;
    accomDesc = "Budget Pilgrim Lodge / Standard Hotel";
  } else if (accommodationType === "comfort_hotel") {
    perRoomNight = 2500;
    accomDesc = "Comfort Hotel / Trust AC Guest House";
  }

  const accomTotal = roomCount * perRoomNight * nights;

  // 3. Sacred Food / Meals
  let mealPerPersonPerDay = 150; // Annadanam + light satvik refreshments
  let mealDesc = "Temple Annadanam & satvik refreshments";

  if (foodPreference === "vegetarian_mess") {
    mealPerPersonPerDay = 350;
    mealDesc = "Traditional South/North Indian pure vegetarian mess meals";
  } else if (foodPreference === "restaurant") {
    mealPerPersonPerDay = 650;
    mealDesc = "Pure vegetarian multi-cuisine dining";
  }

  const foodTotal = validGroup * mealPerPersonPerDay * validDays;

  // 4. Temple Seva / Special Darshan / Archana Tokens
  // General queue is always free; optional special darshan ₹100-300
  const sevaPerPerson = specialDarshanCount * 250;
  const sevaTotal = validGroup * sevaPerPerson;
  const sevaDesc = specialDarshanCount > 0
    ? `Special queue tokens & archana for ${specialDarshanCount} shrine(s)`
    : "General public darshan (Free admission)";

  // 5. Local Auto / E-Rickshaw / Footwear & Cloakroom fees
  const localIncidentalTotal = validGroup * 100 * validDays + templeCount * 20;

  // 6. Emergency Buffer (10%)
  const subtotal = transportTotal + accomTotal + foodTotal + sevaTotal + localIncidentalTotal;
  const emergencyBufferInr = Math.round(subtotal * 0.1);
  const totalInr = subtotal + emergencyBufferInr;

  const breakdown: CostBreakdownItem[] = [
    {
      category: "Transport & Transit",
      amountInr: transportTotal,
      perPersonInr: Math.round(transportTotal / validGroup),
      description: transportDesc,
    },
    {
      category: "Pilgrim Accommodation",
      amountInr: accomTotal,
      perPersonInr: Math.round(accomTotal / validGroup),
      description: `${accomDesc} (${roomCount} room(s) for ${nights} night(s))`,
    },
    {
      category: "Satvik Meals & Food",
      amountInr: foodTotal,
      perPersonInr: Math.round(foodTotal / validGroup),
      description: `${mealDesc} for ${validDays} day(s)`,
    },
    {
      category: "Darshan & Seva Tokens",
      amountInr: sevaTotal,
      perPersonInr: Math.round(sevaTotal / validGroup),
      description: sevaDesc,
      isOptional: true,
    },
    {
      category: "Local Autos & Cloakroom",
      amountInr: localIncidentalTotal,
      perPersonInr: Math.round(localIncidentalTotal / validGroup),
      description: "Auto-rickshaws, footwear deposit, mobile lockers",
    },
    {
      category: "Emergency & Medical Reserve (10%)",
      amountInr: emergencyBufferInr,
      perPersonInr: Math.round(emergencyBufferInr / validGroup),
      description: "Contingency reserve for unexpected transit or hydration needs",
      isOptional: true,
    },
  ];

  return {
    totalInr,
    perPersonInr: Math.round(totalInr / validGroup),
    breakdown,
    emergencyBufferInr,
    freshnessLabel: "ESTIMATED",
    disclaimer: "Estimated budget benchmark based on Indian pilgrim standard rates. Not an official quote or commercial booking price.",
  };
}
