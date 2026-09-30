import React from 'react';
import { CheckCircle2, FileQuestion, ArrowRight, ArrowLeft, Table, AlertTriangle } from 'lucide-react';

interface StepDetectHeadersProps {
  firstRowContainsHeaders: boolean;
  onFirstRowContainsHeadersChange: (hasHeaders: boolean) => void;
  rawRows: string[][];
  onPrev: () => void;
  onNext: () => void;
}

export const StepDetectHeaders: React.FC<StepDetectHeadersProps> = ({
  firstRowContainsHeaders,
  onFirstRowContainsHeadersChange,
  rawRows,
  onPrev,
  onNext,
}) => {
  const displayRows = rawRows.slice(0, 6);
  const detectedHeaders = firstRowContainsHeaders
    ? rawRows[0] || []
    : (rawRows[0] || []).map((_, i) => `Column ${i + 1}`);
  const dataRows = firstRowContainsHeaders ? rawRows.slice(1, 6) : rawRows.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Selector Cards */}
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Header Row Detection</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Specify whether the first record in your uploaded file specifies column names or contains contact data records.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onFirstRowContainsHeadersChange(true)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              firstRowContainsHeaders
                ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                firstRowContainsHeaders ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                First row contains column headers (Recommended)
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                The top row provides labels such as &ldquo;First Name&rdquo;, &ldquo;Email&rdquo;, &ldquo;Company&rdquo;.
                Subsequent lines will be imported as contact records.
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onFirstRowContainsHeadersChange(false)}
            className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
              !firstRowContainsHeaders
                ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                !firstRowContainsHeaders ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              <FileQuestion size={18} />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">
                First row contains contact data records
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                The file begins immediately with data values without header names. Columns will be designated Column 1, Column 2, etc.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Raw Table Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Table size={14} className="text-indigo-600" />
            <span>Parsed Data Table Sample (First 5 Rows)</span>
          </label>
          <span className="text-[11px] text-slate-500">
            Total detected rows: {rawRows.length}
          </span>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200">
                  <th className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase w-12 text-center">
                    #
                  </th>
                  {detectedHeaders.map((header, idx) => (
                    <th
                      key={idx}
                      className="py-2.5 px-3 font-semibold text-slate-800 border-r border-slate-200/60 last:border-r-0 whitespace-nowrap"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-indigo-700 font-bold">{header || `Col ${idx + 1}`}</span>
                        {firstRowContainsHeaders && (
                          <span className="text-[9px] px-1 py-0.2 bg-indigo-100 text-indigo-700 rounded font-semibold">
                            Header
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dataRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2 px-3 text-[11px] font-mono text-slate-400 text-center bg-slate-50/50">
                      {firstRowContainsHeaders ? rowIdx + 2 : rowIdx + 1}
                    </td>
                    {detectedHeaders.map((_, colIdx) => (
                      <td
                        key={colIdx}
                        className="py-2 px-3 text-slate-700 border-r border-slate-100 last:border-r-0 whitespace-nowrap max-w-[200px] truncate"
                        title={row[colIdx] || ''}
                      >
                        {row[colIdx] || <span className="text-slate-300 italic">empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Upload</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <span>Continue to Column Mapping</span>
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
