import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceAgent {
  agent: string;
  ticketsTraites: number;
  tempsResolution: number;
  satisfaction: number;
}

interface AgentPerformanceChartProps {
  data: PerformanceAgent[];
}

export default function AgentPerformanceChart({ data }: AgentPerformanceChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="agent" />
        <YAxis yAxisId="left" />
        <YAxis yAxisId="right" orientation="right" />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Bar yAxisId="left" dataKey="ticketsTraites" fill="#3b82f6" name="Tickets traités" />
        <Bar yAxisId="right" dataKey="satisfaction" fill="#10b981" name="Satisfaction %" />
      </BarChart>
    </ResponsiveContainer>
  );
}
