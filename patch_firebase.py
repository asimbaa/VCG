import re

with open("src/firebase.ts", "r") as f:
    content = f.read()

# Remove the old wrapper definitions
content = re.sub(r'export const addDoc = async.*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'export const setDoc = async.*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'export const updateDoc = async.*?};\n', '', content, flags=re.DOTALL)
content = re.sub(r'export const deleteDoc = async.*?};\n', '', content, flags=re.DOTALL)

# Add the new loosely-typed wrappers
new_wrappers = """
export const addDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreAddDoc as any)(...args));
};

export const setDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreSetDoc as any)(...args));
};

export const updateDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreUpdateDoc as any)(...args));
};

export const deleteDoc = async (...args: any[]) => {
  return withRetry(() => (firestoreDeleteDoc as any)(...args));
};
"""
content += new_wrappers

with open("src/firebase.ts", "w") as f:
    f.write(content)
