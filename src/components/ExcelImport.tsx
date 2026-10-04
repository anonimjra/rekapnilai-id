"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, CheckCircle, AlertCircle, FileSpreadsheet } from "lucide-react";

export interface ParsedData {
  students: { id: string; name: string; nisn: string; scores: number[] }[];
  tpNames: string[];
}

interface ExcelImportProps {
  onDataParsed: (data: ParsedData) => void;
  onError: (msg: string) => void;
}

type UploadState = "idle" | "loading" | "success" | "error";

export const ExcelImport: React.FC<ExcelImportProps> = ({ onDataParsed, onError }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  const parseFile = async (file: File) => {
    if (!file) return;

    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext || "")) {
      onError("Format tidak didukung. Gunakan .xlsx, .xls, atau .csv");
      setState("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError("File terlalu besar (maks 5MB)");
      setState("error");
      return;
    }

    setState("loading");
    setFileName(file.name);

    try {
      const XLSX = (await import("xlsx")).default;
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      if (rows.length === 0) {
        onError("File kosong atau tidak ada data siswa");
        setState("error");
        return;
      }

      const firstRow = rows[0];
      const allKeys = Object.keys(firstRow);

      // Detect student name column
      const nameKey = allKeys.find((k) =>
        ["nama", "nama siswa", "student", "name"].some((n) =>
          k.toLowerCase().includes(n)
        )
      );

      // Detect NISN column
      const nisnKey = allKeys.find((k) =>
        ["nisn", "nis", "nomor"].some((n) => k.toLowerCase().includes(n))
      );

      // Detect TP columns: numeric header columns excluding name/nisn/no
      const skipKeys = new Set<string>([
        nameKey || "",
        nisnKey || "",
        ...allKeys.filter((k) =>
          ["no", "no.", "number"].some((n) => k.toLowerCase() === n)
        ),
      ]);

      const tpKeys = allKeys.filter((k) => !skipKeys.has(k));

      if (!nameKey || tpKeys.length === 0) {
        onError("Kolom tidak terdeteksi. Pastikan ada kolom Nama Siswa dan kolom nilai TP.");
        setState("error");
        return;
      }

      const tpNames = tpKeys;

      const students = rows.map((row, idx) => ({
        id: `import_${idx}_${Date.now()}`,
        name: String(row[nameKey] || `Siswa ${idx + 1}`),
        nisn: String(row[nisnKey || ""] || `${idx + 1}`),
        scores: tpKeys.map((k) => {
          const val = parseFloat(row[k]);
          return isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
        }),
      }));

      onDataParsed({ students, tpNames });
      setState("success");
    } catch (err) {
      onError("Gagal membaca file. Pastikan file tidak rusak.");
      setState("error");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
        dragOver
          ? "border-emerald-500 bg-emerald-50"
          : state === "success"
          ? "border-emerald-400 bg-emerald-50"
          : state === "error"
          ? "border-red-400 bg-red-50"
          : "border-slate-300 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50"
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      {state === "idle" && (
        <>
          <UploadCloud className="mx-auto mb-2 text-slate-400" size={36} />
          <p className="text-sm text-slate-600 font-medium">
            Drag &amp; drop file Excel di sini
          </p>
          <p className="text-xs text-slate-400 mt-1">atau klik untuk pilih file</p>
          <p className="text-xs text-slate-400 mt-1">.xlsx .xls .csv · maks 5MB</p>
        </>
      )}

      {state === "loading" && (
        <>
          <FileSpreadsheet className="mx-auto mb-2 text-emerald-500 animate-pulse" size={36} />
          <p className="text-sm text-emerald-600 font-medium">Membaca file...</p>
          <p className="text-xs text-slate-400 mt-1">{fileName}</p>
        </>
      )}

      {state === "success" && (
        <>
          <CheckCircle className="mx-auto mb-2 text-emerald-500" size={36} />
          <p className="text-sm text-emerald-600 font-medium">Data berhasil dimuat! ✓</p>
          <p className="text-xs text-slate-400 mt-1">{fileName}</p>
          <p className="text-xs text-emerald-500 mt-1 underline">Klik untuk upload file lain</p>
        </>
      )}

      {state === "error" && (
        <>
          <AlertCircle className="mx-auto mb-2 text-red-400" size={36} />
          <p className="text-sm text-red-600 font-medium">Gagal membaca file</p>
          <p className="text-xs text-slate-400 mt-1">Klik untuk coba lagi</p>
        </>
      )}
    </div>
  );
};
