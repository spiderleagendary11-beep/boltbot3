import { DangerZone, GPSLocation } from '../types';

// Enhanced danger zones with more realistic coordinates and detailed information
export const DANGER_ZONES: DangerZone[] = [
  {
    id: '1',
    name: 'High Crime District',
    description: 'Area with elevated crime rates, especially after dark. Avoid walking alone.',
    riskLevel: 'high',
    coordinates: [
      [40.7589, -73.9851], // Times Square area
      [40.7589, -73.9831],
      [40.7569, -73.9831],
      [40.7569, -73.9851]
    ],
    alertMessage: '⚠️ WARNING: You are entering a high-crime area. Stay alert, avoid displaying valuables, and consider alternative routes.'
  },
  {
    id: '2',
    name: 'Active Construction Zone',
    description: 'Major construction site with heavy machinery and restricted pedestrian access',
    riskLevel: 'medium',
    coordinates: [
      [40.7614, -73.9776], // Near Central Park
      [40.7614, -73.9756],
      [40.7594, -73.9756],
      [40.7594, -73.9776]
    ],
    alertMessage: '🚧 CAUTION: Active construction zone ahead. Use designated walkways and follow all posted safety signs.'
  },
  {
    id: '3',
    name: 'Flood Risk Zone',
    description: 'Low-lying area prone to flash flooding during heavy rainfall and storms',
    riskLevel: 'critical',
    coordinates: [
      [40.7505, -73.9934], // Lower Manhattan area
      [40.7505, -73.9914],
      [40.7485, -73.9914],
      [40.7485, -73.9934]
    ],
    alertMessage: '🌊 CRITICAL ALERT: You are entering a flood-prone area. Evacuate immediately if weather conditions worsen.'
  },
  {
    id: '4',
    name: 'Industrial Hazard Zone',
    description: 'Chemical processing facility with potential air quality risks',
    riskLevel: 'high',
    coordinates: [
      [40.7450, -73.9900],
      [40.7450, -73.9880],
      [40.7430, -73.9880],
      [40.7430, -73.9900]
    ],
    alertMessage: '☢️ HAZARD: Industrial zone with potential air quality risks. Minimize exposure time and avoid if you have respiratory conditions.'
  },
  {
    id: '5',
    name: 'Protest Area',
    description: 'Area with ongoing civil demonstrations and increased police presence',
    riskLevel: 'medium',
    coordinates: [
      [40.7580, -73.9855],
      [40.7580, -73.9835],
      [40.7560, -73.9835],
      [40.7560, -73.9855]
    ],
    alertMessage: '📢 NOTICE: You are approaching an area with active demonstrations. Exercise caution and be aware of crowd dynamics.'
  }
];

export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  
  return inside;
}

export function checkGeofenceViolations(location: GPSLocation): DangerZone[] {
  const point: [number, number] = [location.latitude, location.longitude];
  
  return DANGER_ZONES.filter(zone => 
    isPointInPolygon(point, zone.coordinates)
  );
}

export function getRiskLevelColor(riskLevel: DangerZone['riskLevel']): string {
  switch (riskLevel) {
    case 'low': return 'text-yellow-600 bg-yellow-100';
    case 'medium': return 'text-orange-600 bg-orange-100';
    case 'high': return 'text-red-600 bg-red-100';
    case 'critical': return 'text-red-800 bg-red-200';
    default: return 'text-gray-600 bg-gray-100';
  }
}