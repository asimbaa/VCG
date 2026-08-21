import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

function RouteDisplay({ origin, destination, setDistanceInfo }: {
  origin: google.maps.LatLngLiteral | null;
  destination: google.maps.LatLngLiteral | null;
  setDistanceInfo: (info: string) => void;
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;
    
    // Clear previous route
    polylinesRef.current.forEach(p => p.setMap(null));

    if ((routesLib as any)?.Route?.computeRoutes) {
      (routesLib as any).Route.computeRoutes({
        origin,
        destination,
        travelMode: 'DRIVING',
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      }).then(({ routes }: any) => {
        if (routes?.[0]) {
          const route = routes[0];
          const newPolylines = route.createPolylines?.() || [];
          newPolylines.forEach((p: any) => p.setMap(map));
          polylinesRef.current = newPolylines;
          if (route.viewport) map.fitBounds(route.viewport);
          
          const dist = route.distanceMeters ? (route.distanceMeters / 1000).toFixed(1) + ' km' : '';
          const dur = route.durationMillis ? Math.round(route.durationMillis / 60000) + ' min' : '';
          setDistanceInfo(`${dist} (${dur} driving)`);
        }
      }).catch(console.error);
    }

    return () => polylinesRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination, setDistanceInfo]);

  return null;
}

function MapContent({ hotelName, hotelLocation }: { hotelName: string, hotelLocation: string }) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();
  
  const [hotelLatLng, setHotelLatLng] = useState<google.maps.LatLngLiteral | null>(null);
  const [attraction, setAttraction] = useState<any>(null);
  const [distanceInfo, setDistanceInfo] = useState<string>('');

  useEffect(() => {
    if (!placesLib || !map) return;
    
    // Search for hotel
    placesLib.Place.searchByText({
      textQuery: `${hotelName} ${hotelLocation}`,
      fields: ['location', 'displayName'],
      maxResultCount: 1,
    }).then(({ places }) => {
      if (places && places.length > 0) {
        const loc = places[0].location;
        if (loc) {
          const coords = { lat: loc.lat(), lng: loc.lng() };
          setHotelLatLng(coords);
          map.setCenter(coords);
          map.setZoom(14);
          
          // Search nearby attractions
          placesLib.Place.searchNearby({
            locationRestriction: {
              center: coords,
              radius: 5000, // 5km
            },
            includedPrimaryTypes: ['tourist_attraction'],
            maxResultCount: 1,
            fields: ['location', 'displayName'],
          }).then((res) => {
             if (res.places && res.places.length > 0) {
                setAttraction(res.places[0]);
             }
          }).catch(console.error);
        }
      }
    }).catch(console.error);
  }, [placesLib, map, hotelName, hotelLocation]);

  return (
    <>
      {hotelLatLng && (
        <AdvancedMarker position={hotelLatLng} title={hotelName} zIndex={100}>
          <Pin background="#003580" glyphColor="#fff" borderColor="#002244" />
        </AdvancedMarker>
      )}
      
      {attraction && attraction.location && (
        <AdvancedMarker position={{ lat: attraction.location.lat(), lng: attraction.location.lng() }} title={attraction.displayName}>
          <Pin background="#10b981" glyphColor="#fff" borderColor="#047857" />
        </AdvancedMarker>
      )}

      {hotelLatLng && attraction && attraction.location && (
        <RouteDisplay 
          origin={hotelLatLng} 
          destination={{ lat: attraction.location.lat(), lng: attraction.location.lng() }} 
          setDistanceInfo={setDistanceInfo}
        />
      )}
      
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded-xl shadow-lg border border-slate-200 backdrop-blur text-xs z-10 max-w-[200px]">
        <h4 className="font-bold text-slate-800 mb-1">Local Area Explorer</h4>
        {attraction ? (
          <div>
            <p className="text-slate-600 mb-1"><span className="w-2 h-2 inline-block bg-[#003580] rounded-full mr-1"></span>Hotel: {hotelName}</p>
            <p className="text-slate-600 mb-1"><span className="w-2 h-2 inline-block bg-emerald-500 rounded-full mr-1"></span>Attraction: {attraction.displayName || 'Nearby Point of Interest'}</p>
            {distanceInfo && <p className="font-bold text-[#003580] mt-2 pt-2 border-t border-slate-200">Distance: {distanceInfo}</p>}
          </div>
        ) : (
          <p className="text-slate-500">Locating hotel and nearby attractions...</p>
        )}
      </div>
    </>
  );
}

export function HotelMapViewer({ hotelName, hotelLocation }: { hotelName: string, hotelLocation: string }) {
  if (!hasValidKey) {
    return (
      <div className="w-full h-64 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-500 text-xs text-center p-4">
        <div>
          <p className="font-bold text-slate-700 mb-1">Interactive Map Unavailable</p>
          <p>Please configure your Google Maps Platform API key in AI Studio Secrets to view location insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[350px] rounded-xl overflow-hidden shadow-inner relative border border-slate-200 mt-4 relative">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={{ lat: -33.8688, lng: 151.2093 }}
          defaultZoom={13}
          mapId="HOTEL_BOOKING_MAP_ID"
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={true}
        >
          <MapContent hotelName={hotelName} hotelLocation={hotelLocation} />
        </Map>
      </APIProvider>
    </div>
  );
}
