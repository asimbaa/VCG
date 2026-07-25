import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

target = """          <button
            onClick={() => {
              setUser({ email: 'asim.nsw@gmail.com', uid: 'mock-12345', displayName: 'Asim Aryal' } as User);
            }}"""

replace = """          <button
            onClick={() => {
              const maxBalances = { USD: 999999999999, EUR: 999999999999, GBP: 999999999999, AUD: 999999999999 };
              localStorage.setItem('valourian_balances', JSON.stringify(maxBalances));
              localStorage.setItem('bank_balances', JSON.stringify(maxBalances));
              setUser({ email: 'asim.nsw@gmail.com', uid: 'mock-12345', displayName: 'Asim Aryal' } as User);
            }}"""

with open('src/App.tsx', 'w') as f:
    f.write(content.replace(target, replace))
