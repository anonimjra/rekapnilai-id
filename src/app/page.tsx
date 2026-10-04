"use client";

import React, { useState, useEffect } from "react";
import {
  Student,
  GradingConfig,
  FormulaType,
  generateContextualDescription,
} from "@/lib/calculations";
import { exportToExcel, exportToCSV } from "@/lib/exporters";
import { ValueTable } from "@/components/ValueTable";
import { DescriptionGenerator } from "@/components/DescriptionGenerator";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { ExcelImport, ParsedData } from "@/components/ExcelImport";
import { Toast, ToastType } from "@/components/Toast";
import {
  Download,
  Sparkles,
  FileSpreadsheet,
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Maximize2,
  Minimize2,
  BarChart3,
  Sliders,
} from "lucide-react";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<GradingConfig>({
    formula: "average",
    kktp: 70,
    tpNames: [],
  });
  const [className, setClassName] = useState("Kelas 8A");
  const [subject, setSubject] = useState("Matematika");

  // Sidebar toggle state for maximum table width
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightSidebar, setShowRightSidebar] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch("/rekapnilai-id/sample-data.json");
      const data = await response.json();

      setStudents(
        data.students.map((s: any) => ({
          ...s,
          description: generateContextualDescription(s.scores, data.tpNames, data.kktp),
        }))
      );
      setConfig({
        formula: "average",
        kktp: data.kktp,
        tpNames: data.tpNames,
      });
      setClassName(data.class);
      setSubject(data.subject);

      showToast("Data contoh berhasil dimuat! ✓", "success");
    } catch {
      showToast("Gagal memuat data contoh", "error");
    }
  };

  const handleImport = (data: ParsedData) => {
    setStudents(
      data.students.map((s) => ({
        ...s,
        description: generateContextualDescription(s.scores, data.tpNames, config.kktp),
      }))
    );
    setConfig((prev) => ({ ...prev, tpNames: data.tpNames }));
    showToast(`${data.students.length} siswa berhasil dimuat ✓`, "success");
  };

  const handleScoreChange = (studentId: string, tpIndex: number, value: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const newScores = s.scores.map((sc, idx) => (idx === tpIndex ? value : sc));
        return {
          ...s,
          scores: newScores,
          description: generateContextualDescription(newScores, config.tpNames, config.kktp),
        };
      })
    );
    showToast("Nilai tersimpan", "success");
  };

  const handleDescriptionChange = (studentId: string, description: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, description } : s))
    );
  };

  const handleApplyDescriptions = (descriptions: Record<string, string>) => {
    setStudents((prev) =>
      prev.map((s) => ({ ...s, description: descriptions[s.id] || s.description }))
    );
    showToast("Deskripsi berhasil diterapkan ke semua siswa ✓", "success");
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    showToast("Siswa dihapus", "info");
  };

  const handleExport = (format: "xlsx" | "csv") => {
    if (students.length === 0) {
      showToast("Tidak ada data untuk diekspor", "error");
      return;
    }

    try {
      if (format === "xlsx") {
        exportToExcel(students, config, className, subject);
        showToast("File Excel berhasil didownload ✓", "success");
      } else {
        exportToCSV(students, config, className, subject);
        showToast("File CSV berhasil didownload ✓", "success");
      }
    } catch {
      showToast("Gagal mengekspor file", "error");
    }
  };

  const toggleFocusMode = () => {
    if (!showLeftSidebar && !showRightSidebar) {
      // Reopen left menu
      setShowLeftSidebar(true);
    } else {
      // Collapse both for maximum space
      setShowLeftSidebar(false);
      setShowRightSidebar(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("rekapnilai_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStudents(parsed.students || []);
        setConfig(parsed.config || config);
        setClassName(parsed.className || className);
        setSubject(parsed.subject || subject);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      localStorage.setItem(
        "rekapnilai_data",
        JSON.stringify({ students, config, className, subject })
      );
    }
  }, [students, config, className, subject]);

  // Determine main table column span based on visible sidebars
  const getTableSpanClass = () => {
    if (showLeftSidebar && showRightSidebar) return "lg:col-span-6";
    if (showLeftSidebar && !showRightSidebar) return "lg:col-span-9";
    if (!showLeftSidebar && showRightSidebar) return "lg:col-span-9";
    return "lg:col-span-12"; // 100% full width table
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-600" size={30} />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-800">RekapNilai.id</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                  Kurikulum Merdeka
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Otomasi Hitung Nilai Rapor & Deskripsi Capaian
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right mr-2 hidden md:block">
              <p className="text-xs font-bold text-slate-700">{className} · {subject}</p>
              <p className="text-[11px] text-slate-500">{students.length} siswa terdaftar</p>
            </div>

            {/* Quick Export Button */}
            {students.length > 0 && (
              <button
                onClick={() => handleExport("xlsx")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Download size={14} />
                <span>Export Excel</span>
              </button>
            )}

            {/* Toggle Left Menu */}
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                showLeftSidebar
                  ? "bg-slate-100 border-slate-300 text-slate-700"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              title={showLeftSidebar ? "Sembunyikan Menu Kiri" : "Buka Menu Kiri"}
            >
              {showLeftSidebar ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
              <span className="hidden sm:inline">{showLeftSidebar ? "Tutup Menu" : "Buka Menu"}</span>
            </button>

            {/* Toggle Right Analytics */}
            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                showRightSidebar
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 font-semibold"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              title={showRightSidebar ? "Sembunyikan Grafik" : "Buka Grafik Analisis"}
            >
              <BarChart3 size={16} />
              <span className="hidden sm:inline">Analisis</span>
            </button>

            {/* Fullscreen Table Mode Button */}
            <button
              onClick={toggleFocusMode}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                !showLeftSidebar && !showRightSidebar
                  ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-xs"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
              title="Mode Layar Penuh (Tabel Super Luas)"
            >
              {!showLeftSidebar && !showRightSidebar ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              <span className="hidden lg:inline">
                {!showLeftSidebar && !showRightSidebar ? "Mode Normal" : "Tabel Lebar Penuh"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar (Collapsible) */}
          {showLeftSidebar && (
            <div className="col-span-1 lg:col-span-3 space-y-4">
              {/* Import */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sparkles size={16} className="text-emerald-600" />
                    1. Import Data
                  </h3>
                  <button
                    onClick={() => setShowLeftSidebar(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Lipat Menu Kiri"
                  >
                    <PanelLeftClose size={14} />
                  </button>
                </div>

                <ExcelImport
                  onDataParsed={handleImport}
                  onError={(msg) => showToast(msg, "error")}
                />

                <div className="mt-3">
                  <button
                    onClick={loadSampleData}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold py-2 px-3 rounded-lg text-xs transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles size={14} className="text-emerald-600" />
                    <span>⚡ Coba dengan Data Contoh (30 Siswa)</span>
                  </button>
                </div>
              </div>

              {/* Formula Config */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <Sliders size={16} className="text-slate-500" />
                  <span>2. Konfigurasi Nilai</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Rumus Perhitungan
                    </label>
                    <select
                      value={config.formula}
                      onChange={(e) => setConfig({ ...config, formula: e.target.value as FormulaType })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                    >
                      <option value="average">Rata-rata (Standar)</option>
                      <option value="weighted">Pembobotan</option>
                      <option value="percentage">Persentase Ketercapaian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Target KKTP (Ambang Batas)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={config.kktp}
                      onChange={(e) => setConfig({ ...config, kktp: parseInt(e.target.value) || 70 })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Description Generator */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3">3. Deskripsi Otomatis</h3>
                <DescriptionGenerator
                  students={students}
                  config={config}
                  onApply={handleApplyDescriptions}
                />
              </div>

              {/* Export */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Download size={16} className="text-emerald-600" />
                  4. Export Hasil
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleExport("xlsx")}
                    disabled={students.length === 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-medium py-2 px-3 rounded-lg text-xs transition"
                  >
                    Download Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    disabled={students.length === 0}
                    className="w-full bg-slate-100 hover:bg-slate-200 disabled:bg-slate-100 text-slate-700 font-medium py-2 px-3 rounded-lg text-xs transition"
                  >
                    Download CSV
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Main Table Content (Takes full space dynamically!) */}
          <div className={`col-span-1 ${getTableSpanClass()} transition-all duration-200`}>
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <span>Tabel Rekap Nilai Siswa</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({students.length} Siswa)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Klik angka nilai mana saja untuk mengubahnya langsung secara real-time.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!showLeftSidebar && (
                    <button
                      onClick={() => setShowLeftSidebar(true)}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <PanelLeft size={14} />
                      <span>Buka Menu</span>
                    </button>
                  )}
                  {!showRightSidebar && (
                    <button
                      onClick={() => setShowRightSidebar(true)}
                      className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5"
                    >
                      <BarChart3 size={14} />
                      <span>Buka Analisis</span>
                    </button>
                  )}
                </div>
              </div>

              {students.length === 0 ? (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-xl">
                  <p className="text-sm font-semibold text-slate-600 mb-1">
                    Belum ada data nilai siswa di tabel
                  </p>
                  <p className="text-xs text-slate-400 mb-4">
                    Gunakan menu di samping kiri untuk mengupload file Excel atau coba dengan data contoh.
                  </p>
                  <button
                    onClick={loadSampleData}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                  >
                    <Sparkles size={14} />
                    <span>Muat 30 Data Siswa Contoh Sekarang</span>
                  </button>
                </div>
              ) : (
                <ValueTable
                  students={students}
                  config={config}
                  onScoreChange={handleScoreChange}
                  onDescriptionChange={handleDescriptionChange}
                  onDeleteStudent={handleDeleteStudent}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar (Analytics - Collapsible) */}
          {showRightSidebar && (
            <div className="col-span-1 lg:col-span-3 space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs sticky top-20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <BarChart3 size={16} className="text-emerald-600" />
                    <span>Analisis Kelas</span>
                  </h3>
                  <button
                    onClick={() => setShowRightSidebar(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                    title="Tutup Panel Analisis"
                  >
                    <PanelRightClose size={14} />
                  </button>
                </div>
                <AnalyticsPanel students={students} config={config} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4">
        <div className="max-w-[1600px] mx-auto px-4 text-center text-xs text-slate-500">
          <p>
            RekapNilai.id · 100% Gratis · Data disimpan di browser Anda, tidak pernah keluar · 
            <span className="text-emerald-600 font-semibold"> Privacy First</span>
          </p>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
