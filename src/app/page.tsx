"use client";

import React, { useState, useEffect } from "react";
import { Student, GradingConfig, FormulaType } from "@/lib/calculations";
import { exportToExcel, exportToCSV } from "@/lib/exporters";
import { ValueTable } from "@/components/ValueTable";
import { DescriptionGenerator } from "@/components/DescriptionGenerator";
import { AnalyticsPanel } from "@/components/AnalyticsPanel";
import { ExcelImport, ParsedData } from "@/components/ExcelImport";
import { Toast, ToastType } from "@/components/Toast";
import { Download, Sparkles, FileSpreadsheet } from "lucide-react";

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [config, setConfig] = useState<GradingConfig>({
    formula: "average",
    kktp: 70,
    tpNames: [],
  });
  const [className, setClassName] = useState("Kelas 8A");
  const [subject, setSubject] = useState("Matematika");

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const loadSampleData = async () => {
    try {
      const response = await fetch("/rekapnilai-id/sample-data.json");
      const data = await response.json();

      setStudents(data.students.map((s: any) => ({ ...s, description: "" })));
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
    setStudents(data.students.map((s) => ({ ...s, description: "" })));
    setConfig((prev) => ({ ...prev, tpNames: data.tpNames }));
    showToast(`${data.students.length} siswa berhasil dimuat ✓`, "success");
  };

  const handleScoreChange = (studentId: string, tpIndex: number, value: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, scores: s.scores.map((sc, idx) => (idx === tpIndex ? value : sc)) }
          : s
      )
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="text-emerald-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">RekapNilai.id</h1>
              <p className="text-xs text-slate-500">Otomasi Rapor Kurikulum Merdeka</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-700">{className} · {subject}</p>
            <p className="text-xs text-slate-500">{students.length} siswa</p>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Import */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-600" />
                1. Import Data
              </h3>
              <ExcelImport
                onDataParsed={handleImport}
                onError={(msg) => showToast(msg, "error")}
              />
              <div className="mt-3">
                <button
                  onClick={loadSampleData}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg text-sm transition"
                >
                  Coba dengan Data Contoh
                </button>
              </div>
            </div>

            {/* Formula Config */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">2. Konfigurasi</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rumus Perhitungan
                  </label>
                  <select
                    value={config.formula}
                    onChange={(e) => setConfig({ ...config, formula: e.target.value as FormulaType })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  >
                    <option value="average">Rata-rata</option>
                    <option value="weighted">Pembobotan</option>
                    <option value="percentage">Persentase Ketercapaian</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    KKTP (Threshold)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={config.kktp}
                    onChange={(e) => setConfig({ ...config, kktp: parseInt(e.target.value) || 70 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Description Generator */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3">3. Deskripsi Otomatis</h3>
              <DescriptionGenerator
                students={students}
                config={config}
                onApply={handleApplyDescriptions}
              />
            </div>

            {/* Export */}
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Download size={16} className="text-emerald-600" />
                4. Export
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleExport("xlsx")}
                  disabled={students.length === 0}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-medium py-2 px-3 rounded-lg text-sm transition"
                >
                  Download Excel (.xlsx)
                </button>
                <button
                  onClick={() => handleExport("csv")}
                  disabled={students.length === 0}
                  className="w-full bg-slate-200 hover:bg-slate-300 disabled:bg-slate-200 text-slate-700 font-medium py-2 px-3 rounded-lg text-sm transition"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-800">Tabel Nilai</h3>
                {students.length > 0 && (
                  <span className="text-xs text-slate-500">
                    Klik sel untuk edit nilai
                  </span>
                )}
              </div>
              <ValueTable
                students={students}
                config={config}
                onScoreChange={handleScoreChange}
                onDescriptionChange={handleDescriptionChange}
                onDeleteStudent={handleDeleteStudent}
              />
            </div>
          </div>

          {/* Right Analytics */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <h3 className="text-sm font-bold text-slate-800 mb-3">Analisis Kelas</h3>
              <AnalyticsPanel students={students} config={config} />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
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
