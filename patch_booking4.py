import re

with open("src/components/bank/BookingApp.tsx", "r") as f:
    code = f.read()

# I will replace `amenities: [` with the desired new amenities
# Because we only want to do it in the hotel definitions, we can just replace all of them.
code = code.replace(
    'amenities: [',
    'amenities: ["24Hr Room Service (Breakfast, Lunch, Dinner)", "Luxury Sauna", "Premium Views", "Infinity Pool", '
)

with open("src/components/bank/BookingApp.tsx", "w") as f:
    f.write(code)

print("Patched booking amenities again successfully.")

