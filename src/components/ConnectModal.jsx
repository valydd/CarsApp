import React, { useEffect, useRef, useState } from 'react';
import { 
  X, 
  QrCode, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Smartphone, 
  ExternalLink, 
  Globe, 
  Sparkles,
  Camera
} from 'lucide-react';
import QRCode from 'qrcode';
import { translations } from '../i18n';
import { APP_VERSION } from '../version';
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

export const ConnectModal = ({
  isOpen,
  onClose,
  lang = 'ro'
}) => {
  const t = translations[lang] || translations.ro;
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const apkFileName = `CarsApp_v${APP_VERSION}.apk`;
  const appUrl = "https://valydd.github.io/CarsApp/";
  const apkDownloadUrl = `https://valydd.github.io/CarsApp/${apkFileName}`;
  const apkGithubUrl = `https://github.com/valydd/CarsApp/raw/main/public/${apkFileName}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(
        canvasRef.current,
        appUrl,
        {
          width: 220,
          margin: 2,
          color: {
            dark: '#090d16',
            light: '#ffffff'
          }
        },
        (error) => {
          if (error) console.error("Error generating QR code:", error);
        }
      );
    }
  }, [isOpen, appUrl]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(appUrl);
        setCopied(true);
        showToast(t.linkCopied || "Link copiat în clipboard!");
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      showToast("Selectează și copiază linkul manual.");
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "CarsApp",
      text: t.sharePrompt || "Deschide aplicația CarsApp sau descarcă APK-ul:",
      url: appUrl
    };

    if (Capacitor.isNativePlatform()) {
      try {
        await Share.share(shareData);
      } catch (err) {
        handleCopyLink();
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // user cancelled
      }
    } else {
      // WhatsApp direct share fallback
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareData.text} ${appUrl}`)}`;
      window.open(waUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white leading-tight">
                {t.connectDevicesTitle || "Conectează Dispozitive"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {t.connectDevicesDesc || "Sincronizare pe orice telefon, tabletă sau PC"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Toast feedback */}
          {toastMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs text-center shadow-lg animate-in slide-in-from-top duration-200 flex items-center justify-center gap-1.5">
              <Check className="w-4 h-4" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-center shadow-inner">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200/80 mb-3">
              <canvas ref={canvasRef} className="rounded-lg max-w-[200px] max-h-[200px] sm:max-w-[220px] sm:max-h-[220px]" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-black">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.scanWithCamera || "Scanează cu camera telefonului"}</span>
            </div>
          </div>

          {/* Quick Copy Link Bar */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t.appLinkDirect || "Link Direct Aplicație:"}
            </label>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 pl-3">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="bg-transparent text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-full outline-hidden truncate"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 flex items-center gap-1 ${
                  copied 
                    ? 'bg-emerald-500 text-slate-950 shadow-xs' 
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                }`}
                title={t.copyLink || "Copiază Link"}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (t.linkCopied || "Copiat!") : (t.copyLink || "Copiază")}</span>
              </button>
            </div>
          </div>

          {/* Direct APK Download Button (Big & Prominent) */}
          <div className="space-y-2">
            <a
              href={apkDownloadUrl}
              download={apkFileName}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>{t.downloadApkBtn || "Descarcă Aplicația"} ({apkFileName})</span>
            </a>

            <div className="flex items-center justify-between gap-2 px-1">
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {t.downloadApkDesc || "Instalează direct pe telefonul sau tableta Android"}
              </span>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{t.shareWhatsApp || "Trimite pe WhatsApp"}</span>
              </button>
            </div>
          </div>

          {/* 3-Step Guide */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-emerald-500" />
              <span>{t.qrStepsTitle || "Cum te conectezi în 3 pași simpli:"}</span>
            </h4>
            
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</span>
                <span>{t.qrStep1 || "Deschide camera foto pe celălalt telefon, tabletă sau laptop."}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</span>
                <span>{t.qrStep2 || "Îndreaptă camera spre codul QR afișat mai sus."}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</span>
                <span>{t.qrStep3 || "Atinge linkul apărut pentru a deschide ultima versiune în browser."}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
          >
            {t.cancel || "Închide"}
          </button>
        </div>

      </div>
    </div>
  );
};
