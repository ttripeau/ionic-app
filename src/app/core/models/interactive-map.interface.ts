import { LatLng } from 'leaflet';

export interface InteractiveMap {
  [key: string]: {
    id: number;
    type: 'polygon' | 'circle' | 'marker';
    coordinates?: LatLng[];
    radius?: number;
    latlng?: LatLng;
    defaultColor: string;
    color: string;
    numeroStand: string;
    category: 'exposant' | 'salle';
    exhibitor: {
      id: number;
      logo: string;
      name: string;
      presentation: string;
    };
  }[];
}
/**
 *
 * category: "exposant"
color: "#f56523"
coordinates: (4) [Array(2), Array(2), Array(2), Array(2)]
defaultColor: "transparent"
exhibitor:
id: 71
logo: "/assets/img/entities/downtown-europe.png"
name: "Downtown Europe"
presentation: null
[[Prototype]]: Object
level: "0"
type: "polygon
 *
 */
export interface LeveledMarkers extends L.Marker {
  mapId?: number;
  id?: number;
  type: 'marker';
  latlng?: L.LatLng;
  defaultColor?: string;
  color?: string;
  numeroStand?: string;
  category?: 'exposant' | 'salle';
  exhibitor?: {
    id?: number;
    logo?: string;
    name?: string;
    presentation?: string;
  };
}

export interface LeveledCircles extends L.Circle {
  mapId?: number;
  id?: number;
  type: 'circle';
  radius?: number;
  latlng?: L.LatLng;
  defaultColor?: string;
  color?: string;
  numeroStand?: string;
  category?: 'exposant' | 'salle';
  exhibitor?: {
    id?: number;
    logo?: string;
    name?: string;
    presentation?: string;
  };
}
export interface LeveledPolygons extends L.Polygon {
  mapId?: number;
  id?: number;
  type: 'polygon';
  coordinates?: L.LatLng[];
  defaultColor?: string;
  color?: string;
  numeroStand?: string;
  category?: 'exposant' | 'salle';
  exhibitor?: {
    id?: number;
    logo?: string;
    name?: string;
    presentation?: string;
  };
}
