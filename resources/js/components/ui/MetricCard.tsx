import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change: {
    value: number;
    type: "increase" | "decrease";
  };
  icon: React.ReactNode;
  color: "blue" | "red" | "green" | "yellow";
}

export default function MetricCard({ title, value, change, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-100",
    red: "text-red-600 bg-red-100",
    green: "text-green-600 bg-green-100",
    yellow: "text-yellow-600 bg-yellow-100"
  };

  const changeColor = change.type === "increase" ? "text-green-600" : "text-red-600";
  const changeIcon = change.type === "increase" ? "↑" : "↓";

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`p-2 rounded-md ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
            <span className={`text-sm font-medium ${changeColor} flex items-center`}>
              {changeIcon} {change.value}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
