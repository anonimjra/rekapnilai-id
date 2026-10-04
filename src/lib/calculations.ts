export type FormulaType = "average" | "weighted" | "percentage";

export interface Student {
  id: string;
  name: string;
  nisn: string;
  scores: number[];
  description?: string;
}

export interface GradingConfig {
  formula: FormulaType;
  kktp: number;
  weights?: number[];
  tpNames: string[];
}

export const calculateFinalValue = (
  scores: number[],
  config: GradingConfig
): number => {
  const validScores = scores.filter((s) => s !== null && s !== undefined && s >= 0 && s <= 100);

  if (validScores.length === 0) return 0;

  switch (config.formula) {
    case "average": {
      return Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10;
    }
    case "weighted": {
      if (!config.weights || config.weights.length === 0) {
        return Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10;
      }
      let total = 0;
      let weightSum = 0;
      for (let i = 0; i < validScores.length && i < config.weights.length; i++) {
        total += validScores[i] * config.weights[i];
        weightSum += config.weights[i];
      }
      return Math.round((total / weightSum) * 10) / 10;
    }
    case "percentage": {
      const tercapai = validScores.filter((s) => s >= config.kktp).length;
      return Math.round((tercapai / validScores.length) * 1000) / 10;
    }
    default:
      return 0;
  }
};

export const getAchievementStatus = (value: number, kktp: number): "tercapai" | "belum" => {
  return value >= kktp ? "tercapai" : "belum";
};

export const getPredicate = (value: number): string => {
  if (value >= 91) return "Sangat baik";
  if (value >= 76) return "Baik";
  if (value >= 61) return "Cukup";
  return "Perlu bimbingan";
};

export const generateSimpleDescription = (
  scores: number[],
  tpNames: string[],
  kktp: number
): string => {
  const validScores = scores
    .map((s, i) => ({ score: s, index: i }))
    .filter((item) => item.score !== null && item.score !== undefined && item.score >= 0 && item.score <= 100);

  if (validScores.length === 0) return "";

  const maxItem = validScores.reduce((prev, current) =>
    current.score > prev.score ? current : prev
  );
  const minItem = validScores.reduce((prev, current) =>
    current.score < prev.score ? current : prev
  );

  const maxPred = getPredicate(maxItem.score);
  const minPred = getPredicate(minItem.score);
  const maxTp = tpNames[maxItem.index] || "Pembelajaran";
  const minTp = tpNames[minItem.index] || "Pembelajaran";

  return `${maxPred} dalam ${maxTp}. ${minPred} dalam ${minTp}.`;
};

export const generateContextualDescription = (
  scores: number[],
  tpNames: string[],
  kktp: number
): string => {
  const validScores = scores
    .map((s, i) => ({ score: s, index: i }))
    .filter((item) => item.score !== null && item.score !== undefined && item.score >= 0 && item.score <= 100);

  if (validScores.length === 0) return "";

  const tercapaiCount = validScores.filter((item) => item.score >= kktp).length;
  const totalTp = validScores.length;
  const avgScore = Math.round((validScores.reduce((sum, item) => sum + item.score, 0) / totalTp) * 10) / 10;
  const maxScore = Math.max(...validScores.map((item) => item.score));
  const minScore = Math.min(...validScores.map((item) => item.score));
  const maxItem = validScores.find((item) => item.score === maxScore)!;
  const minItem = validScores.find((item) => item.score === minScore)!;
  const consistency = Math.abs(maxScore - minScore) < 15 ? "konsisten" : "berfluktuasi";

  if (tercapaiCount === totalTp) {
    return `Menunjukkan penguasaan komprehensif dalam semua TP dengan nilai rata-rata ${avgScore}.`;
  } else if (tercapaiCount === 0) {
    return `Memerlukan bimbingan menyeluruh untuk mencapai kriteria ketercapaian di semua TP.`;
  } else {
    const maxTp = tpNames[maxItem.index] || "Pembelajaran";
    const minTp = tpNames[minItem.index] || "Pembelajaran";
    return `Menunjukkan nilai ${consistency} dengan penguasaan utama di ${maxTp} (${maxScore}) dan perlu perhatian di ${minTp} (${minScore}).`;
  }
};

export const validateScore = (value: any): { valid: boolean; error?: string } => {
  if (value === "" || value === null || value === undefined) return { valid: true };
  const num = Number(value);
  if (isNaN(num)) return { valid: false, error: "Nilai harus angka" };
  if (num < 0 || num > 100) return { valid: false, error: "Nilai harus 0-100" };
  return { valid: true };
};

export const validateWeights = (weights: number[]): boolean => {
  const sum = weights.reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.01;
};
