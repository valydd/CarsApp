import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Camera, 
  QrCode, 
  Barcode, 
  FileText, 
  Check, 
  AlertCircle, 
  Fuel, 
  Sparkles, 
  RefreshCw, 
  Upload, 
  Calendar, 
  DollarSign, 
  Gauge, 
  Layers,
  CheckCircle2,
  ScanLine
} from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { createWorker } from 'tesseract.js';
import { parseReceiptText, parseReceiptPayload } from '../utils/receiptParser';
import { translations } from '../i18n';

export const ReceiptScanModal = ({
  isOpen,
  onClose,
  onApplyData,
  initialFuelType = 'petrol',
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;

  const [activeTab, setActiveTab] = useState('qr'); // 'qr' or 'ocr'
  const [isScanningLive, setIsScanningLive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  
  // OCR processing state
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatusText, setOcrStatusText] = useState('');
  const [manualText, setManualText] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);

  // Extracted Data Preview & Confirmation state
  const [hasScannedData, setHasScannedData] = useState(false);
  const [scannedAmount, setScannedAmount] = useState('');
  const [scannedLiters, setScannedLiters] = useState('');
  const [scannedPricePerLiter, setScannedPricePerLiter] = useState('');
  const [scannedFuelType, setScannedFuelType] = useState(initialFuelType || 'petrol');
  const [scannedDate, setScannedDate] = useState(new Date().toISOString().slice(0, 10));
  const [scannedStation, setScannedStation] = useState('');
  const [rawPayload, setRawPayload] = useState('');

  const html5QrCodeRef = useRef(null);
  const cameraContainerId = 'receipt-reader-viewport';
  const fileInputQrRef = useRef(null);
  const fileInputOcrRef = useRef(null);

  // Stop camera when modal closes or switching tabs
  const stopLiveScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (e) {
        console.warn('Error stopping scanner:', e);
      }
      html5QrCodeRef.current = null;
    }
    setIsScanningLive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopLiveScanner();
      setHasScannedData(false);
      setIsOcrProcessing(false);
      setCameraError('');
    } else {
      setHasScannedData(false);
      setActiveTab('qr');
    }
  }, [isOpen]);

  // Start live QR/Barcode camera when in 'qr' tab and not previewing data
  useEffect(() => {
    if (isOpen && activeTab === 'qr' && !hasScannedData) {
      startLiveScanner();
    } else {
      stopLiveScanner();
    }
    return () => {
      stopLiveScanner();
    };
  }, [isOpen, activeTab, hasScannedData]);

  const handleExtractedResult = (parsed) => {
    stopLiveScanner();
    setScannedAmount(parsed.amount || '');
    setScannedLiters(parsed.liters || '');
    setScannedPricePerLiter(parsed.pricePerLiter || '');
    setScannedFuelType(parsed.fuelType || initialFuelType || 'petrol');
    setScannedDate(parsed.date || new Date().toISOString().slice(0, 10));
    setScannedStation(parsed.station || '');
    setRawPayload(parsed.rawText || '');
    setHasScannedData(true);
  };

  const startLiveScanner = async () => {
    setCameraError('');
    try {
      await stopLiveScanner();

      const qrScanner = new Html5Qrcode(cameraContainerId, {
        formatsToSupport: [
          Html5QrcodeSupportedFormats.QR_CODE,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.DATA_MATRIX
        ],
        verbose: false
      });

      html5QrCodeRef.current = qrScanner;

      const config = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      };

      await qrScanner.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          // Success callback
          const parsed = parseReceiptPayload(decodedText);
          handleExtractedResult(parsed);
        },
        (errorMessage) => {
          // scanning frames
        }
      );

      setIsScanningLive(true);
    } catch (err) {
      console.warn('Camera start error:', err);
      setIsScanningLive(false);
      setCameraError(
        lang === 'en'
          ? 'Camera could not be started. You can upload an image or photo below.'
          : 'Nu s-a putut porni camera live. Poți încărca o imagine sau fotografie mai jos.'
      );
    }
  };

  // Handle uploading code image (QR / Barcode)
  const handleQrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await stopLiveScanner();
      const qrScanner = new Html5Qrcode(cameraContainerId);
      html5QrCodeRef.current = qrScanner;
      const decoded = await qrScanner.scanFile(file, true);
      const parsed = parseReceiptPayload(decoded);
      handleExtractedResult(parsed);
    } catch (err) {
      alert(
        lang === 'en'
          ? 'No valid QR or Barcode detected in the image. Try the "Receipt Photo / OCR" tab.'
          : 'Nu s-a detectat niciun cod QR sau cod de bare în imagine. Încearcă tab-ul „Foto Bon (OCR)”.'
      );
    }
    if (e.target) e.target.value = '';
  };

  // Handle Receipt Photo OCR with Tesseract.js
  const handleOcrImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrProcessing(true);
    setOcrProgress(5);
    setOcrStatusText(lang === 'en' ? 'Preparing OCR engine...' : 'Se inițializează motorul OCR...');

    let worker = null;
    try {
      worker = await createWorker(['ron', 'eng'], 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
            setOcrStatusText(
              lang === 'en' 
                ? `Reading receipt text: ${Math.round(m.progress * 100)}%` 
                : `Se analizează textul bonului: ${Math.round(m.progress * 100)}%`
            );
          } else if (m.status) {
            setOcrStatusText(
              lang === 'en' ? 'Processing image...' : 'Se procesează imaginea bonului...'
            );
          }
        }
      });

      const ret = await worker.recognize(file);
      const text = ret.data.text || '';
      await worker.terminate();

      if (!text.trim()) {
        alert(
          lang === 'en'
            ? 'Could not read any text from the photo. Make sure the receipt is clear and well lit.'
            : 'Nu s-a putut citi textul din fotografie. Asigură-te că bonul este bine luminat și clar.'
        );
        setIsOcrProcessing(false);
        return;
      }

      const parsed = parseReceiptText(text);
      handleExtractedResult(parsed);
    } catch (ocrErr) {
      console.error('OCR Error:', ocrErr);
      if (worker) {
        try { await worker.terminate(); } catch (te) {}
      }
      alert(
        lang === 'en'
          ? 'Error processing photo. You can enter data manually or paste the text.'
          : 'Eroare la procesarea fotografiei. Poți introduce datele manual sau lipi textul.'
      );
    } finally {
      setIsOcrProcessing(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleManualTextSubmit = () => {
    if (!manualText.trim()) return;
    const parsed = parseReceiptText(manualText);
    handleExtractedResult(parsed);
  };

  const handleConfirmAndApply = () => {
    if (!scannedAmount && !scannedLiters) {
      alert(
        lang === 'en'
          ? 'Please enter at least the total amount or liters before applying.'
          : 'Te rugăm să introduci cel puțin suma totală sau numărul de litri.'
      );
      return;
    }

    onApplyData({
      amount: scannedAmount,
      liters: scannedLiters,
      pricePerLiter: scannedPricePerLiter || (scannedAmount && scannedLiters ? (Number(scannedAmount) / Number(scannedLiters)).toFixed(2) : ''),
      fuelType: scannedFuelType,
      date: scannedDate,
      station: scannedStation,
      rawText: rawPayload
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <ScanLine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{lang === 'en' ? 'Scan Fuel Receipt' : 'Scanare Bon Carburant'}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'en' ? 'QR Code, Barcode or Receipt Photo' : 'Cod QR, Cod de bare sau Foto Bon (OCR)'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* If extracted data is ready to confirm */}
          {hasScannedData ? (
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
              
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-black">
                    {lang === 'en' ? 'Receipt data extracted successfully!' : 'Datele din bon au fost extrase!'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHasScannedData(false)}
                  className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Scan again' : 'Rescanează'}</span>
                </button>
              </div>

              {/* Editable Fields Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Amount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === 'en' ? 'Total Amount (RON)' : 'Valoare Totală (RON)'}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={scannedAmount}
                    onChange={(e) => {
                      setScannedAmount(e.target.value);
                      if (e.target.value && scannedLiters) {
                        setScannedPricePerLiter((Number(e.target.value) / Number(scannedLiters)).toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-black text-sm outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Fuel Liters */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Fuel className="w-3.5 h-3.5 text-blue-500" />
                    <span>{lang === 'en' ? 'Quantity (Liters)' : 'Cantitate (Litri)'}</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={scannedLiters}
                    onChange={(e) => {
                      setScannedLiters(e.target.value);
                      if (scannedAmount && e.target.value) {
                        setScannedPricePerLiter((Number(scannedAmount) / Number(e.target.value)).toFixed(2));
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-black text-sm outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price per Liter calculation */}
              <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'en' ? 'Calculated Price / Liter:' : 'Preț calculat / Litru:'}
                </span>
                <span className="font-mono font-black text-slate-900 dark:text-white">
                  {scannedPricePerLiter ? `${scannedPricePerLiter} RON / L` : '—'}
                </span>
              </div>

              {/* SELECT FUEL TYPE (Prominent Choice) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{lang === 'en' ? 'Fuel Type' : 'Tipul de Carburant'}</span>
                  </span>
                  <span className="text-[10px] font-normal text-slate-400">
                    {lang === 'en' ? '(Click to change)' : '(Apasă pentru a alege)'}
                  </span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {/* Petrol */}
                  <button
                    type="button"
                    onClick={() => setScannedFuelType('petrol')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      scannedFuelType === 'petrol'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-600 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-emerald-500/50'
                    }`}
                  >
                    <span className="text-sm">🟢</span>
                    <span className="text-xs font-extrabold">{lang === 'en' ? 'Petrol' : 'Benzină'}</span>
                  </button>

                  {/* Diesel */}
                  <button
                    type="button"
                    onClick={() => setScannedFuelType('diesel')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      scannedFuelType === 'diesel'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/50'
                    }`}
                  >
                    <span className="text-sm">🟡</span>
                    <span className="text-xs font-extrabold">{lang === 'en' ? 'Diesel' : 'Motorină'}</span>
                  </button>

                  {/* GPL */}
                  <button
                    type="button"
                    onClick={() => setScannedFuelType('gpl')}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      scannedFuelType === 'gpl'
                        ? 'bg-blue-500 text-white border-blue-600 font-black shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-500/50'
                    }`}
                  >
                    <span className="text-sm">🔵</span>
                    <span className="text-xs font-extrabold">GPL</span>
                  </button>
                </div>
              </div>

              {/* Date & Station row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                    <span>{lang === 'en' ? 'Receipt Date' : 'Data Bonului'}</span>
                  </label>
                  <input
                    type="date"
                    value={scannedDate}
                    onChange={(e) => setScannedDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-mono text-xs outline-hidden focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {lang === 'en' ? 'Station / Notes' : 'Stație / Notițe'}
                  </label>
                  <input
                    type="text"
                    value={scannedStation}
                    onChange={(e) => setScannedStation(e.target.value)}
                    placeholder={lang === 'en' ? 'e.g. Petrom, OMV' : 'ex: Petrom, OMV'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs outline-hidden focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Primary Apply Button */}
              <button
                type="button"
                onClick={handleConfirmAndApply}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{lang === 'en' ? 'Apply Receipt Data to Form' : 'Aplică Datele din Bon'}</span>
              </button>

            </div>
          ) : (
            /* SCANNER TABS & MODES */
            <div className="space-y-4">
              
              {/* Tab Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('qr');
                    setCameraError('');
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'qr'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'QR & Barcode' : 'Cod QR & Bare'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('ocr');
                    stopLiveScanner();
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    activeTab === 'ocr'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Receipt Photo (OCR)' : 'Foto Bon (OCR)'}</span>
                </button>
              </div>

              {/* TAB 1: QR & BARCODE SCANNER */}
              {activeTab === 'qr' && (
                <div className="space-y-3">
                  
                  {/* Camera Viewport Container */}
                  <div className="relative bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-square flex flex-col items-center justify-center">
                    <div id={cameraContainerId} className="w-full h-full overflow-hidden" />

                    {!isScanningLive && !cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-slate-900 text-slate-300">
                        <RefreshCw className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
                        <span className="text-xs font-bold">
                          {lang === 'en' ? 'Initializing camera...' : 'Se pornește camera...'}
                        </span>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-5 text-center bg-slate-900 text-slate-300 space-y-2">
                        <AlertCircle className="w-8 h-8 text-amber-400" />
                        <span className="text-xs">{cameraError}</span>
                        <button
                          type="button"
                          onClick={startLiveScanner}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700"
                        >
                          {lang === 'en' ? 'Retry camera' : 'Reîncearcă camera'}
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
                    {lang === 'en' 
                      ? 'Point your camera at the QR code or Barcode printed on the receipt' 
                      : 'Îndreaptă camera spre codul QR fiscal sau codul de bare de pe bon'}
                  </p>

                  {/* Fallback File Upload for QR */}
                  <div>
                    <input
                      type="file"
                      ref={fileInputQrRef}
                      accept="image/*"
                      onChange={handleQrImageUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputQrRef.current?.click()}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-500" />
                      <span>{lang === 'en' ? 'Upload image with QR / Barcode' : 'Alege poză cu cod QR sau bare din galerie'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: RECEIPT PHOTO OCR */}
              {activeTab === 'ocr' && (
                <div className="space-y-3">
                  
                  {isOcrProcessing ? (
                    <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div className="space-y-1 w-full max-w-xs">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white">
                          {ocrStatusText || (lang === 'en' ? 'Analyzing receipt...' : 'Se analizează bonul...')}
                        </h4>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                            style={{ width: `${Math.max(5, ocrProgress)}%` }}
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lang === 'en' ? 'Extracting total, liters, and fuel type' : 'Extragem automat valoarea, litrii și tipul de combustibil'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      
                      {/* Big Photo Button */}
                      <div>
                        <input
                          type="file"
                          ref={fileInputOcrRef}
                          accept="image/*"
                          capture="environment"
                          onChange={handleOcrImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputOcrRef.current?.click()}
                          className="w-full p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/5 border-2 border-dashed border-emerald-500/40 hover:border-emerald-500 text-left flex items-center justify-between group transition-all cursor-pointer shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 shrink-0">
                              <Camera className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                {lang === 'en' ? 'Take Photo of Receipt (Camera)' : 'Fă Poză Bonului (Cameră Foto)'}
                              </h4>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                {lang === 'en' ? 'Take clear photo of full receipt or totals' : 'Fotografiază bonul clar pentru citire text automată'}
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                            →
                          </span>
                        </button>
                      </div>

                      {/* Gallery Upload */}
                      <div>
                        <input
                          type="file"
                          id="ocr-gallery-upload"
                          accept="image/*"
                          onChange={handleOcrImageUpload}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('ocr-gallery-upload')?.click()}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{lang === 'en' ? 'Select photo from gallery' : 'Alege poză din galerie'}</span>
                        </button>
                      </div>

                      {/* Paste manual text toggle */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowManualInput(!showManualInput)}
                          className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{showManualInput ? (lang === 'en' ? 'Hide text box' : 'Ascunde casetă text') : (lang === 'en' ? 'Or paste raw receipt text' : 'Sau lipește textul bonului')}</span>
                        </button>

                        {showManualInput && (
                          <div className="mt-2 space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <textarea
                              value={manualText}
                              onChange={(e) => setManualText(e.target.value)}
                              placeholder={lang === 'en' ? 'Paste receipt text here...' : 'Lipește aici textul bonului fiscal...'}
                              className="w-full h-20 p-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-hidden focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
                            />
                            <button
                              type="button"
                              onClick={handleManualTextSubmit}
                              disabled={!manualText.trim()}
                              className="w-full py-2 bg-emerald-500 disabled:opacity-50 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              {lang === 'en' ? 'Extract from text' : 'Extrage din text'}
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'en' ? 'Close' : 'Închide'}
          </button>
        </div>

      </div>
    </div>
  );
};
