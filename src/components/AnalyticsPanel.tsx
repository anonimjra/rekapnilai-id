"use client";

import React from "react";
import { Student, GradingConfig, calculateFinalValue, getAchievementStatus } from "@/lib/calculations";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface AnalyticsPanelProps {
  students: Student[];
  config: GradingConfig;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ students, config }) => {
  if (students.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 text-center text-slate-500 text-sm">
        Data belum tersedia
      </div>
    );
  }

  // Score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
  const finals = students.map((s) => calculateFinalValue(s.scores, config));
  const avgFinal = finals.reduce((a, b) => a + b, 0) / finals.length;
  const tercapaiTotal = finals.filter((v) => v >= config.kktp).length;

  const distributionBins = [
    { range: "0–20", min: 0, max: 20, count: 0 },
    { range: "21–40", min: 21, max: 40, count: 0 },
    { range: "41–60", min: 41, max: 60, count: 0 },
    { range: "61–80", min: 61, max: 80, count: 0 },
    { range: "81–100", min: 81, max: 100, count: 0 },
  ];

  finals.forEach((v) => {
    const bin = distributionBins.find((b) => v >= b.min && v <= b.max);
    if (bin) bin.count++;
  });

  // TP mastery
  const tpMastery = config.tpNames.map((name, tpIdx) => {
    const scores = students.map((s) => s.scores[tpIdx] || 0);
    const tercapai = scores.filter((s) => s >= config.kktp).length;
    const pct = Math.round((tercapai / students.length) * 100);
    return { name, pct, tercapai, total: students.length };
  });

  // At-risk students
  const atRisk = students
    .map((s) => ({
      name: s.name,
      final: calculateFinalValue(s.scores, config),
      worstTp: config.tpNames[s.scores.indexOf(Math.min(...s.scores))],
      worstScore: Math.min(...s.scores),
    }))
    .filter((s) => s.final < config.kktp)
    .sort((a, b) => a.final - b.final);

  const barColors = ["#ef4444", "#f59e0b", "#f59e0b", "#10b981", "#10b981"];

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-slate-800">{students.length}</p>
          <p className="text-xs text-slate-500">Total Siswa</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">{avgFinal.toFixed(1)}</p>
          <p className="text-xs text-slate-500">Rata-rata</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-600">
            {Math.round((tercapaiTotal / students.length) * 100)}%
          </p>
          <p className="text-xs text-slate-500">Tercapai</p>
        </div>
      </div>

      {/* Distribution Chart */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Distribusi Nilai Kelas</h4>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={distributionBins}>
            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
            <Tooltip formatter={(val: any) => [`${val} siswa`, "Jumlah"]} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {distributionBins.map((_, i) => (
                <Cell key={i} fill={barColors[i]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* TP Mastery */}
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-slate-700 mb-2">Penguasaan per TP</h4>
        <div className="space-y-2">
          {tpMastery.map((tp, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 w-28 truncate" title={tp.name}>
                {tp.name}
              </span>
              <div className="flex-1 bg-slate-100 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-4 rounded-full transition-all duration-300 ${
                    tp.pct >= 80 ? "bg-emerald-500" : tp.pct >= 60 ? "bg-amber-400" : "bg-red-400"
                  }`}
                  style={{ width: `${tp.pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 w-10 text-right">
                {tp.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* At-Risk */}
      {atRisk.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-amber-700 mb-2">
            ⚠ Siswa Butuh Bimbingan ({atRisk.length})
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {atRisk.map((s, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs bg-amber-50 rounded px-2 py-1">
                <div>
                  <p className="font-semibold text-slate-800">{s.name}</p>
                  <p className="text-slate-500">Terendah: {s.worstTp} ({s.worstScore})</p>
                </div>
                <span className="font-bold text-amber-700">{s.final.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
