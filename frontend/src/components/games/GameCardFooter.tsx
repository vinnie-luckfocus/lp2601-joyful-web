import { MapPin } from 'lucide-react';

export interface GameCardFooterProps {
  location: string;
}

export const GameCardFooter: React.FC<GameCardFooterProps> = ({ location }) => {
  return (
    <div className="flex items-center gap-2 text-gray-500 pt-3 border-t border-gray-100">
      <MapPin size={14} />
      <span className="text-xs truncate">{location}</span>
    </div>
  );
};
