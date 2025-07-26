export interface LatencyLocation {
  lat: number;
  lng: number;
}

export interface LatencyDatum {
  exchange: string;
  location: LatencyLocation;
  cloud: "AWS" | "GCP" | "Azure";
  region: string;
  latency: number;
} 