export interface Appliance {
  id: string;
  name: string;
  category: 'climatizacion' | 'refrigeracion' | 'lineablanca' | 'electronica' | 'iluminacion' | 'cocina' | 'otros';
  powerWatts: number;
  quantity: number;
  hoursPerDay: number;
  daysPerMonth: number;
}

export interface TariffConfig {
  currency: string; // e.g. '$', 'USD', 'Q', 'ARS', 'MXN'
  pricePerKwh: number;
  fixedCharge: number;
  taxPercentage: number;
  isTiered: boolean;
  tier1LimitKwh: number; // e.g. 150 kWh
  tier1Price: number;
  tier2LimitKwh: number; // e.g. 300 kWh
  tier2Price: number;
  tier3Price: number;
}

export interface Scenario {
  name: string;
  appliances: Appliance[];
  tariff: TariffConfig;
  updatedAt: string;
}

export interface UserInterview {
  role: 'Compañero' | 'Adulto del centro' | 'Persona ajena al proyecto';
  name: string;
  age: string;
  whatTheyTried: string;
  whereTheyGotStuck: string;
  verbatimQuote: string;
  improvementImplemented: string;
}

export interface PromptMilestone {
  milestone: 'M0' | 'M1' | 'M2' | 'M3' | 'M4' | 'M5';
  title: string;
  userPrompt: string;
  modelResponseSummary: string;
  commitHash: string;
  commitMessage: string;
  technicalDecision: string;
}
