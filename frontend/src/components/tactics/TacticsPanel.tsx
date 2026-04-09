import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { Tactics } from '../../hooks/useLineup';

interface SectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  delay?: number;
}

function CollapsibleSection({ title, isOpen, onToggle, children, delay = 0 }: SectionProps) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
      style={{
        animation: `fadeInUp 0.3s ease-out ${delay}ms both`,
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-[#041E42]">{title}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div
        className="transition-all duration-300 ease-in-out"
        style={{
          maxHeight: isOpen ? '500px' : '0',
          opacity: isOpen ? 1 : 0,
          overflow: 'hidden',
        }}
      >
        <div className="px-4 pb-4 border-l-4 border-[#BF0D3E] ml-4 mr-0 mt-1">
          {children}
        </div>
      </div>
    </div>
  );
}

interface TacticsPanelProps {
  tactics: Tactics;
  className?: string;
}

export function TacticsPanel({ tactics, className = '' }: TacticsPanelProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    notes: true,
    signals: false,
    defense: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const hasNotes = !!tactics.general_notes;
  const hasSignals = Object.keys(tactics.signals || {}).length > 0;
  const hasDefense = !!tactics.defense_strategy;

  if (!hasNotes && !hasSignals && !hasDefense) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 text-center text-gray-500 ${className}`}>
        暂无战术安排
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {hasNotes && (
        <CollapsibleSection
          title="总体战术"
          isOpen={openSections.notes}
          onToggle={() => toggleSection('notes')}
          delay={0}
        >
          <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
            {tactics.general_notes}
          </p>
        </CollapsibleSection>
      )}

      {hasSignals && (
        <CollapsibleSection
          title="暗号"
          isOpen={openSections.signals}
          onToggle={() => toggleSection('signals')}
          delay={80}
        >
          <ul className="space-y-2">
            {Object.entries(tactics.signals).map(([key, value]) => (
              <li key={key} className="flex items-start text-sm">
                <span className="inline-block px-2 py-0.5 bg-[#041E42] text-white rounded text-xs font-medium mr-2 shrink-0">
                  {key}
                </span>
                <span className="text-gray-700">{value}</span>
              </li>
            ))}
          </ul>
        </CollapsibleSection>
      )}

      {hasDefense && (
        <CollapsibleSection
          title="防守策略"
          isOpen={openSections.defense}
          onToggle={() => toggleSection('defense')}
          delay={160}
        >
          <p className="text-gray-700 whitespace-pre-line text-sm leading-relaxed">
            {tactics.defense_strategy}
          </p>
        </CollapsibleSection>
      )}
    </div>
  );
}

export default TacticsPanel;
