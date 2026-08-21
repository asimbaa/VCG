export const scanPhysicalCard = async (): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    if ('NDEFReader' in window) {
      try {
        const ndef = new (window as any).NDEFReader();
        await ndef.scan();
        ndef.addEventListener("readingerror", () => {
          reject(new Error("Cannot read data from the NFC tag. Try another one?"));
        });
        ndef.addEventListener("reading", ({ message, serialNumber }: any) => {
          // If we actually read an NDEF tag, simulate extracting card details from it
          // Real EMV cards don't use NDEF, they use ISO-DEP (APDU), which Web NFC cannot read directly.
          // For demo/prototype purposes, we'll just return a mock card when ANY NFC tag is read.
          resolve({
            id: `NFC-PHYS-\${serialNumber || Math.random().toString(36).slice(2)}`,
            network: "Valourian Infinite Physical",
            number: "5119 39•• •••• 8350",
            fullNumber: "5119398845628350",
            last4: "8350",
            expiry: "12/30",
            cvv: "999",
            balance: 0,
            type: "physical_import"
          });
        });
      } catch (error) {
        reject(error);
      }
    } else {
      // Fallback simulation for unsupported browsers/devices (e.g. desktop)
      setTimeout(() => {
        resolve({
            id: `NFC-PHYS-SIM-\${Math.random().toString(36).slice(2)}`,
            network: "Valourian Infinite Physical",
            number: "5119 39•• •••• 8350",
            fullNumber: "5119398845628350",
            last4: "8350",
            expiry: "12/30",
            cvv: "999",
            balance: 0,
            type: "physical_import"
          });
      }, 2000); // 2 second simulation
    }
  });
};
