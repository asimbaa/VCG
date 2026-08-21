import re

with open("src/components/bank/UberApp.tsx", "r") as f:
    content = f.read()

target = """            {rideState === "trip" || rideState === "enroute" ? (
              <React.Suspense
                fallback={
                  <div className="w-full h-full min-h-[350px] bg-slate-900 flex items-center justify-center">
                    Loading Live Satellite Tracking...
                  </div>
                }
              >
                <DeliveryMap
                  originName={pickup}
                  destinationName={destination}
                  type="ride"
                  progress={progress}
                />
              </React.Suspense>
            ) : ("""

replacement = """            {rideState === "trip" || rideState === "enroute" || (trackingMode && trackingData) ? (
              <React.Suspense
                fallback={
                  <div className="w-full h-full min-h-[350px] bg-slate-900 flex items-center justify-center">
                    Loading Live Satellite Tracking...
                  </div>
                }
              >
                <DeliveryMap
                  originName={trackingMode && trackingData ? trackingData.pickup : pickup}
                  destinationName={trackingMode && trackingData ? trackingData.destination : destination}
                  type="ride"
                  progress={trackingMode && trackingData ? trackingData.progress : progress}
                />
              </React.Suspense>
            ) : ("""

content = content.replace(target, replacement)

with open("src/components/bank/UberApp.tsx", "w") as f:
    f.write(content)

print("UberApp patched")
