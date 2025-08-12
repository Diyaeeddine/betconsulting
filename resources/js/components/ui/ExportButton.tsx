import React from 'react';

interface ExportButtonProps {
  onExport: (format: "excel" | "pdf") => Promise<void>;
  isLoading: boolean;
}

export default function ExportButton({ onExport, isLoading }: ExportButtonProps) {
  return (
    <div className="relative">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium transition-colors"
        disabled={isLoading}
        onClick={() => onExport("excel")}
      >
        {isLoading ? "Export en cours..." : "Exporter"}
      </button>
    </div>
  );
}
