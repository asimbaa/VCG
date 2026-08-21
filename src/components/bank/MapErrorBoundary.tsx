import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class MapErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn("Map Error Boundary Caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="w-full h-full min-h-[350px] rounded-2xl bg-slate-900 border border-red-500/20 flex flex-col items-center justify-center space-y-4">
           <span className="text-red-400 font-mono text-xs font-bold">Map visualization offline (Auth Error)</span>
        </div>
      );
    }
    return this.props.children;
  }
}
