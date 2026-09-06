// Core calculations for fleet management, consumption, alerts & rankings

// 1. Calculate average fuel consumption using full-to-full method
export const calculateVehicleConsumption = (vehicleRecords) => {
  const fuelings = vehicleRecords
    .filter(r => r.category === 'fuel' && r.km && r.details?.liters)
    .sort((a, b) => a.km - b.km);

  const totalFuelCost = fuelings.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalLiters = fuelings.reduce((sum, f) => sum + (Number(f.details?.liters) || 0), 0);

  if (fuelings.length < 2) {
    return {
      avgLitersPer100Km: null,
      totalLiters: Number(totalLiters.toFixed(1)),
      totalFuelCost,
      overallKm: 0,
      costPerKm: null,
      logsCount: fuelings.length
    };
  }

  const minKm = fuelings[0].km;
  const maxKm = fuelings[fuelings.length - 1].km;
  const overallKm = maxKm - minKm;

  // Prefer full-to-full calculation if fullTank is present
  const fullTanks = fuelings.filter(f => f.details?.fullTank);
  let avgL100 = null;

  if (fullTanks.length >= 2) {
    const minFullKm = fullTanks[0].km;
    const maxFullKm = fullTanks[fullTanks.length - 1].km;
    const fullKmDiff = maxFullKm - minFullKm;
    const intermediateFuelings = fuelings.filter(f => f.km > minFullKm && f.km <= maxFullKm);
    const consumedLiters = intermediateFuelings.reduce((sum, f) => sum + (Number(f.details?.liters) || 0), 0);

    if (fullKmDiff > 0 && consumedLiters > 0) {
      avgL100 = Number(((consumedLiters / fullKmDiff) * 100).toFixed(2));
    }
  }

  // If full tank calculation wasn't possible but we have overallKm and total liters
  if (avgL100 === null && overallKm > 0 && totalLiters > 0) {
    avgL100 = Number(((totalLiters / overallKm) * 100).toFixed(2));
  }

  let costPerKm = null;
  if (overallKm > 0 && totalFuelCost > 0) {
    costPerKm = Number((totalFuelCost / overallKm).toFixed(2));
  }

  // Automatic Bi-Fuel (GPL + Benzină) detection and metrics
  const gplFuelings = fuelings.filter(f => f.details?.fuelType === 'gpl');
  const petrolFuelings = fuelings.filter(f => f.details?.fuelType === 'petrol');
  const isBiFuel = gplFuelings.length > 0 && petrolFuelings.length > 0;

  let gplLiters = 0;
  let gplCost = 0;
  let petrolLiters = 0;
  let petrolCost = 0;
  let gplAvgL100 = null;
  let petrolAvgL100 = null;
  let gplCostPerKm = null;
  let petrolCostPerKm = null;

  if (isBiFuel) {
    gplLiters = Number(gplFuelings.reduce((sum, f) => sum + (Number(f.details?.liters) || 0), 0).toFixed(1));
    gplCost = gplFuelings.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
    petrolLiters = Number(petrolFuelings.reduce((sum, f) => sum + (Number(f.details?.liters) || 0), 0).toFixed(1));
    petrolCost = petrolFuelings.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

    if (overallKm > 0) {
      gplAvgL100 = Number(((gplLiters / overallKm) * 100).toFixed(2));
      petrolAvgL100 = Number(((petrolLiters / overallKm) * 100).toFixed(2));
      gplCostPerKm = Number((gplCost / overallKm).toFixed(2));
      petrolCostPerKm = Number((petrolCost / overallKm).toFixed(2));
    }
  }

  return {
    avgLitersPer100Km: avgL100,
    totalLiters: Number(totalLiters.toFixed(1)),
    totalFuelCost,
    overallKm,
    costPerKm,
    logsCount: fuelings.length,
    isBiFuel,
    gplLiters,
    gplCost,
    petrolLiters,
    petrolCost,
    gplAvgL100,
    petrolAvgL100,
    gplCostPerKm,
    petrolCostPerKm
  };
};

// Calculate fleet-wide consumption without mixing odometers of different cars
export const calculateFleetConsumption = (vehicles, records) => {
  const vehicleStats = vehicles.map(v => {
    const vRecords = records.filter(r => r.vehicleId === v.id);
    return calculateVehicleConsumption(vRecords);
  }).filter(s => s.avgLitersPer100Km !== null);

  if (vehicleStats.length === 0) {
    return {
      avgLitersPer100Km: null,
      costPerKm: null
    };
  }

  const avgL100 = Number((vehicleStats.reduce((sum, s) => sum + s.avgLitersPer100Km, 0) / vehicleStats.length).toFixed(2));
  const validCostPerKm = vehicleStats.filter(s => s.costPerKm !== null);
  const avgCostPerKm = validCostPerKm.length > 0
    ? Number((validCostPerKm.reduce((sum, s) => sum + s.costPerKm, 0) / validCostPerKm.length).toFixed(2))
    : null;

  return {
    avgLitersPer100Km: avgL100,
    costPerKm: avgCostPerKm
  };
};

// Helper to accurately calculate whole days remaining between target date and today
export const getDaysRemaining = (targetDateStr, referenceDate = new Date()) => {
  if (!targetDateStr) return null;
  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);
  const ref = new Date(referenceDate);
  ref.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - ref.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

// 2. Scan vehicle for expiration alerts (Date-based & Km-based)
export const getVehicleAlerts = (vehicle, referenceDate = new Date()) => {
  const alerts = [];

  const checkDateAlert = (field, labelRo, labelEn, categoryKey, isRovinieta = false) => {
    if (!vehicle[field]) return;
    const diffDays = getDaysRemaining(vehicle[field], referenceDate);
    if (diffDays === null) return;

    let categoryBadgeRo = labelRo;
    if (categoryKey === 'rca') categoryBadgeRo = 'Asigurare RCA';
    if (categoryKey === 'itp') categoryBadgeRo = 'Inspecție ITP';
    if (categoryKey === 'rovinieta') categoryBadgeRo = 'Rovinietă';
    if (categoryKey === 'casco') categoryBadgeRo = 'Asigurare CASCO';
    if (categoryKey === 'service') categoryBadgeRo = 'Revizie & Ulei';
    if (categoryKey === 'tires') categoryBadgeRo = 'Anvelope & Roți';

    if (diffDays < 0) {
      alerts.push({
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        type: field,
        categoryKey,
        categoryBadgeRo,
        dueDate: vehicle[field],
        severity: 'critical', // Expired
        titleRo: `${labelRo} expirată!`,
        titleEn: `${labelEn} expired!`,
        detailRo: `Expirat de ${Math.abs(diffDays)} zile (${vehicle[field]})`,
        detailEn: `Expired ${Math.abs(diffDays)} days ago (${vehicle[field]})`,
        daysLeft: diffDays
      });
    } else if (diffDays <= 7) {
      alerts.push({
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        type: field,
        categoryKey,
        categoryBadgeRo,
        dueDate: vehicle[field],
        severity: 'critical', // Urgent: <= 7 days
        titleRo: `${labelRo} expiră în curând!`,
        titleEn: `${labelEn} expires soon!`,
        detailRo: diffDays === 0 ? "Expiră astăzi!" : `Mai sunt doar ${diffDays} zile (${vehicle[field]})`,
        detailEn: diffDays === 0 ? "Expires today!" : `Only ${diffDays} days left (${vehicle[field]})`,
        daysLeft: diffDays
      });
    } else if (diffDays <= 30) {
      alerts.push({
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        type: field,
        categoryKey,
        categoryBadgeRo,
        dueDate: vehicle[field],
        severity: 'warning', // Warning: 8 - 30 days
        titleRo: `${labelRo} scadență apropiată`,
        titleEn: `${labelEn} upcoming due date`,
        detailRo: `${diffDays} zile rămase (${vehicle[field]})`,
        detailEn: `${diffDays} days left (${vehicle[field]})`,
        daysLeft: diffDays
      });
    }
  };

  // Check ITP, RCA, Rovinieta, CASCO
  checkDateAlert('itpExpiry', 'ITP', 'MOT / Technical Inspection', 'itp');
  checkDateAlert('rcaExpiry', 'Asigurare RCA', 'RCA Insurance', 'rca');
  checkDateAlert('rovinietaExpiry', 'Rovinietă', 'Vignette', 'rovinieta', true);
  checkDateAlert('cascoExpiry', 'CASCO', 'CASCO Insurance', 'casco');

  // Check Tires date if set
  if (vehicle.tireChangeDate) {
    checkDateAlert('tireChangeDate', 'Schimb Anvelope', 'Tire Change', 'tires');
  }
  if (vehicle.tireExpiryDate) {
    checkDateAlert('tireExpiryDate', 'Verificare Anvelope', 'Tire Inspection', 'tires');
  }

  // Check Oil / Service by Km & Date
  if (vehicle.nextServiceKm && vehicle.currentKm) {
    const kmLeft = vehicle.nextServiceKm - vehicle.currentKm;
    if (kmLeft <= 0) {
      alerts.push({
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        type: 'serviceKm',
        categoryKey: 'service',
        categoryBadgeRo: 'Revizie & Ulei',
        severity: 'critical',
        titleRo: 'Revizie / Schimb Ulei DEPĂȘIT!',
        titleEn: 'Service / Oil Change OVERDUE!',
        detailRo: `Depășit cu ${Math.abs(kmLeft)} km (Limită: ${vehicle.nextServiceKm} km)`,
        detailEn: `Overdue by ${Math.abs(kmLeft)} km (Limit: ${vehicle.nextServiceKm} km)`,
        kmLeft
      });
    } else if (kmLeft <= 1000) {
      alerts.push({
        vehicleId: vehicle.id,
        plate: vehicle.plate,
        type: 'serviceKm',
        categoryKey: 'service',
        categoryBadgeRo: 'Revizie & Ulei',
        severity: 'warning',
        titleRo: 'Revizie / Schimb Ulei în curând',
        titleEn: 'Service / Oil Change due soon',
        detailRo: `Mai sunt doar ${kmLeft} km până la revizie`,
        detailEn: `Only ${kmLeft} km until scheduled service`,
        kmLeft
      });
    }
  }

  // Check Service by Date
  if (vehicle.nextServiceDate) {
    checkDateAlert('nextServiceDate', 'Revizie Programată', 'Scheduled Service', 'service');
  }

  return alerts;
};

// 3. Calculate cost rankings and percentages across fleet
export const calculateCostRankings = (vehicles, records, filterCategory = 'all', timePeriod = 'all') => {
  // Filter by period if needed
  let filtered = [...records];
  const now = new Date("2026-09-01");

  if (timePeriod === 'thisMonth') {
    const currYearMonth = "2026-08"; // Recent active month in mock data
    filtered = filtered.filter(r => r.date.startsWith("2026-08") || r.date.startsWith("2026-09"));
  } else if (timePeriod === 'last3Months') {
    filtered = filtered.filter(r => {
      const d = new Date(r.date);
      const diffMonths = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      return diffMonths <= 3;
    });
  } else if (timePeriod === 'thisYear') {
    filtered = filtered.filter(r => r.date.startsWith("2026"));
  }

  if (filterCategory !== 'all') {
    filtered = filtered.filter(r => r.category === filterCategory);
  }

  // Aggregate by vehicle
  const vehicleStatsMap = {};
  vehicles.forEach(v => {
    vehicleStatsMap[v.id] = {
      vehicle: v,
      totalCost: 0,
      repairCost: 0,
      fuelCost: 0,
      serviceCost: 0,
      insuranceCost: 0,
      tiresCost: 0,
      otherCost: 0,
      recordsCount: 0
    };
  });

  let grandTotal = 0;
  let grandRepairTotal = 0;

  filtered.forEach(r => {
    const amt = Number(r.amount) || 0;
    grandTotal += amt;
    if (r.category === 'repair') grandRepairTotal += amt;

    if (!vehicleStatsMap[r.vehicleId]) {
      vehicleStatsMap[r.vehicleId] = {
        vehicle: { id: r.vehicleId, plate: "N/A", makeModel: "Vehicul șters" },
        totalCost: 0,
        repairCost: 0,
        fuelCost: 0,
        serviceCost: 0,
        insuranceCost: 0,
        tiresCost: 0,
        otherCost: 0,
        recordsCount: 0
      };
    }

    const stat = vehicleStatsMap[r.vehicleId];
    stat.totalCost += amt;
    stat.recordsCount += 1;

    if (r.category === 'repair') stat.repairCost += amt;
    else if (r.category === 'fuel') stat.fuelCost += amt;
    else if (r.category === 'service') stat.serviceCost += amt;
    else if (r.category === 'insurance') stat.insuranceCost += amt;
    else if (r.category === 'tires') stat.tiresCost += amt;
    else stat.otherCost += amt;
  });

  // Calculate percentages and sort descending
  const rankings = Object.values(vehicleStatsMap)
    .filter(stat => stat.totalCost > 0 || vehicles.some(v => v.id === stat.vehicle.id))
    .map(stat => {
      const percentage = grandTotal > 0 ? Number(((stat.totalCost / grandTotal) * 100).toFixed(1)) : 0;
      const repairPercentage = grandRepairTotal > 0 ? Number(((stat.repairCost / grandRepairTotal) * 100).toFixed(1)) : 0;
      return {
        ...stat,
        percentage,
        repairPercentage
      };
    })
    .sort((a, b) => b.totalCost - a.totalCost);

  // Category breakdown for charts
  const categoryTotals = {
    fuel: 0,
    repair: 0,
    service: 0,
    insurance: 0,
    itp: 0,
    tires: 0,
    fine: 0
  };

  filtered.forEach(r => {
    if (categoryTotals[r.category] !== undefined) {
      categoryTotals[r.category] += Number(r.amount) || 0;
    } else {
      categoryTotals.repair += Number(r.amount) || 0;
    }
  });

  return {
    rankings,
    grandTotal,
    grandRepairTotal,
    categoryTotals,
    filteredRecords: filtered
  };
};
