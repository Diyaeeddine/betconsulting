import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SatisfactionData {
  periode: string;
  satisfaction: number;
  objectif: number;
}

interface SatisfactionChartProps {
  data: SatisfactionData[];
}

export default function SatisfactionChart({ data }: SatisfactionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="periode" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value}%`, ""]}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Bar dataKey="satisfaction" fill="#3b82f6" name="Satisfaction" />
        <Bar dataKey="objectif" fill="#e5e7eb" name="Objectif" />
      </BarChart>
    </ResponsiveContainer>
  );
}
