export interface AstroProfile {
  id: number;
  sun: string | null;
  moon: string | null;
  ascendant: string | null;
  planets: Record<string, unknown> | null;
  aspects: Record<string, unknown> | null;
  houses: Record<string, unknown> | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MatrixData {
  id: number;
  life_path: string | null;
  traits: string[] | null;
  raw_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface MatrixProfileResponse {
  astro: AstroProfile;
  matrix: MatrixData;
}
