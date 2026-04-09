import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';

interface RadarAbilityChartProps {
  data: {
    batting_avg: number;
    hits: number;
    hr: number;
    rbi: number;
    runs: number;
  };
  className?: string;
}

export function RadarAbilityChart({ data, className = '' }: RadarAbilityChartProps) {
  // Normalize values to 0-100 scale for radar display
  const chartData = [
    { subject: '打击', A: Math.min(data.batting_avg * 200, 100), fullMark: 100 },
    { subject: '安打', A: Math.min(data.hits * 5, 100), fullMark: 100 },
    { subject: '本垒打', A: Math.min(data.hr * 20, 100), fullMark: 100 },
    { subject: '打点', A: Math.min(data.rbi * 10, 100), fullMark: 100 },
    { subject: '得分', A: Math.min(data.runs * 10, 100), fullMark: 100 },
  ];

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 ${className}`}>
      <h3 className="text-sm font-semibold text-gray-700 mb-4">五维能力图</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#4B5563' }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="能力值"
              dataKey="A"
              stroke="#BF0D3E"
              strokeWidth={2}
              fill="#041E42"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RadarAbilityChart;
