// components/admin/BarChartComponent.jsx
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

export default function BarChartComponent({ items = [] }) {
  const labels = items.map(it => it.name);
  const dataVals = items.map(it => Number(it.quantity || 0));

  const data = {
    labels,
    datasets: [
      {
        label: "Quantity",
        data: dataVals,
        backgroundColor: "rgba(59,130,246,0.7)", // blue-ish
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: 320 }}>
      <Bar data={data} options={options} />
    </div>
  );
}
