/**
 * Canonical Architectural Elements of Indian Temples
 * Grounded in Shilpa Shastras and architectural traditions (Dravida, Nagara, Vesara).
 */

export interface ArchitecturalElement {
  id: string;
  name: string;
  sanskritName: string;
  tradition: "Dravida" | "Nagara" | "Both";
  shortDescription: string;
  significance: string;
  depthTier: number; // 1 to 5 from entrance to sanctum
  coordinates: { x: number; y: number; z: number }; // Relative 3D unit coordinates
}

export const CANONICAL_ELEMENTS: ArchitecturalElement[] = [
  {
    id: "gopuram",
    name: "Gopuram / Torana",
    sanskritName: "गोपुरम् / तोरण",
    tradition: "Both",
    shortDescription: "Monumental gateway tower greeting pilgrims into the sacred precincts.",
    significance: "Marks the metaphysical boundary between the mundane outer cosmos and the consecrated inner sanctum.",
    depthTier: 1,
    coordinates: { x: 0, y: -0.2, z: 2.2 },
  },
  {
    id: "mandapa",
    name: "Mahamandapa",
    sanskritName: "महामण्डप",
    tradition: "Both",
    shortDescription: "Grand pillared hall designed for collective chanting, dance, and assembly.",
    significance: "Features geometrically aligned monolithic pillars vibrating with acoustic sanctity and cosmic alignments.",
    depthTier: 2,
    coordinates: { x: 0, y: 0, z: 1.1 },
  },
  {
    id: "antarala",
    name: "Antarala",
    sanskritName: "अन्तराल",
    tradition: "Both",
    shortDescription: "Intermediate vestibule connecting the gathering hall to the holy chamber.",
    significance: "A transitional acoustic and spiritual threshold where outer noise fades into solemn meditative silence.",
    depthTier: 3,
    coordinates: { x: 0, y: 0.1, z: 0.2 },
  },
  {
    id: "garbhagriha",
    name: "Garbhagriha",
    sanskritName: "गर्भगृह",
    tradition: "Both",
    shortDescription: "The Sanctum Sanctorum — the 'Womb-House' housing the consecrated deity.",
    significance: "The supreme focal point of the temple; unadorned, heavy stone walls holding concentrated divine energy and timeless stillness.",
    depthTier: 4,
    coordinates: { x: 0, y: 0.25, z: -0.7 },
  },
  {
    id: "shikhara",
    name: "Vimana / Shikhara",
    sanskritName: "विमान / शिखर",
    tradition: "Both",
    shortDescription: "Ascending superstructure crowning the Garbhagriha reaching skyward.",
    significance: "Symbolizes Mount Meru — the cosmic axis connecting terrestrial existence directly to the infinite heavens.",
    depthTier: 5,
    coordinates: { x: 0, y: 1.3, z: -0.7 },
  },
  {
    id: "prakara",
    name: "Prakara & Parikrama",
    sanskritName: "प्राकार / परिक्रमा",
    tradition: "Both",
    shortDescription: "Concentric stone enclosure walls and clock-wise circumambulatory pathways.",
    significance: "Guides pilgrims through sequential stages of mental purification as they circle the core cosmic center.",
    depthTier: 1,
    coordinates: { x: 1.6, y: -0.15, z: 0.5 },
  },
];
