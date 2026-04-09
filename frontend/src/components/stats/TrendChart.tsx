import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';

interface TrendChartProps {
  data: { game_id: number; batting_avg: number }[];
  className?: string;
}

export function TrendChart({ data, className = '' }: TrendChartProps) {
  const chartData = data.map((d, i) => ({
    name: `第${i + 1}场`,
    value: d.batting_avg,
  })).reverse();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">近5场打击率趋势</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 16, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#041E42" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#041E42" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis
              domain={[0, 'auto']}
              tick={{ fontSize: 12 }}
              stroke="#9CA3AF"
              tickFormatter={(v) => v.toFixed(2)}
            />
            <Tooltip
              formatter={(value) => [typeof value === 'number' ? `${value.toFixed(3)}` : value, '打击率']}
              contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Area type="monotone" dataKey="value" stroke="none" fill="url(#trendFill)" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#041E42"
              strokeWidth={2}
              dot={{ r: 3, fill: '#BF0D3E', strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              animationDuration={800}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default TrendChart;
