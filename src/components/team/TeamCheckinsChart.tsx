"use client";

import { memo, useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

import type { TeamDashboardData } from "@/lib/checkin-service";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

type Props = {
  points: TeamDashboardData["weekly"];
};

function TeamCheckinsChartComponent({ points }: Props) {
  const chartData = useMemo(() => {
    return {
      labels: points.map((point) => point.label),
      datasets: [
        {
          label: "Check-ins",
          data: points.map((point) => point.checkins),
          borderColor: "#fb7185",
          backgroundColor: "rgba(251, 113, 133, 0.2)",
          tension: 0.35,
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Avg mood",
          data: points.map((point) => point.avgMood),
          borderColor: "#a855f7",
          backgroundColor: "#a855f7",
          tension: 0.3,
          yAxisID: "y1",
        },
      ],
    };
  }, [points]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: "index" as const,
        intersect: false,
      },
      plugins: {
        legend: {
          labels: {
            color: "#6b7280",
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          borderColor: "rgba(75,85,99,0.4)",
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
          },
        },
        y: {
          type: "linear" as const,
          position: "left" as const,
          grid: {
            color: "rgba(148, 163, 184, 0.2)",
            drawBorder: false,
          },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
            stepSize: 5,
          },
        },
        y1: {
          type: "linear" as const,
          position: "right" as const,
          grid: {
            drawOnChartArea: false,
          },
          ticks: {
            color: "#a855f7",
            font: { size: 11 },
            callback: (value: number | string) =>
              typeof value === "number" ? `${value.toFixed(1)}` : value,
            suggestedMin: 1,
            suggestedMax: 5,
          },
        },
      },
    };
  }, []);

  return <Line height={260} data={chartData} options={chartOptions} />;
}

const TeamCheckinsChart = memo(TeamCheckinsChartComponent);

export default TeamCheckinsChart;
