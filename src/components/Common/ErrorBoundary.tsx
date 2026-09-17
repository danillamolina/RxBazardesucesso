import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F6F0] flex items-center justify-center p-4 text-[#2B3323] font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-rose-200 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Ops! Algo deu errado</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
                Ocorreu uma instabilidade momentânea na exibição desta tela.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl transition"
              >
                Tentar Novamente
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-[#8FA079] hover:bg-[#7D9068] text-white text-xs font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Recarregar Página</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
