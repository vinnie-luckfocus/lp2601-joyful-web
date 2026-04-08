import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = '出错了',
  message = '加载数据时发生错误，请稍后重试',
  onRetry,
  retryLabel = '重试',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      data-testid="error-state"
    >
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-error" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      <p className="text-gray-500 mb-6 max-w-sm">
        {message}
      </p>

      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          leftIcon={<RefreshCw size={16} />}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorBoundaryStateProps extends ErrorStateProps {
  error?: Error;
}

export const ErrorBoundaryState: React.FC<ErrorBoundaryStateProps> = ({
  title = '页面出错了',
  message = '应用程序发生错误，请刷新页面重试',
  error,
  onRetry,
  retryLabel = '刷新页面',
  className = '',
}) => {
  const handleRefresh = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-8 bg-gray-50 ${className}`}
      data-testid="error-boundary-state"
    >
      <div className="bg-white rounded-card shadow-card p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-error" />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-3">
          {title}
        </h2>

        <p className="text-gray-500 mb-4">
          {message}
        </p>

        {error && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left overflow-auto">
            <p className="text-sm text-gray-600 font-mono">
              {error.message}
            </p>
          </div>
        )}

        <Button
          onClick={handleRefresh}
          variant="primary"
          leftIcon={<RefreshCw size={16} />}
        >
          {retryLabel}
        </Button>
      </div>
    </div>
  );
};

export default ErrorState;
