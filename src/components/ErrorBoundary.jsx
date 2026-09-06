import React from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { resetToDefaultData } from '../storage';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CarsApp ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    if (window.confirm("Sigur dorești să resetezi datele locale la starea inițială?")) {
      try {
        localStorage.clear();
        resetToDefaultData();
      } catch (e) {
        console.error(e);
      }
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h2 className="text-lg font-black text-white">
              A apărut o problemă la pornirea aplicației
            </h2>

            <p className="text-xs text-slate-400 leading-relaxed">
              CarsApp a întâmpinat o eroare neașteptată de inițializare sau afișare. Poți reîncărca aplicația sau reseta datele salvate.
            </p>

            {this.state.error && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-36 overflow-y-auto">
                {this.state.error.toString()}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                onClick={this.handleReload}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reîncarcă</span>
              </button>

              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset Date</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
