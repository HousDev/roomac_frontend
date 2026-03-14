import { CheckCircle, Circle, Clock } from 'lucide-react';

interface WorkflowStep {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface WorkflowProgressBarProps {
  currentStatus: 'Created' | 'Shared' | 'Viewed' | 'Verified' | 'Completed';
  compact?: boolean;
}

export function WorkflowProgressBar({ currentStatus, compact = false }: WorkflowProgressBarProps) {
  const statusOrder = ['Created', 'Shared', 'Viewed', 'Verified', 'Completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const steps: WorkflowStep[] = statusOrder.map((status, index) => ({
    label: status,
    status: index < currentIndex ? 'completed' : index === currentIndex ? 'active' : 'pending'
  }));

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {steps.map((step, index) => (
            <div key={step.label} className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${
                  step.status === 'completed'
                    ? 'bg-green-500'
                    : step.status === 'active'
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }`}
                title={step.label}
              />
              {index < steps.length - 1 && (
                <div
                  className={`w-3 h-0.5 ${
                    step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <span className="text-xs font-medium text-gray-600">
          {currentIndex + 1}/{steps.length}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center relative flex-1">
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className={`flex-1 h-1 transition-all duration-300 ${
                      step.status === 'completed' || steps[index - 1].status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                )}
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'active'
                      ? 'bg-blue-500 text-white ring-4 ring-blue-100'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : step.status === 'active' ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Circle className="w-4 h-4" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 transition-all duration-300 ${
                      step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium mt-1 text-center ${
                  step.status === 'active'
                    ? 'text-blue-600 font-bold'
                    : step.status === 'completed'
                    ? 'text-green-600'
                    : 'text-gray-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
