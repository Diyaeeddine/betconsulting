import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TendanceTicket {
  date: string;
  nouveaux: number;
  resolus: number;
  enAttente: number;
}

interface TicketTrendChartProps {
  data: TendanceTicket[];
}

export default function TicketTrendChart({ data }: TicketTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="nouveaux"
          stroke="#3b82f6"
          strokeWidth={2}
          name="Nouveaux tickets"
        />
        <Line
          type="monotone"
          dataKey="resolus"
          stroke="#10b981"
          strokeWidth={2}
          name="Tickets résolus"
        />
        <Line
          type="monotone"
          dataKey="enAttente"
          stroke="#f59e0b"
          strokeWidth={2}
          name="En attente"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
