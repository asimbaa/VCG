import re

with open("src/components/bank/AuraDriveMap.tsx", "r") as f:
    content = f.read()

old_routing = """    const directionsService = new routesLib.DirectionsService();
    directionsService.route({
      origin,
      destination,
      travelMode: 'DRIVING' as any,
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = [new google.maps.Polyline({
          path: routes[0].overview_path,
        })];
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].bounds) map.fitBounds(routes[0].bounds);
      }
    }).catch(err => console.error("Routing Error:", err));"""

new_routing = """    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const newPolylines = routes[0].createPolylines();
        newPolylines.forEach(p => {
          p.setOptions({
            strokeColor: '#3b82f6',
            strokeOpacity: 0.8,
            strokeWeight: 5,
          });
          p.setMap(map);
        });
        polylinesRef.current = newPolylines;
        if (routes[0].viewport) map.fitBounds(routes[0].viewport);
      }
    }).catch(err => console.error("Routing Error:", err));"""

if old_routing in content:
    content = content.replace(old_routing, new_routing)
    with open("src/components/bank/AuraDriveMap.tsx", "w") as f:
        f.write(content)
    print("AuraDriveMap patched successfully.")
else:
    print("Could not find old routing block in AuraDriveMap.tsx")

