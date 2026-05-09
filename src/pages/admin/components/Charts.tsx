import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

interface ChartProps {
  data: { name: string; value: number }[];
  height?: number;
}

const GRID  = "#2A2A2A";
const TICK  = "#666666";
const TIP   = { backgroundColor: "#1A1A1A", border: "1px solid #2A2A2A", borderRadius: "8px", color: "#F0F0F0", fontSize: 12 };

export function OverviewChart({ data, height = 280 }: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: TICK, fontSize: 12 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: TICK, fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={TIP} cursor={{ stroke: "#2A2A2A", strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" name="Orders" stroke="#22c55e" strokeWidth={2} fill="url(#areaGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function OrdersBarChart({ data, height = 280 }: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={GRID} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: TICK, fontSize: 12 }} dy={8} />
          <YAxis axisLine={false} tickLine={false} tick={{ fill: TICK, fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={TIP} cursor={{ fill: "#FFFFFF08" }} />
          <Bar dataKey="value" name="Orders" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export function PlanDistributionChart({ data, height = 260 }: ChartProps) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%" cy="45%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={TIP} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span style={{ color: TICK, fontSize: 12 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
