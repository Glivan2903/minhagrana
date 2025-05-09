import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

type DataItem = {
  name: string;
  value: number;
  color: string;
};

type CircleChartProps = {
  data: DataItem[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
};

export const CircleChart: React.FC<CircleChartProps> = ({
  data,
  title,
  centerLabel,
  centerValue,
}) => {
  // Fill empty chart with placeholder if no data
  const chartData = data.length > 0 
    ? data 
    : [{ name: "Sem dados", value: 100, color: "#e5e7eb" }];
  
  return (
    <div className="bg-white p-4 rounded-md shadow-sm relative">
      {title && (
        <div className="font-medium mb-4 text-center">{title}</div>
      )}
      <div className="w-[220px] h-[220px] relative flex items-center justify-center mx-auto">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {(centerLabel || centerValue) && (
          <div className="absolute left-0 top-0 w-full h-full flex flex-col items-center justify-center pointer-events-none">
            {centerLabel && <span className="text-sm text-gray-500 font-medium">{centerLabel}</span>}
            {centerValue && <span className="text-lg font-bold text-green-600">{centerValue}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
