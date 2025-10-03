// components/admin/SupplierChartComponent.tsx
"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface SupplierStat {
  supplier: string;
  distinctItems: number;
  totalQuantity: number;
}

interface SupplierChartComponentProps {
  stats?: SupplierStat[];
}

export default function SupplierChartComponent({ stats = [] }: SupplierChartComponentProps) {
  if (!stats.length) {
    return (
      <div className="text-sm text-gray-500">No supplier data available.</div>
    );
  }

  const labels = stats.map((s) => s.supplier);

  const data = {
    labels,
    datasets: [
      {
        label: "Distinct Items",
        data: stats.map((s) => s.distinctItems),
        backgroundColor: "rgba(99,102,241,0.7)", // indigo
      },
      {
        label: "Total Quantity",
        data: stats.map((s) => s.totalQuantity),
        backgroundColor: "rgba(34,197,94,0.7)", // green
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "top" as const },
      tooltip: { enabled: true },
    },
    scales: {
      x: { ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 } },
      y: { beginAtZero: true },
    },
  };

  return (
    <div style={{ height: 340 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
