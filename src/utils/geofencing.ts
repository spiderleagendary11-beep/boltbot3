import { DangerZone, GPSLocation } from '../types';

// Sample danger zones for demonstration
export const DANGER_ZONES: DangerZone[] = [
  {
    id: '1',
    name: 'High Crime Area - Downtown',
    description: 'Area with elevated crime rates, especially at night',
    riskLevel: 'high',
    coordinates: [
      [40.7589, -73.9851],
      [40.7589, -73.9831],
      [40.7569, -73.9831],
      [40.7569, -73.9851],
    ],
    alertMessage: '⚠️ You are entering a high-crime area. Stay alert and consider alternative routes.'
  },
  {
    id: '2',
    name: 'Construction Zone',
    description: 'Active construction site with restricted access',
    riskLevel: 'medium',
    coordinates: [
      [40.7614, -73.9776],
      [40.7614, -73.9756],
      [40.7594, -73.9756],
      [40.7594, -73.9776],
    ],
    alertMessage: '🚧 Construction zone ahead. Use caution and follow posted signs.'
  },
  {
    id: '3',
    name: 'Flood Risk Area',
    description: 'Area prone to flooding during heavy rain',
    riskLevel: 'critical',
    coordinates: [
      [40.7505, -73.9934],
      [40.7505, -73.9914],
      [40.7485, -73.9914],
      [40.7485, -73.9934],
    ],
    alertMessage: '🌊 CRITICAL: Flood risk area. Avoid during severe weather conditions.'
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