import re

with open("src/components/bank/BookingApp.tsx", "r") as f:
    code = f.read()

# I need to add 24hr room service in 5 star hotels with views, pools, and sauna. Let's see what is there right now.
