// components/admin/PieChartComponent.jsx
"use client";

import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PieChartComponent({ data = { Kitchen: 0, Housekeeping: 0, Maintenance: 0 } }) {
  const labels = Object.keys(data);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "rgba(250,204,21,0.8)",  // yellow kitchen
          "rgba(34,197,94,0.8)",   // green housekeeping
          "rgba(59,130,246,0.8)",  // blue maintenance
        ],
      },
    ],
  };

  return (
    <div style={{ height: 260, maxWidth: 520 }}>
      <Pie data={chartData} />
    </div>
  );
}
