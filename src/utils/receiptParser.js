/**
 * Utility for parsing fuel receipts from QR codes, barcodes, or OCR text.
 * Specifically tuned for Romanian fiscal receipts (OMV, Petrom, Rompetrol, MOL, Lukoil, Socar etc.)
 */

export const parseReceiptText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return {
      amount: '',
      liters: '',
      pricePerLiter: '',
      fuelType: null,
      date: new Date().toISOString().slice(0, 10),
      station: '',
      rawText: ''
    };
  }

  const text = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const upperText = text.toUpperCase();

  let detectedAmount = null;
  let detectedLiters = null;
  let detectedPricePerLiter = null;
  let detectedFuelType = null;
  let detectedDate = null;
  let detectedStation = '';

  // 1. Detect Gas Station brand
  if (upperText.includes('PETROM')) {
    detectedStation = 'Petrom';
  } else if (upperText.includes('OMV')) {
    detectedStation = 'OMV';
  } else if (upperText.includes('ROMPETROL')) {
    detectedStation = 'Rompetrol';
  } else if (upperText.includes('MOL')) {
    detectedStation = 'MOL';
  } else if (upperText.includes('LUKOIL')) {
    detectedStation = 'Lukoil';
  } else if (upperText.includes('SOCAR')) {
    detectedStation = 'Socar';
  } else if (upperText.includes('GAZPROM')) {
    detectedStation = 'Gazprom';
  }

  // 2. Detect Fuel Type
  if (
    upperText.includes('BENZINA') || 
    upperText.includes('BENZ.') || 
    upperText.includes('COR 95') || 
    upperText.includes('COR 98') || 
    upperText.includes('COR 100') ||
    upperText.includes('EXTRA 99') ||
    upperText.includes('MAXMOTION 95') ||
    upperText.includes('MAXMOTION 100') ||
    upperText.includes('EVO PLUS 95') ||
    upperText.includes('EVO 95')
  ) {
    detectedFuelType = 'petrol';
  } else if (
    upperText.includes('MOTORINA') || 
    upperText.includes('MOT.') || 
    upperText.includes('DIESEL') || 
    upperText.includes('EURO DIESEL') || 
    upperText.includes('EVO DIESEL') ||
    upperText.includes('MAXMOTION DIESEL') ||
    upperText.includes('EXTRA DIESEL')
  ) {
    detectedFuelType = 'diesel';
  } else if (
    upperText.includes('GPL') || 
    upperText.includes('AUTOGAS') || 
    upperText.includes('LPG')
  ) {
    detectedFuelType = 'gpl';
  }

  // 3. Detect Date (DD.MM.YYYY, DD-MM-YYYY, DD/MM/YYYY or YYYY-MM-DD)
  const dateRegexPatterns = [
    /(?:DATA|DATE|DAT)[:\s]*([0-3]?[0-9][./-][0-1]?[0-9][./-]20[2-3][0-9])/i,
    /([0-3]?[0-9][./-][0-1]?[0-9][./-]20[2-3][0-9])/,
    /(20[2-3][0-9][./-][0-1]?[0-9][./-][0-3]?[0-9])/
  ];

  for (const pattern of dateRegexPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const rawDate = match[1].replace(/[/]/g, '.').replace(/[-]/g, '.');
      const parts = rawDate.split('.');
      if (parts.length === 3) {
        if (parts[0].length === 4) {
          // YYYY.MM.DD
          detectedDate = `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
        } else {
          // DD.MM.YYYY
          detectedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
        break;
      }
    }
  }

  // If no date found or invalid, default to today
  if (!detectedDate || !/^\d{4}-\d{2}-\d{2}$/.test(detectedDate)) {
    detectedDate = new Date().toISOString().slice(0, 10);
  }

  // Detect Time if present: e.g. "ORA: 14:35", "14:35:20", "14:35"
  let detectedTime = null;
  const timeRegexPatterns = [
    /(?:ORA|TIME|H|OR[AĂ])[:\s]*([0-2]?[0-9]:[0-5][0-9](?::[0-5][0-9])?)/i,
    /\b([0-2][0-9]:[0-5][0-9](?::[0-5][0-9])?)\b/
  ];
  for (const tPattern of timeRegexPatterns) {
    const tMatch = text.match(tPattern);
    if (tMatch && tMatch[1]) {
      const tVal = tMatch[1].slice(0, 5);
      const [h, m] = tVal.split(':').map(Number);
      if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        detectedTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        break;
      }
    }
  }

  // 4. Detect Quantity / Liters and Unit Price
  // Patterns like: "35.500 L", "35.50 L", "35.500 X 7.25", "35,50 LTR"
  const lines = text.split('\n');
  for (const line of lines) {
    const normLine = line.replace(/,/g, '.');

    // Look for: [liters] X [price] = [total] e.g. "42.150 X 7.35"
    const multiplyMatch = normLine.match(/([0-9]{1,3}\.[0-9]{1,3})\s*(?:X|\*)\s*([0-9]{1,2}\.[0-9]{2})/i);
    if (multiplyMatch) {
      const val1 = parseFloat(multiplyMatch[1]);
      const val2 = parseFloat(multiplyMatch[2]);
      // Usually liters are between 5 and 120, price is between 5 and 10 RON/L
      if (val1 >= 3 && val1 <= 150 && val2 >= 3 && val2 <= 15) {
        detectedLiters = val1;
        detectedPricePerLiter = val2;
      } else if (val2 >= 3 && val2 <= 150 && val1 >= 3 && val1 <= 15) {
        detectedLiters = val2;
        detectedPricePerLiter = val1;
      }
    }

    // Look for explicitly labeled liters: "42.50 L", "42.50 LTR", "CANT: 42.50"
    if (!detectedLiters) {
      const litersMatch = normLine.match(/(?:CANT|CANTITATE|Q|VOLUM)?[:\s]*([0-9]{1,3}\.[0-9]{1,3})\s*(?:L|LT|LTR|LITRI)(?:\s|$|[^A-Z])/i);
      if (litersMatch && litersMatch[1]) {
        const parsedL = parseFloat(litersMatch[1]);
        if (parsedL >= 2 && parsedL <= 150) {
          detectedLiters = parsedL;
        }
      }
    }
  }

  // 5. Detect Total Amount (TOTAL LEI, TOTAL, SUMA, CARD, NUMERAR)
  const totalKeywords = [
    /(?:TOTAL\s*LEI|TOTAL\s*DE\s*PLATA|TOTAL\s*GENERAL|TOTAL)[:\s]*([0-9]{1,4}[.,][0-9]{2})/i,
    /(?:CARD|NUMERAR|REST|SUMA)[:\s]*([0-9]{1,4}[.,][0-9]{2})/i,
    /(?:LEI|RON)[:\s]*([0-9]{1,4}[.,][0-9]{2})/i
  ];

  for (const regex of totalKeywords) {
    const match = text.match(regex);
    if (match && match[1]) {
      const num = parseFloat(match[1].replace(',', '.'));
      if (num >= 5 && num <= 3000) {
        detectedAmount = num;
        break;
      }
    }
  }

  // If no labeled total found, look for largest reasonable amount on lines near the end
  if (!detectedAmount) {
    const allAmounts = [];
    const amountMatches = text.matchAll(/([0-9]{2,4}[.,][0-9]{2})/g);
    for (const m of amountMatches) {
      const val = parseFloat(m[1].replace(',', '.'));
      if (val >= 20 && val <= 2000) {
        allAmounts.push(val);
      }
    }
    if (allAmounts.length > 0) {
      // Pick the highest value which is typically the TOTAL
      detectedAmount = Math.max(...allAmounts);
    }
  }

  // 6. Deduce missing values if possible
  if (detectedAmount && detectedLiters && !detectedPricePerLiter && detectedLiters > 0) {
    detectedPricePerLiter = Number((detectedAmount / detectedLiters).toFixed(2));
  } else if (detectedAmount && detectedPricePerLiter && !detectedLiters && detectedPricePerLiter > 0) {
    detectedLiters = Number((detectedAmount / detectedPricePerLiter).toFixed(2));
  } else if (detectedLiters && detectedPricePerLiter && !detectedAmount) {
    detectedAmount = Number((detectedLiters * detectedPricePerLiter).toFixed(2));
  }

  return {
    amount: detectedAmount ? detectedAmount.toString() : '',
    liters: detectedLiters ? detectedLiters.toString() : '',
    pricePerLiter: detectedPricePerLiter ? detectedPricePerLiter.toString() : '',
    fuelType: detectedFuelType, // 'petrol', 'diesel', 'gpl' or null
    date: detectedDate,
    time: detectedTime,
    station: detectedStation,
    rawText: text
  };
};

/**
 * Handle URL / query parameters commonly found in QR codes from fiscal cash registers or apps
 */
export const parseReceiptPayload = (payload) => {
  if (!payload || typeof payload !== 'string') {
    return parseReceiptText('');
  }

  const trimmed = payload.trim();

  // If it's a URL or query string with params like ?tot=250.5&dat=...
  if (trimmed.includes('?') || trimmed.includes('&') || trimmed.includes('=')) {
    try {
      const queryString = trimmed.includes('?') ? trimmed.split('?')[1] : trimmed;
      const params = new URLSearchParams(queryString);

      let tot = params.get('tot') || params.get('total') || params.get('suma') || params.get('valoare') || params.get('t');
      let dat = params.get('dat') || params.get('date') || params.get('d');
      let lit = params.get('lit') || params.get('litri') || params.get('cant') || params.get('q');
      let car = params.get('carburant') || params.get('fuel') || params.get('prod');

      if (tot || dat) {
        const textPayload = `TOTAL: ${tot || ''} DATA: ${dat || ''} CANTITATE: ${lit || ''} PRODUS: ${car || ''} \n${trimmed}`;
        return parseReceiptText(textPayload);
      }
    } catch (e) {
      // ignore
    }
  }

  return parseReceiptText(trimmed);
};
