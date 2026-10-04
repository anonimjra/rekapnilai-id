"use client";

import React, { useState } from "react";
import { Student, GradingConfig, calculateFinalValue, getAchievementStatus } from "@/lib/calculations";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface ValueTableProps {
  students: Student[];
  config: GradingConfig;
  onScoreChange: (studentId: string, tpIndex: number, value: number) => void;
  onDescriptionChange: (studentId: string, description: string) => void;
  onDeleteStudent: (studentId: string) => void;
}

export const ValueTable: React.FC<ValueTableProps> = ({
  students,
  config,
  onScoreChange,
  onDescriptionChange,
  onDeleteStudent,
}) => {
  const [editingCell, setEditingCell] = useState<{ studentId: string; tpIndex: number } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [sortColumn, setSortColumn] = useState<number | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  const handleCellClick = (studentId: string, tpIndex: number, currentValue: number) => {
    setEditingCell({ studentId, tpIndex });
    setEditValue(String(currentValue || ""));
  };

  const handleCellBlur = () => {
    if (!editingCell) return;

    const num = parseFloat(editValue) || 0;
    if (num >= 0 && num <= 100) {
      onScoreChange(editingCell.studentId, editingCell.tpIndex, num);
    }
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleCellBlur();
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortColumn === null) return 0;

    let aVal: number;
    let bVal: number;

    if (sortColumn < config.tpNames.length) {
      aVal = a.scores[sortColumn] || 0;
      bVal = b.scores[sortColumn] || 0;
    } else if (sortColumn === config.tpNames.length) {
      aVal = calculateFinalValue(a.scores, config);
      bVal = calculateFinalValue(b.scores, config);
    } else {
      return 0;
    }

    return sortAsc ? aVal - bVal : bVal - aVal;
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-emerald-500 text-white">
              <th className="px-3 py-2 text-left font-semibold w-12">No</th>
              <th className="px-3 py-2 text-left font-semibold w-40">Nama Siswa</th>
              <th className="px-3 py-2 text-center font-semibold w-24">NISN</th>

              {config.tpNames.map((tpName, idx) => (
                <th
                  key={idx}
                  className="px-2 py-2 text-center font-semibold w-20 cursor-pointer hover:bg-emerald-600 transition"
                  onClick={() => {
                    if (sortColumn === idx) {
                      setSortAsc(!sortAsc);
                    } else {
                      setSortColumn(idx);
                      setSortAsc(true);
                    }
                  }}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs">{tpName}</span>
                    {sortColumn === idx && (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                  </div>
                </th>
              ))}

              <th
                className="px-3 py-2 text-center font-semibold w-20 cursor-pointer hover:bg-emerald-600 transition"
                onClick={() => {
                  if (sortColumn === config.tpNames.length) {
                    setSortAsc(!sortAsc);
                  } else {
                    setSortColumn(config.tpNames.length);
                    setSortAsc(true);
                  }
                }}
              >
                <div className="flex items-center justify-center gap-1">
                  <span className="text-xs">Nilai</span>
                  {sortColumn === config.tpNames.length && (sortAsc ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
                </div>
              </th>

              <th className="px-3 py-2 text-center font-semibold w-24">Status</th>
              <th className="px-3 py-2 text-left font-semibold w-56">Deskripsi</th>
              <th className="px-3 py-2 text-center font-semibold w-16">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {sortedStudents.length === 0 ? (
              <tr>
                <td colSpan={config.tpNames.length + 7} className="px-4 py-8 text-center text-slate-500">
                  Tidak ada siswa. Klik "Coba dengan Data Contoh" untuk memulai.
                </td>
              </tr>
            ) : (
              sortedStudents.map((student, idx) => {
                const finalValue = calculateFinalValue(student.scores, config);
                const status = getAchievementStatus(finalValue, config.kktp);

                return (
                  <tr key={student.id} className="border-b border-slate-200 hover:bg-slate-50 transition">
                    <td className="px-3 py-2 text-slate-700 font-medium">{idx + 1}</td>
                    <td className="px-3 py-2 text-slate-700 font-medium">{student.name}</td>
                    <td className="px-3 py-2 text-center text-slate-600 text-xs">{student.nisn}</td>

                    {student.scores.map((score, tpIdx) => (
                      <td
                        key={tpIdx}
                        className="px-2 py-2 text-center cursor-pointer hover:bg-emerald-50 transition"
                        onClick={() => handleCellClick(student.id, tpIdx, score)}
                      >
                        {editingCell?.studentId === student.id && editingCell?.tpIndex === tpIdx ? (
                          <input
                            autoFocus
                            type="number"
                            min="0"
                            max="100"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleCellBlur}
                            onKeyDown={handleKeyDown}
                            className="w-full px-1 py-1 border border-emerald-500 rounded text-center text-sm"
                          />
                        ) : (
                          <div className="flex flex-col items-center">
                            <span className="font-semibold text-slate-800">{score}</span>
                            <span className={`text-xs ${score >= config.kktp ? "text-emerald-600" : "text-amber-600"}`}>
                              {score >= config.kktp ? "✓" : "✗"}
                            </span>
                          </div>
                        )}
                      </td>
                    ))}

                    <td className="px-3 py-2 text-center">
                      <div className="inline-block bg-slate-100 px-2 py-1 rounded font-semibold text-slate-800">
                        {finalValue.toFixed(1)}
                      </div>
                    </td>

                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                          status === "tercapai"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {status === "tercapai" ? "Tercapai ✓" : "Belum ✗"}
                      </span>
                    </td>

                    <td className="px-3 py-2 text-xs text-slate-600 max-w-sm truncate">
                      {student.description || (
                        <span className="italic text-slate-400">–</span>
                      )}
                    </td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => onDeleteStudent(student.id)}
                        className="text-red-500 hover:text-red-700 transition p-1"
                        title="Hapus siswa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
