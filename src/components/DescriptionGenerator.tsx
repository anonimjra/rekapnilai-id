"use client";

import React, { useState } from "react";
import { Student, GradingConfig, generateSimpleDescription, generateContextualDescription } from "@/lib/calculations";
import { Sparkles, X } from "lucide-react";

interface DescriptionGeneratorProps {
  students: Student[];
  config: GradingConfig;
  onApply: (descriptions: Record<string, string>) => void;
}

export const DescriptionGenerator: React.FC<DescriptionGeneratorProps> = ({
  students,
  config,
  onApply,
}) => {
  const [mode, setMode] = useState<"simple" | "contextual">("simple");
  const [showPreview, setShowPreview] = useState(false);
  const [generatedDescriptions, setGeneratedDescriptions] = useState<Record<string, string>>({});

  const handleGenerate = () => {
    const descriptions: Record<string, string> = {};

    students.forEach((student) => {
      const desc =
        mode === "simple"
          ? generateSimpleDescription(student.scores, config.tpNames, config.kktp)
          : generateContextualDescription(student.scores, config.tpNames, config.kktp);

      descriptions[student.id] = desc;
    });

    setGeneratedDescriptions(descriptions);
    setShowPreview(true);
  };

  const handleApply = () => {
    onApply(generatedDescriptions);
    setShowPreview(false);
    setGeneratedDescriptions({});
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-semibold text-slate-700">Mode Generator:</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="simple"
              checked={mode === "simple"}
              onChange={() => setMode("simple")}
              className="w-4 h-4 text-emerald-500"
            />
            <span className="text-sm text-slate-700">Sederhana (Template Singkat)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="mode"
              value="contextual"
              checked={mode === "contextual"}
              onChange={() => setMode("contextual")}
              className="w-4 h-4 text-emerald-500"
            />
            <span className="text-sm text-slate-700">Kontekstual (Lebih Natural)</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={students.length === 0}
        className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-300 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
      >
        <Sparkles size={18} />
        Generate untuk {students.length} Siswa
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl max-h-96 overflow-y-auto w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Preview Deskripsi</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {students.map((student, idx) => (
                <div key={student.id} className="bg-slate-50 p-3 rounded border border-slate-200">
                  <p className="text-sm font-semibold text-slate-800">{idx + 1}. {student.name}</p>
                  <p className="text-xs text-slate-600 mt-1">"{generatedDescriptions[student.id]}"</p>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 px-4 rounded-lg transition"
              >
                Batal
              </button>
              <button
                onClick={handleApply}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                Terapkan ke {students.length} Siswa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
