export const bookingVehicles = [
  { id: 1, name: "Hatchback", image: "/Hatchback.png", surcharge: 0 },
  { id: 2, name: "Sedan", image: "/Sedan.png", surcharge: 150 },
  { id: 3, name: "Crossover", image: "/Crossover.png", surcharge: 300 },
  { id: 4, name: "SUV", image: "/SUV.png", surcharge: 450 },
  { id: 5, name: "Minivan", image: "/Minivan.png", surcharge: 600 },
];

export const bookingPackages = [
  {
    id: 1,
    name: "Basic Wash",
    price: 999,
    features: ["Exterior detailed wash", "Interior vacuum", "Tire and rim cleaning", "Dashboard wipe"],
  },
  {
    id: 2,
    name: "Premium Wash",
    price: 1499,
    featured: true,
    features: ["Exterior detailed wash", "Deep interior cleaning", "Tire shine", "Premium body wax", "Window polishing"],
  },
  {
    id: 3,
    name: "Ultimate Shine",
    price: 2199,
    features: ["Complete detailing", "Interior shampoo", "Premium wax and polish", "Engine bay degreasing", "Leather conditioning", "Air freshener treatment"],
  },
];

export const bookingAddons = [
  { id: 1, name: "Tire Dressing", price: 500 },
  { id: 2, name: "Sealer Hand Wax", price: 650 },
  { id: 3, name: "Windows In & Out", price: 400 },
  { id: 4, name: "Engine Cleaning", price: 800 },
  { id: 5, name: "Interior Fragrance", price: 250 },
];

export const timeSlots = [
  { label: "Morning", time: "9am to 12pm" },
  { label: "Noon", time: "12pm to 3pm" },
  { label: "Evening", time: "3pm to 6pm" },
  { label: "Night", time: "6pm to 9pm" },
];
