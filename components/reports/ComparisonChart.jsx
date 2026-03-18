"use client"

import { Bar, Line, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend
} from "chart.js"

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  ArcElement,
  PointElement,
  Tooltip,
  Legend
)

export default function ComparisonChart({ data, chartType }) {

  const chartData = {
    labels: ["Periodo 1", "Periodo 2"],
    datasets: [
      {
        label: "Total",
        data: data,
        backgroundColor: ["#7dc197", "#5893b9"],
        borderColor: "#6d8f7a"
      }
    ]
  }

  if (chartType === "pie") {
    return <Pie data={chartData} />
  }

  if (chartType === "line") {
    return <Line data={chartData} />
  }

  return <Bar data={chartData} />
}