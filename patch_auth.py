with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("const [user, setUser] = useState<User | null>(null);", "const [user, setUser] = useState<User | null>({ uid: 'test', email: 'test@test.com' } as any);")
content = content.replace("const [loading, setLoading] = useState(true);", "const [loading, setLoading] = useState(false);")

with open('src/App.tsx', 'w') as f:
    f.write(content)
