/**
 * NER-Sentinel - 3D GIS Intelligence & Terrain Early Warning Engine
 * Sector: Gangtok, Sikkim (Himalayan Range)
 */

// Global State
let mockZoneData = [];
let is3DEnabled = true;

// ---------- 1. 3D MAP INITIALIZATION ----------
const gangtokCenter = [88.6138, 27.3314];

const map = new maplibregl.Map({
  container: 'map',
  style: {
    version: 8,
    sources: {
      // Photorealistic Satellite Base Layer (Esri World Imagery)
      'satellite-tiles': {
        type: 'raster',
        tiles: [
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
        ],
        tileSize: 256,
        attribution: '&copy; Esri World Imagery, USGS, NASA'
      },
      // AWS Open Elevation Digital Elevation Model (Terrarium DEM)
      'terrain-dem': {
        type: 'raster-dem',
        encoding: 'terrarium',
        tiles: [
          'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        ],
        tileSize: 256,
        maxzoom: 15
      }
    },
    layers: [
      {
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite-tiles',
        minzoom: 0,
        maxzoom: 19
      }
    ],
    terrain: {
      source: 'terrain-dem',
      exaggeration: 1.8 // Himalayan relief exaggeration
    },
    sky: {
      'sky-color': '#0f172a',
      'sky-horizon-blend': 0.5,
      'horizon-color': '#1e293b',
      'horizon-fog-blend': 0.8,
      'fog-color': '#0b1120',
      'fog-ground-blend': 0.6
    }
  },
  center: gangtokCenter,
  zoom: 13.6,
  pitch: 65,      // 3D Angle Tilt
  bearing: -35,   // 3D Direction Angle
  maxPitch: 85
});

// Add 3D Navigation Controls (Zoom, Pitch, Compass)
map.addControl(new maplibregl.NavigationControl({
  visualizePitch: true
}), 'top-right');

// ---------- 2. GEOJSON ROUTES DEFINITIONS ----------
const primaryRouteGeoJSON = {
  type: "Feature",
  properties: { name: "Primary Corridor (Standard Highway)" },
  geometry: {
    type: "LineString",
    coordinates: [
      [88.6000, 27.3450],
      [88.6070, 27.3400],
      [88.6138, 27.3314], // Passes right through Zone A
      [88.6200, 27.3250],
      [88.6280, 27.3200]
    ]
  }
};

const alternateRouteGeoJSON = {
  type: "Feature",
  properties: { name: "Alternate Safe Evacuation Bypass" },
  geometry: {
    type: "LineString",
    coordinates: [
      [88.6000, 27.3450],
      [88.5950, 27.3350],
      [88.6000, 27.3250],
      [88.6150, 27.3180],
      [88.6280, 27.3200]
    ]
  }
};

// Helper: Generate polygon circle geometry for 3D drape rendering
function createGeoJSONCircle(center, radiusInMeters, points = 64) {
  const coords = { latitude: center.lat, longitude: center.lng };
  const km = radiusInMeters / 1000;
  const ret = [];
  const distanceX = km / (111.320 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.574;

  for (let i = 0; i < points; i++) {
    const theta = (i / points) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);
  return ret;
}

// ---------- 3. DATA FETCHER (API Contract) ----------
function fetchMockZoneData() {
  return fetch("dummyZones.json")
    .then(response => response.json());
}

// Priority to Color Helper
function getPriorityColor(priority) {
  switch (priority) {
    case "CRITICAL": return "#ef4444";
    case "HIGH": return "#f97316";
    case "MODERATE": return "#eab308";
    default: return "#10b981";
  }
}

// Convert Zone array into GeoJSON FeatureCollection
function buildZonesGeoJSON(zones) {
  return {
    type: "FeatureCollection",
    features: zones.map(zone => {
      const color = getPriorityColor(zone.operational_priority);
      const radius = zone.zone_id === "ZONE-A" ? 750 : 650;
      const polygonCoords = createGeoJSONCircle(zone.center, radius);

      return {
        type: "Feature",
        properties: {
          zone_id: zone.zone_id,
          priority: zone.operational_priority,
          color: color,
          lat: zone.center.lat,
          lng: zone.center.lng
        },
        geometry: {
          type: "Polygon",
          coordinates: [polygonCoords]
        }
      };
    })
  };
}

// ---------- 4. RENDER / UPDATE LAYERS ON 3D MAP ----------
function update3DMapZones(zones) {
  const zoneGeoJSON = buildZonesGeoJSON(zones);
  const source = map.getSource('hazard-zones-source');
  if (source) {
    source.setData(zoneGeoJSON);
  }
}

function checkRouteSafety(zones) {
  const zoneA = zones.find(z => z.zone_id === "ZONE-A");
  const isBlocked = zoneA && zoneA.operational_priority === "CRITICAL";

  const activeRoute = isBlocked ? alternateRouteGeoJSON : primaryRouteGeoJSON;
  const routeColor = isBlocked ? "#10b981" : "#38bdf8";

  const routeSource = map.getSource('evac-route-source');
  if (routeSource) {
    routeSource.setData(activeRoute);
    map.setPaintProperty('evac-route-line', 'line-color', routeColor);
    map.setPaintProperty('evac-route-glow', 'line-color', routeColor);
  }
}

// ---------- 5. MAP LOAD EVENT & LAYER REGISTRATION ----------
map.on('load', () => {
  // 1. Register Evacuation Route Layer (With 3D Glow)
  map.addSource('evac-route-source', {
    type: 'geojson',
    data: alternateRouteGeoJSON
  });

  // Route Outer Glow
  map.addLayer({
    id: 'evac-route-glow',
    type: 'line',
    source: 'evac-route-source',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#10b981',
      'line-width': 12,
      'line-opacity': 0.35,
      'line-blur': 4
    }
  });

  // Route Core Line
  map.addLayer({
    id: 'evac-route-line',
    type: 'line',
    source: 'evac-route-source',
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': '#10b981',
      'line-width': 5,
      'line-opacity': 0.95
    }
  });

  // 2. Register Hazard Zones Source & 3D Drapes
  map.addSource('hazard-zones-source', {
    type: 'geojson',
    data: { type: "FeatureCollection", features: [] }
  });

  // Hazard Zone Polygon Fill (Draped over 3D Himalayan Terrain)
  map.addLayer({
    id: 'hazard-zones-fill',
    type: 'fill',
    source: 'hazard-zones-source',
    paint: {
      'fill-color': ['get', 'color'],
      'fill-opacity': 0.45
    }
  });

  // Hazard Zone Outer Border
  map.addLayer({
    id: 'hazard-zones-stroke',
    type: 'line',
    source: 'hazard-zones-source',
    paint: {
      'line-color': ['get', 'color'],
      'line-width': 3,
      'line-opacity': 0.9
    }
  });

  // 3. Interactive Popups on clicking 3D hazard zones
  map.on('click', 'hazard-zones-fill', (e) => {
    const props = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(`
        <div style="font-size:14px; font-weight:700; color:#fff; margin-bottom:4px;">${props.zone_id}</div>
        <div style="font-size:12px; color:#94a3b8;">Risk Level: <b style="color:${props.color}">${props.priority}</b></div>
        <div style="font-size:11px; color:#64748b; margin-top:4px;">Himalayan 3D Landslide Sector</div>
      `)
      .addTo(map);
  });

  map.on('mouseenter', 'hazard-zones-fill', () => { map.getCanvas().style.cursor = 'pointer'; });
  map.on('mouseleave', 'hazard-zones-fill', () => { map.getCanvas().style.cursor = ''; });

  // 4. Initial Fetch & Render
  fetchMockZoneData()
    .then(zones => {
      mockZoneData = zones;
      update3DMapZones(mockZoneData);
      checkRouteSafety(mockZoneData);
    })
    .catch(err => {
      console.error("Failed to load dummyZones.json:", err);
    });
});

// ---------- 6. CAMERA PRESET VIEWS ----------
function setCameraView(preset) {
  document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));

  if (preset === 'ridge') {
    document.getElementById('view3DRidge').classList.add('active');
    map.flyTo({
      center: [88.6138, 27.3314],
      zoom: 13.8,
      pitch: 68,
      bearing: -35,
      duration: 2000
    });
  } else if (preset === 'valley') {
    document.getElementById('view3DValley').classList.add('active');
    map.flyTo({
      center: [88.6100, 27.3400],
      zoom: 14.5,
      pitch: 78,
      bearing: 110,
      duration: 2200
    });
  } else if (preset === 'topdown') {
    document.getElementById('view2DTop').classList.add('active');
    map.flyTo({
      center: [88.6138, 27.3314],
      zoom: 13.2,
      pitch: 0,
      bearing: 0,
      duration: 1800
    });
  }
}

// ---------- 7. TOGGLE 3D ELEVATION TERRAIN ----------
function toggleTerrain() {
  const btn = document.getElementById('toggleTerrainBtn');
  if (is3DEnabled) {
    map.setTerrain(null);
    btn.innerHTML = `<span>🏔️ 3D Elevation: <b>OFF</b></span>`;
    is3DEnabled = false;
  } else {
    map.setTerrain({ source: 'terrain-dem', exaggeration: 1.8 });
    btn.innerHTML = `<span>🏔️ 3D Elevation: <b>ON</b></span>`;
    is3DEnabled = true;
  }
}

// ---------- 8. INTERACTIVE DEMO TOGGLE BUTTON ----------
document.getElementById("toggleZoneA").addEventListener("click", () => {
  const zoneA = mockZoneData.find(z => z.zone_id === "ZONE-A");

  if (zoneA) {
    if (zoneA.operational_priority === "CRITICAL") {
      zoneA.operational_priority = "MODERATE";
    } else {
      zoneA.operational_priority = "CRITICAL";
    }

    update3DMapZones(mockZoneData);
    checkRouteSafety(mockZoneData);
  }
});
