const prisma = require('./config/prisma');

const CITIES = [
  { id: 'c1', name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { id: 'c2', name: 'Tokyo', country: 'Japan', lat: 35.6762, lng: 139.6503 },
  { id: 'c3', name: 'Kyoto', country: 'Japan', lat: 35.0116, lng: 135.7681 },
  { id: 'c4', name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
  { id: 'c5', name: 'Florence', country: 'Italy', lat: 43.7696, lng: 11.2558 },
  { id: 'c6', name: 'Mumbai', country: 'India', lat: 19.0760, lng: 72.8777 },
  { id: 'c7', name: 'New Delhi', country: 'India', lat: 28.6139, lng: 77.2090 },
  { id: 'c8', name: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { id: 'c9', name: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { id: 'c10', name: 'Cairo', country: 'Egypt', lat: 30.0444, lng: 31.2357 }
];

async function main() {
  console.log("Seeding cities into the database...");
  for (const city of CITIES) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: {
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng
      },
      create: {
        id: city.id,
        name: city.name,
        country: city.country,
        lat: city.lat,
        lng: city.lng
      }
    });
    console.log(`Upserted city: ${city.name}, ${city.country} (id: ${city.id})`);
  }
  console.log("Seeding completed successfully.");
}

main()
  .catch((err) => {
    console.error("Error seeding database:", err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
