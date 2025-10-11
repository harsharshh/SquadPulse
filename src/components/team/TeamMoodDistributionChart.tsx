"use client";

import { memo, useMemo } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

import { getMoodColor, moodOptions } from "@/lib/mood";
import MoodFace from "@/components/checkin/MoodFace";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type MoodBucket = {
  mood: number;
  count: number;
};

type Props = {
  buckets: MoodBucket[];
};

function TeamMoodDistributionChartComponent({ buckets }: Props) {
  const chartData = useMemo(() => {
    const bucketByMood = new Map(buckets.map((bucket) => [bucket.mood, bucket.count]));
    const moods = moodOptions.map((option) => option.value);
    return {
      labels: moods.map((mood) => moodOptions.find((option) => option.value === mood)?.label ?? `Mood ${mood}`),
      datasets: [
        {
          label: "Check-ins",
          data: moods.map((mood) => bucketByMood.get(mood) ?? 0),
          backgroundColor: moods.map((mood) => getMoodColor(mood)),
          borderRadius: 8,
        },
      ],
    };
  }, [buckets]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: "rgba(17, 24, 39, 0.9)",
          borderColor: "rgba(75,85,99,0.4)",
          borderWidth: 1,
          padding: 10,
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            color: "#6b7280",
            font: { size: 11 },
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: "rgba(148, 163, 184, 0.2)",
            drawBorder: false,
            borderDash: [4, 4],
          },
          ticks: {
            stepSize: 1,
            color: "#6b7280",
            font: { size: 11 },
          },
        },
      },
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <Bar height={220} data={chartData} options={chartOptions} />
      </div>
      {/* <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {moodOptions.map((option) => (
          <div
            key={option.value}
            className="flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/70 px-3 py-2 shadow-sm"
          >
            <MoodFace mood={option.value} activeColor={option.colorHex} size={32} />
            <div className="text-sm font-medium text-foreground">
              {option.label}
              <span className="ml-1 text-xs text-foreground/60">· {option.value}</span>
            </div>
          </div>
        ))}
      </div> */}
    </div>
  );
}

const TeamMoodDistributionChart = memo(TeamMoodDistributionChartComponent);

export default TeamMoodDistributionChart;
