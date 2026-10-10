import jsPDF from 'jspdf';
import autoTable, { applyPlugin } from 'jspdf-autotable';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

// Safely register autoTable plugin on jsPDF if available
try {
  if (typeof applyPlugin === 'function') {
    applyPlugin(jsPDF);
  } else if (autoTable && typeof autoTable.applyPlugin === 'function') {
    autoTable.applyPlugin(jsPDF);
  }
} catch (_) {}

export const sanitizeForPdf = (text) => {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/[ăâ]/g, 'a')
    .replace(/[ĂÂ]/g, 'A')
    .replace(/[î]/g, 'i')
    .replace(/[Î]/g, 'I')
    .replace(/[șş]/g, 's')
    .replace(/[ȘŞ]/g, 'S')
    .replace(/[țţ]/g, 't')
    .replace(/[ȚŢ]/g, 'T');
};

const formatDateSafe = (startDate, endDate) => {
  if (!startDate) return '-';
  if (!endDate || startDate === endDate) {
    const parts = String(startDate).split('-');
    return parts.length === 3 ? `${parts[2]}.${parts[1]}.${parts[0]}` : String(startDate);
  }
  const sParts = String(startDate).split('-');
  const eParts = String(endDate).split('-');
  if (sParts.length === 3 && eParts.length === 3) {
    const [sY, sM, sD] = sParts;
    const [eY, eM, eD] = eParts;
    if (sY === eY && sM === eM) {
      return `${sD}-${eD}.${sM}.${sY}`;
    }
    return `${sD}.${sM}-${eD}.${eM}.${eY}`;
  }
  return `${startDate} - ${endDate}`;
};

export const generateWeekendTripsPDF = ({
  personalTrips = [],
  vehicles = [],
  selectedVehicle = null,
  tripsAdvance = 0,
  filterStatus = 'all'
}) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const advanceNum = Math.max(0, Number(tripsAdvance) || 0);

  // Filter trips if needed
  let tripsToExport = Array.isArray(personalTrips) ? [...personalTrips] : [];
  if (selectedVehicle && selectedVehicle.id) {
    tripsToExport = tripsToExport.filter(t => t && t.vehicleId === selectedVehicle.id);
  }
  if (filterStatus === 'unpaid') {
    tripsToExport = tripsToExport.filter(t => t && !t.isPaid);
  } else if (filterStatus === 'paid') {
    tripsToExport = tripsToExport.filter(t => t && t.isPaid);
  }

  // Calculate totals
  const totalKm = tripsToExport.reduce((sum, t) => sum + (Number(t?.kmDriven) || 0), 0);
  const totalLiters = Number(tripsToExport.reduce((sum, t) => sum + (Number(t?.litersUsed) || 0), 0).toFixed(2));
  const totalCost = Number(tripsToExport.reduce((sum, t) => sum + (Number(t?.tripCost) || 0), 0).toFixed(2));

  const unpaidTrips = tripsToExport.filter(t => t && !t.isPaid);
  const unpaidCost = Number(unpaidTrips.reduce((sum, t) => sum + (Number(t?.tripCost) || 0), 0).toFixed(2));
  const netUnpaidCost = Number((unpaidCost - advanceNum).toFixed(2));

  const paidTrips = tripsToExport.filter(t => t && t.isPaid);
  const paidCost = Number(paidTrips.reduce((sum, t) => sum + (Number(t?.tripCost) || 0), 0).toFixed(2));

  const vehicleLabel = selectedVehicle 
    ? `${selectedVehicle.plate || 'Auto'} (${selectedVehicle.makeModel || 'Vehicul'})` 
    : 'Toate Vehiculele din Flota';

  const filterLabel = filterStatus === 'unpaid' 
    ? 'Doar Curse Neachitate' 
    : filterStatus === 'paid' 
    ? 'Doar Curse Achitate' 
    : 'Toate Cursele (Achitate & Neachitate)';

  const now = new Date();
  const dateStr = now.toLocaleDateString('ro-RO');
  const timeStr = now.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' });

  // 1. Header background bar
  doc.setFillColor(88, 28, 135); // Dark Purple
  doc.rect(14, 10, 269, 18, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizeForPdf('CARSAPP - RAPORT DECONT CURSE WEEKEND & CONSUM PERSONAL'), 20, 21);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeForPdf(`Generat: ${dateStr} ${timeStr}`), 220, 21);

  // 2. Info / Meta Sub-header
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizeForPdf(`Vehicul: ${vehicleLabel}`), 14, 34);
  doc.setFont('helvetica', 'normal');
  doc.text(sanitizeForPdf(`Filtru aplicat: ${filterLabel} | Total curse in raport: ${tripsToExport.length}`), 14, 39);

  // 3. Financial Summary KPI Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 43, 269, 23, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeForPdf('DISTANTA & CONSUM'), 20, 48);
  doc.text(sanitizeForPdf('COST TOTAL CURSE'), 75, 48);
  doc.text(sanitizeForPdf('DEJA ACHITAT'), 130, 48);
  doc.text(sanitizeForPdf('SOLD / AVANS (PLATA IN PLUS)'), 180, 48);
  doc.text(sanitizeForPdf('NET RAMAS DE ACHITAT'), 235, 48);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(sanitizeForPdf(`${totalKm.toLocaleString('ro-RO')} km | ${totalLiters.toFixed(1)} L`), 20, 56);
  doc.text(sanitizeForPdf(`${totalCost.toFixed(2)} lei`), 75, 56);

  // Deja achitat
  doc.setTextColor(22, 101, 52); // Green
  doc.text(sanitizeForPdf(`${paidCost.toFixed(2)} lei (${paidTrips.length})`), 130, 56);

  // Sold / Avans
  if (advanceNum > 0) {
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(sanitizeForPdf(`+${advanceNum.toFixed(2)} lei`), 180, 56);
  } else {
    doc.setTextColor(100, 116, 139);
    doc.text(sanitizeForPdf('0.00 lei'), 180, 56);
  }

  // Net rămas de achitat
  if (netUnpaidCost < 0) {
    doc.setTextColor(16, 185, 129); // Credit excedent
    doc.text(sanitizeForPdf(`${netUnpaidCost.toFixed(2)} lei (Credit)`), 235, 56);
  } else if (netUnpaidCost === 0) {
    doc.setTextColor(22, 101, 52); // All settled
    doc.text(sanitizeForPdf('0.00 lei (Achitat)'), 235, 56);
  } else {
    doc.setTextColor(180, 83, 9); // Amber
    doc.text(sanitizeForPdf(`${netUnpaidCost.toFixed(2)} lei`), 235, 56);
  }

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(sanitizeForPdf(`Cost brut neachitat: ${unpaidCost.toFixed(2)} lei (${unpaidTrips.length} curse)`), 20, 62);
  if (advanceNum > 0) {
    doc.text(sanitizeForPdf(`Fond avans aplicat: -${advanceNum.toFixed(2)} lei scazut automat din datorie`), 180, 62);
  }

  // 4. Detailed Table
  const tableData = tripsToExport.map((trip, idx) => {
    if (!trip) return [];
    const veh = (vehicles || []).find(v => v && v.id === trip.vehicleId);
    const vPlate = veh ? veh.plate : (trip.vehicleId || '-');
    const dateRange = formatDateSafe(trip.startDate, trip.endDate);
    
    let startKm = '-';
    if (trip.startKm !== undefined && trip.startKm !== null && !isNaN(Number(trip.startKm))) {
      startKm = Number(trip.startKm).toLocaleString('ro-RO');
    }
    
    let endKm = '-';
    if (trip.endKm !== undefined && trip.endKm !== null && !isNaN(Number(trip.endKm))) {
      endKm = Number(trip.endKm).toLocaleString('ro-RO');
    }
    
    let kmDriven = '-';
    if (trip.kmDriven !== undefined && trip.kmDriven !== null && !isNaN(Number(trip.kmDriven))) {
      kmDriven = Number(trip.kmDriven).toLocaleString('ro-RO');
    }
    
    let liters = '-';
    if (trip.litersUsed !== undefined && trip.litersUsed !== null && !isNaN(Number(trip.litersUsed))) {
      liters = Number(trip.litersUsed).toFixed(2);
    }
    
    let price = '-';
    const rawPrice = trip.fuelPrice || trip.pricePerLiter || trip.fuelPriceAtTime;
    if (rawPrice !== undefined && rawPrice !== null && !isNaN(Number(rawPrice)) && Number(rawPrice) > 0) {
      price = Number(rawPrice).toFixed(2);
    } else if (Number(trip.tripCost) > 0 && Number(trip.litersUsed) > 0) {
      price = (Number(trip.tripCost) / Number(trip.litersUsed)).toFixed(2);
    }
    
    let cost = '0.00 lei';
    if (trip.tripCost !== undefined && trip.tripCost !== null && !isNaN(Number(trip.tripCost))) {
      cost = `${Number(trip.tripCost).toFixed(2)} lei`;
    }
    
    let status = 'DE ACHITAT';
    if (!trip.endKm || trip.isOngoing) {
      status = 'IN CURS';
    } else if (trip.isPaid) {
      status = 'ACHITAT';
    }

    const titleNote = [trip.title, trip.notes].filter(Boolean).join(' - ') || 'Cursa personala weekend';

    return [
      idx + 1,
      sanitizeForPdf(dateRange),
      sanitizeForPdf(vPlate),
      sanitizeForPdf(titleNote),
      startKm,
      endKm,
      kmDriven,
      liters,
      price,
      cost,
      sanitizeForPdf(status)
    ];
  });

  // Call autoTable safely
  const runAutoTable = (targetDoc, options) => {
    if (typeof autoTable === 'function') {
      return autoTable(targetDoc, options);
    }
    if (autoTable && typeof autoTable.default === 'function') {
      return autoTable.default(targetDoc, options);
    }
    if (typeof targetDoc.autoTable === 'function') {
      return targetDoc.autoTable(options);
    }
    throw new Error('Modulul de generare tabel PDF (autoTable) nu a putut fi initializat.');
  };

  runAutoTable(doc, {
    startY: 70,
    head: [[
      '#',
      'Data Cursa',
      'Vehicul',
      'Titlu / Detalii Cursa',
      'Km Start',
      'Km Stop',
      'Km',
      'Litri',
      'Pret/L',
      'Cost Cursa',
      'Status'
    ]],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [88, 28, 135],
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 41, 59]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'center', cellWidth: 24 },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'left', cellWidth: 'auto' },
      4: { halign: 'right', cellWidth: 18 },
      5: { halign: 'right', cellWidth: 18 },
      6: { halign: 'right', cellWidth: 14, fontStyle: 'bold' },
      7: { halign: 'right', cellWidth: 14 },
      8: { halign: 'right', cellWidth: 14 },
      9: { halign: 'right', cellWidth: 20, fontStyle: 'bold' },
      10: { halign: 'center', cellWidth: 22, fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 10) {
        const val = data.cell.raw;
        if (val === 'ACHITAT') {
          data.cell.styles.textColor = [22, 101, 52]; // Green
        } else if (val === 'IN CURS') {
          data.cell.styles.textColor = [194, 65, 12]; // Orange
        } else {
          data.cell.styles.textColor = [180, 83, 9]; // Amber
        }
      }
    },
    didDrawPage: () => {
      // Footer
      try {
        const pageCount = doc.internal.getNumberOfPages();
        const currentPage = doc.internal.getCurrentPageInfo ? doc.internal.getCurrentPageInfo().pageNumber : 1;
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          sanitizeForPdf(`CarsApp • Pagina ${currentPage} din ${pageCount} • Decont personal`),
          14,
          202
        );
      } catch (_) {}
    },
    margin: { left: 14, right: 14, bottom: 12 }
  });

  return doc;
};

export const exportWeekendTripsPDF = async ({
  personalTrips = [],
  vehicles = [],
  selectedVehicle = null,
  tripsAdvance = 0,
  filterStatus = 'all',
  target = 'whatsapp' // 'whatsapp' | 'share' | 'download'
}) => {
  const doc = generateWeekendTripsPDF({
    personalTrips,
    vehicles,
    selectedVehicle,
    tripsAdvance,
    filterStatus
  });

  const vehSlug = selectedVehicle && selectedVehicle.plate 
    ? String(selectedVehicle.plate).replace(/[^a-zA-Z0-9]/g, '_') 
    : 'Flota';
  const dateSlug = new Date().toISOString().slice(0, 10);
  const fileName = `Raport_Curse_Weekend_${vehSlug}_${dateSlug}.pdf`;
  const vehicleLabel = selectedVehicle ? selectedVehicle.plate : 'Flota';

  // Native Android Platform (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      // Always write to Cache directory so it's shareable via FileProvider
      const writeResult = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache,
        recursive: true
      });

      if (target === 'download') {
        // Also save to Documents directory for permanent local storage
        try {
          await Filesystem.writeFile({
            path: fileName,
            data: pdfBase64,
            directory: Directory.Documents,
            recursive: true
          });
        } catch (docErr) {
          console.warn("Could not save to Documents directory:", docErr);
        }

        try {
          await Share.share({
            title: "Raport PDF CarsApp",
            text: `Raport Curse Weekend (${fileName})`,
            url: writeResult.uri,
            dialogTitle: "Deschide sau Salvează Fișier PDF"
          });
        } catch (shareErr) {
          const msg = String(shareErr?.message || shareErr);
          if (!msg.toLowerCase().includes('cancel')) {
            console.warn("Share dialog status:", shareErr);
          }
        }
        return { success: true, method: 'download', fileName };
      }

      // target === 'whatsapp' or 'share'
      try {
        await Share.share({
          title: "Raport Curse Weekend CarsApp",
          text: `Raport Curse Weekend CarsApp (${vehicleLabel}) - ${dateSlug}`,
          url: writeResult.uri,
          dialogTitle: "Trimite Raport PDF (WhatsApp, Salvare, etc.)"
        });
      } catch (shareErr) {
        const msg = String(shareErr?.message || shareErr);
        if (!msg.toLowerCase().includes('cancel')) {
          console.warn("Share dialog status:", shareErr);
        }
      }
      return { success: true, method: 'share', fileName };
    } catch (err) {
      console.error("Eroare la scriere/partajare PDF nativ:", err);
      throw err;
    }
  }

  // Web Browser Platform (fallback)
  if (target === 'whatsapp') {
    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
    
    // Check if Web Share API supports file sharing (e.g. mobile Chrome)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Raport Curse Weekend CarsApp",
          text: `Raport Curse Weekend CarsApp (${vehicleLabel})`
        });
        return { success: true, method: 'web-share', fileName };
      } catch (err) {
        if (err.name !== 'AbortError') console.warn(err);
      }
    }

    // Fallback on desktop web: Download file and open WhatsApp Web link
    doc.save(fileName);
    const advanceInfo = tripsAdvance > 0 ? `\nSold/Avans curent: +${tripsAdvance} lei` : '';
    const summaryMsg = encodeURIComponent(
      `Raport Curse Weekend CarsApp (${vehicleLabel})\n` +
      `Fișierul PDF (${fileName}) a fost descărcat pe dispozitiv.${advanceInfo}`
    );
    window.open(`https://api.whatsapp.com/send?text=${summaryMsg}`, '_blank');
    return { success: true, method: 'whatsapp-web', fileName };
  }

  // Standard Download
  doc.save(fileName);
  return { success: true, method: 'browser-download', fileName };
};
