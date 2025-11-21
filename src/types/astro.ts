export type BirthDataProfilePayload = {
  source: 'profile';
};

export type BirthDataFormPayload = {
  source: 'form';
  birth_date: string;
  birth_time: string;
  city: string;
  country: string;
  first_name?: string;
  last_name?: string;
};

export type BirthDataPayload = BirthDataProfilePayload | BirthDataFormPayload;

export type PlanetPosition = {
  lon: number;
  sign?: string;
  speed?: number;
};

export type HousePosition = {
  cusp_lon: number;
  sign?: string;
};

export type NatalChart = {
  planets: Record<string, PlanetPosition>;
  houses: Record<string, HousePosition>;
  aspects: Array<Record<string, unknown>>;
  calculated_at?: string;
};
