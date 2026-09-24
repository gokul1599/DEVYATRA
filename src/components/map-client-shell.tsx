"use client";

import React, { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { MapPin, RefreshCw, Compass } from "lucide-react";
import { MapLoadingSkeleton } from "@/components/map-loading-skeleton";

const MapExplorer = dynamic(
  () => import("@/components/map-explorer").then((m) => m.MapExplorer),
  {
    ssr: false,
    loading: () => <MapLoadingSkeleton />,
  }
);

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[MapErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-obsidian text-ivory p-6">
          <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#16120E] p-8 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30">
              <Compass className="h-7 w-7 animate-pulse text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-tight text-ivory mb-2">
              Sacred Map Encountered an Issue
            </h2>
            <p className="text-sm text-ivory/70 mb-6 leading-relaxed">
              We encountered a temporary rendering condition while initializing the cartography engine. You can retry loading or explore temples directly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-2.5 text-sm font-semibold text-obsidian shadow-lg hover:bg-gold/90 transition-all cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Loading
              </button>
              <Link
                href="/temples"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-ivory hover:bg-white/10 transition-all"
              >
                <MapPin className="h-4 w-4 text-gold" />
                Browse Directory
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function MapClientShell() {
  return (
    <MapErrorBoundary>
      <MapExplorer />
    </MapErrorBoundary>
  );
}
