import * as XLSX from "xlsx";
import { Student, GradingConfig, calculateFinalValue, getAchievementStatus } from "./calculations";

export const exportToExcel = (
  students: Student[],
  config: GradingConfig,
  className: string,
  subject: string
): void => {
  const workbook = XLSX.utils.book_new();

  // Prepare data with calculated values
  const data = students.map((student) => {
    const finalValue = calculateFinalValue(student.scores, config);
    const status = getAchievementStatus(finalValue, config.kktp);

    const row: any = {
      "No.": students.indexOf(student) + 1,
      "Nama Siswa": student.name,
      NISN: student.nisn,
    };

    // Add TP scores
    config.tpNames.forEach((tpName, index) => {
      row[`${tpName} (${index + 1})`] = student.scores[index] || "";
    });

    row["Nilai Akhir"] = finalValue;
    row["Status"] = status === "tercapai" ? "Tercapai ✓" : "Belum Tercapai ✗";
    row["Deskripsi"] = student.description || "";

    return row;
  });

  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Style header row (bold, emerald background)
  const headerStyle = {
    fill: { fgColor: { rgb: "10B981" } },
    font: { bold: true, color: { rgb: "FFFFFF" } },
    alignment: { horizontal: "center", vertical: "center" },
  };

  const headers = Object.keys(data[0] || {});
  headers.forEach((_, colIndex) => {
    const cellRef = XLSX.utils.encode_col(colIndex) + "1";
    if (worksheet[cellRef]) {
      worksheet[cellRef].s = headerStyle;
    }
  });

  // Set column widths
  worksheet["!cols"] = [
    { wch: 5 },   // No.
    { wch: 20 },  // Nama
    { wch: 12 },  // NISN
    ...config.tpNames.map(() => ({ wch: 12 })), // TP columns
    { wch: 12 },  // Nilai Akhir
    { wch: 15 },  // Status
    { wch: 40 },  // Deskripsi
  ];

  // Add metadata sheet
  const metaData = [
    ["Laporan Penilaian Kurikulum Merdeka"],
    [""],
    ["Kelas", className],
    ["Mata Pelajaran", subject],
    ["KKTP (Threshold)", config.kktp],
    ["Rumus", config.formula === "average" ? "Rata-rata" : config.formula === "weighted" ? "Pembobotan" : "Persentase Ketercapaian"],
    ["Tanggal Export", new Date().toLocaleDateString("id-ID")],
  ];

  const metaSheet = XLSX.utils.aoa_to_sheet(metaData);
  XLSX.utils.book_append_sheet(workbook, metaSheet, "Info");

  // Add main data sheet
  XLSX.utils.book_append_sheet(workbook, worksheet, "Nilai");

  // Generate filename
  const filename = `Rapor_${className}_${subject.replace(/\s+/g, "_")}_${new Date().getFullYear()}.xlsx`;

  // Download
  XLSX.writeFile(workbook, filename);
};

export const exportToCSV = (
  students: Student[],
  config: GradingConfig,
  className: string,
  subject: string
): void => {
  const data = students.map((student, index) => {
    const finalValue = calculateFinalValue(student.scores, config);
    const status = getAchievementStatus(finalValue, config.kktp);

    const row = [
      index + 1,
      student.name,
      student.nisn,
      ...student.scores,
      finalValue,
      status === "tercapai" ? "Tercapai" : "Belum",
      student.description || "",
    ];

    return row;
  });

  const headers = [
    "No.",
    "Nama Siswa",
    "NISN",
    ...config.tpNames,
    "Nilai Akhir",
    "Status",
    "Deskripsi",
  ];

  const csv = [headers, ...data]
    .map((row) =>
      row
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  const filename = `Rapor_${className}_${subject.replace(/\s+/g, "_")}_${new Date().getFullYear()}.csv`;

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
