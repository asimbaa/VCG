import re

with open("src/components/bank/BookingApp.tsx", "r") as f:
    code = f.read()

# Replace HOTELS array
new_hotels = """const HOTELS: Hotel[] = [
  {
    id: "h1",
    name: "The Langham, Sydney",
    location: "Sydney, Australia",
    price: 850,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    features: ["Pool", "Spa", "Free WiFi", "Valet"],
    amenities: ["24hr Room Service (Breakfast, Lunch, Dinner)", "Sauna & Steam Room", "Infinity Pool", "Ocean Views", "Private Butler"]
  },
  {
    id: "h2",
    name: "Park Hyatt Sydney",
    location: "Sydney, Australia",
    price: 1200,
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
    features: ["Pool", "Restaurant", "Gym", "Bar"],
    amenities: ["24hr In-Room Dining (Michelin Chef)", "Rooftop Heated Pool", "Opera House Views", "Luxury Sauna", "Spa Treatments"]
  },
  {
    id: "h3",
    name: "Crown Towers Sydney",
    location: "Sydney, Australia",
    price: 950,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1542314831-c6a4d1409e1c?w=800&q=80",
    features: ["Casino", "Pool", "Spa", "Gym"],
    amenities: ["24hr Room Service (Global Cuisine)", "Panoramic Harbour Views", "Infinity Pool & Cabanas", "Ice Room & Sauna", "Tennis Court"]
  },
  {
    id: "h4",
    name: "Capella Sydney",
    location: "Sydney, Australia",
    price: 780,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c0d129df?w=800&q=80",
    features: ["Spa", "Gym", "Restaurant", "Pool"],
    amenities: ["24hr Fine Dining Room Service", "Auriga Spa & Sauna", "Indoor Heated Pool", "City Skyline Views", "Bespoke Cultural Tours"]
  },
];"""

match_hotels = re.search(r'const HOTELS: Hotel\[\] = \[.*?\];', code, flags=re.DOTALL)
if match_hotels:
    code = code[:match_hotels.start()] + new_hotels + code[match_hotels.end():]
    with open("src/components/bank/BookingApp.tsx", "w") as f:
        f.write(code)
    print("Patched hotels successfully.")
else:
    print("Could not find HOTELS array.")
