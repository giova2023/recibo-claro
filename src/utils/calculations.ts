import { Appliance, TariffConfig } from '../types';

export interface ConsumptionResult {
  dailyKwh: number;
  monthlyKwh: number;
  bimonthlyKwh: number;
  monthlySubtotal: number;
  fixedCharge: number;
  taxes: number;
  monthlyTotal: number;
  co2KgMonthly: number;
  breakdown: Array<{
    appliance: Appliance;
    dailyKwh: number;
    monthlyKwh: number;
    monthlyCost: number;
    percentageOfTotal: number;
  }>;
}

export function calculateApplianceKwh(appliance: Appliance): { dailyKwh: number; monthlyKwh: number } {
  // Watts * quantity * hoursPerDay / 1000 = daily kWh
  const dailyKwh = (appliance.powerWatts * appliance.quantity * Math.min(24, Math.max(0, appliance.hoursPerDay))) / 1000;
  // monthly kWh takes daysPerMonth into account
  const days = Math.min(31, Math.max(1, appliance.daysPerMonth || 30));
  const monthlyKwh = dailyKwh * (days / 30) * 30; // standard 30 day basis
  return { dailyKwh, monthlyKwh };
}

export function calculateTotalConsumption(appliances: Appliance[], tariff: TariffConfig): ConsumptionResult {
  let totalDailyKwh = 0;
  let totalMonthlyKwh = 0;

  const rawBreakdown = appliances.map((app) => {
    const { dailyKwh, monthlyKwh } = calculateApplianceKwh(app);
    totalDailyKwh += dailyKwh;
    totalMonthlyKwh += monthlyKwh;
    return {
      appliance: app,
      dailyKwh,
      monthlyKwh,
      monthlyCost: 0,
      percentageOfTotal: 0,
    };
  });

  // Calculate costs based on tariff
  let energyCharge = 0;
  if (tariff.isTiered) {
    if (totalMonthlyKwh <= tariff.tier1LimitKwh) {
      energyCharge = totalMonthlyKwh * tariff.tier1Price;
    } else if (totalMonthlyKwh <= tariff.tier2LimitKwh) {
      energyCharge = (tariff.tier1LimitKwh * tariff.tier1Price) + ((totalMonthlyKwh - tariff.tier1LimitKwh) * tariff.tier2Price);
    } else {
      energyCharge =
        (tariff.tier1LimitKwh * tariff.tier1Price) +
        ((tariff.tier2LimitKwh - tariff.tier1LimitKwh) * tariff.tier2Price) +
        ((totalMonthlyKwh - tariff.tier2LimitKwh) * tariff.tier3Price);
    }
  } else {
    energyCharge = totalMonthlyKwh * tariff.pricePerKwh;
  }

  const effectiveRate = totalMonthlyKwh > 0 ? energyCharge / totalMonthlyKwh : tariff.pricePerKwh;

  const breakdown = rawBreakdown.map((item) => ({
    ...item,
    monthlyCost: item.monthlyKwh * effectiveRate,
    percentageOfTotal: totalMonthlyKwh > 0 ? (item.monthlyKwh / totalMonthlyKwh) * 100 : 0,
  }));

  const subtotal = energyCharge + tariff.fixedCharge;
  const taxes = (subtotal * (tariff.taxPercentage || 0)) / 100;
  const monthlyTotal = subtotal + taxes;

  // Approximate CO2 emissions: ~0.45 kg CO2 per kWh (global average grid factor)
  const co2KgMonthly = totalMonthlyKwh * 0.45;

  return {
    dailyKwh: totalDailyKwh,
    monthlyKwh: totalMonthlyKwh,
    bimonthlyKwh: totalMonthlyKwh * 2,
    monthlySubtotal: subtotal,
    fixedCharge: tariff.fixedCharge,
    taxes,
    monthlyTotal,
    co2KgMonthly,
    breakdown: breakdown.sort((a, b) => b.monthlyKwh - a.monthlyKwh),
  };
}

export function formatCurrency(amount: number, currency: string = '$'): string {
  return `${currency} ${amount.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatNumber(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}
