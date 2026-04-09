import { motion } from 'framer-motion';

export interface AttendanceButtonsProps {
  myStatus: 'confirmed' | 'declined' | null;
  onConfirm: () => void;
  onDecline: () => void;
  isLoading?: boolean;
}

export const AttendanceButtons: React.FC<AttendanceButtonsProps> = ({
  myStatus,
  onConfirm,
  onDecline,
  isLoading = false,
}) => {
  const isConfirmed = myStatus === 'confirmed';
  const isDeclined = myStatus === 'declined';

  return (
    <div className="flex items-center gap-3">
      <motion.button
        type="button"
        onClick={onConfirm}
        disabled={isLoading}
        whileTap={{ scale: 0.95 }}
        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 active:scale-95 ${
          isConfirmed
            ? 'bg-[#BF0D3E] text-white ring-2 ring-[#BF0D3E] ring-offset-2'
            : 'bg-[#BF0D3E] text-white hover:bg-[#A00B34]'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        data-testid="confirm-button"
      >
        参加
      </motion.button>
      <motion.button
        type="button"
        onClick={onDecline}
        disabled={isLoading}
        whileTap={{ scale: 0.95 }}
        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 active:scale-95 ${
          isDeclined
            ? 'bg-gray-200 text-gray-700 ring-2 ring-gray-400 ring-offset-2'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        data-testid="decline-button"
      >
        不参加
      </motion.button>
    </div>
  );
};

export default AttendanceButtons;
