interface StatCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, highlight = false, className = '', delay = 0 }: StatCardProps) {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${className}`}
      style={{
        animation: `fadeInUp 0.4s ease-out ${delay}ms both`,
      }}
    >
      <div
        className={`text-2xl md:text-3xl font-bold mb-1 ${highlight ? 'text-[#BF0D3E]' : 'text-[#041E42]'}`}
      >
        {value}
      </div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

export default StatCard;
