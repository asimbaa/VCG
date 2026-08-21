import re

with open("src/components/bank/BookingApp.tsx", "r") as f:
    code = f.read()

# I will replace `amenities: [...]` with the ones including 24 hr room service, sauna, views, pools in all 5-star hotels
code = re.sub(
    r'amenities: \["([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)"\]',
    r'amenities: ["\1", "\2", "\3", "\4", "24Hr Room Service (Breakfast/Lunch/Dinner)", "Sauna & Spa", "Harbour/City Views", "Infinity Pool"]',
    code
)

code = re.sub(
    r'amenities: \["([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)", "([^"]*)"\]',
    r'amenities: ["\1", "\2", "\3", "\4", "\5", "24Hr Room Service (Breakfast/Lunch/Dinner)", "Luxury Sauna", "Panoramic Views", "Heated Pool"]',
    code
)


with open("src/components/bank/BookingApp.tsx", "w") as f:
    f.write(code)

print("Patched booking amenities successfully.")

