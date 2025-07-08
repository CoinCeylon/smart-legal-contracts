
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info, XCircle, AlertOctagon } from 'lucide-react';
import { cn } from "@/lib/utils";

export type AlertVariant = 'success' | 'warning' | 'error' | 'info' | 'destructive';

interface AlertSystemProps {
  variant: AlertVariant;
  title?: string;
  description: string;
  className?: string;
  showIcon?: boolean;
}

const alertConfig = {
  success: {
    icon: CheckCircle,
    className: "border-green-200 bg-green-50 text-green-800 [&>svg]:text-green-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800 [&>svg]:text-yellow-600",
  },
  error: {
    icon: XCircle,
    className: "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
  },
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-800 [&>svg]:text-blue-600",
  },
  destructive: {
    icon: AlertOctagon,
    className: "border-red-200 bg-red-50 text-red-800 [&>svg]:text-red-600",
  },
};

export const AlertSystem: React.FC<AlertSystemProps> = ({
  variant,
  title,
  description,
  className,
  showIcon = true,
}) => {
  const config = alertConfig[variant];
  const Icon = config.icon;

  return (
    <Alert className={cn(config.className, className)}>
      {showIcon && <Icon className="h-4 w-4" />}
      {title && <AlertTitle>{title}</AlertTitle>}
      <AlertDescription>{description}</AlertDescription>
    </Alert>
  );
};

// Convenience components for common use cases
export const SuccessAlert: React.FC<Omit<AlertSystemProps, 'variant'>> = (props) => (
  <AlertSystem variant="success" {...props} />
);

export const WarningAlert: React.FC<Omit<AlertSystemProps, 'variant'>> = (props) => (
  <AlertSystem variant="warning" {...props} />
);

export const ErrorAlert: React.FC<Omit<AlertSystemProps, 'variant'>> = (props) => (
  <AlertSystem variant="error" {...props} />
);

export const InfoAlert: React.FC<Omit<AlertSystemProps, 'variant'>> = (props) => (
  <AlertSystem variant="info" {...props} />
);

export default AlertSystem;
