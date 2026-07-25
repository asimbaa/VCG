import re

with open("src/components/pay/RapidPay.tsx", "r") as f:
    content = f.read()

# We need to completely wipe the rest of the file after the `Verify PayID` button and put back the rest of the form.
# Instead of doing that blindly, I'll extract the correct code from the backup file, and replace from there to the end.

with open("src/components/pay/RapidPay.tsx.bak", "r") as f:
    backup_content = f.read()

# Find the split point in the backup
split_point = backup_content.find('{status === "validating" ? "Looking up PayID..." : "Verify PayID"}')

if split_point != -1:
    end_of_split = backup_content.find("</button>", split_point) + len("</button>")
    good_tail = backup_content[end_of_split:]
    
    # In the current content, find the same split point
    current_split = content.find('{status === "validating" ? "Looking up PayID..." : "Verify PayID"}')
    if current_split != -1:
        current_end = content.find("</button>", current_split) + len("</button>")
        content = content[:current_end] + good_tail

with open("src/components/pay/RapidPay.tsx", "w") as f:
    f.write(content)
