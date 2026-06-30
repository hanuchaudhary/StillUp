import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DataPoint {
  time: string;
  avg?: number;
  "us-east"?: number;
  "eu-west"?: number;
  "ap-south"?: number;
}

interface ResponseTimeChartProps {
  data: DataPoint[];
  showAllRegions?: boolean;
}

const singleRegionConfig = {
  avg: {
    label: "Response Time",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const multiRegionConfig = {
  "us-east": {
    label: "US East",
    color: "var(--chart-1)",
  },
  "eu-west": {
    label: "EU West",
    color: "var(--chart-2)",
  },
  "ap-south": {
    label: "AP South",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function ResponseTimeChart({
  data,
  showAllRegions = false,
}: ResponseTimeChartProps) {
  const config = showAllRegions ? multiRegionConfig : singleRegionConfig;

  return (
    <ChartContainer config={config} className="h-72 sm:h-86 w-full">
      <AreaChart accessibilityLayer data={data}>
        <CartesianGrid vertical={false} strokeDasharray={"3 3"} />
        <XAxis
          dataKey="time"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontFamily="var(--font-montreal-mono)"
          fontSize={"11px"}
          fontWeight={"800"}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          fontFamily="var(--font-montreal-mono)"
          fontSize={"11px"}
          fontWeight={"800"}
        />
        <defs>
          <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
          <linearGradient id="gradient-chart-avg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-avg)" stopOpacity={0.5} />
            <stop offset="95%" stopColor="var(--color-avg)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient
            id="gradient-chart-us-east"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-us-east)"
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor="var(--color-us-east)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient
            id="gradient-chart-eu-west"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-eu-west)"
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor="var(--color-eu-west)"
              stopOpacity={0.1}
            />
          </linearGradient>
          <linearGradient
            id="gradient-chart-ap-south"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="5%"
              stopColor="var(--color-ap-south)"
              stopOpacity={0.5}
            />
            <stop
              offset="95%"
              stopColor="var(--color-ap-south)"
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        {showAllRegions ? (
          <>
            <Area
              strokeDasharray={"3 3"}
              dataKey="us-east"
              fill="url(#gradient-chart-us-east)"
              fillOpacity={0.4}
              stroke="var(--color-us-east)"
              strokeWidth={1.5}
            />
            <Area
              strokeDasharray={"3 3"}
              dataKey="eu-west"
              fill="url(#gradient-chart-eu-west)"
              fillOpacity={0.4}
              stroke="var(--color-eu-west)"
              strokeWidth={1.5}
            />
            <Area
              strokeDasharray={"3 3"}
              dataKey="ap-south"
              fill="url(#gradient-chart-ap-south)"
              fillOpacity={0.4}
              stroke="var(--color-ap-south)"
              strokeWidth={1.5}
            />
          </>
        ) : (
          <Area
            dataKey="avg"
            fill="url(#gradient-chart-avg)"
            fillOpacity={0.4}
            stroke="var(--color-avg)"
            strokeWidth={0.8}
            strokeDasharray={"3 3"}
          />
        )}
      </AreaChart>
    </ChartContainer>
  );
}
