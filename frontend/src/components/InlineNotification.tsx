import React from "react";
import { AlertTriangle, CheckCircle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotificationVariant = "success" | "warning" | "error" | "info";

interface InlineNotificationProps {
  variant: NotificationVariant;
  message: string;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

const notificationConfig = {
  success: {
    icon: CheckCircle,
    className: "bg-green-50 border-green-200 text-green-800",
    iconClassName: "text-green-500",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-yellow-50 border-yellow-200 text-yellow-800",
    iconClassName: "text-yellow-500",
  },
  error: {
    icon: XCircle,
    className: "bg-red-50 border-red-200 text-red-800",
    iconClassName: "text-red-500",
  },
  info: {
    icon: Info,
    className: "bg-blue-50 border-blue-200 text-blue-800",
    iconClassName: "text-blue-500",
  },
};

export const InlineNotification: React.FC<InlineNotificationProps> = ({
  variant,
  message,
  onDismiss,
  className,
  compact = false,
}) => {
  const config = notificationConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-4 py-3",
        compact && "px-3 py-2",
        config.className,
        className
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", config.iconClassName)} />
      <p className={cn("text-sm font-medium flex-1", compact && "text-xs")}>
        {message}
      </p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 hover:bg-black/5 rounded transition-colors"
          title="Dismiss notification"
          aria-label="Dismiss notification"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

// Convenience components
export const SuccessNotification: React.FC<
  Omit<InlineNotificationProps, "variant">
> = (props) => <InlineNotification variant="success" {...props} />;

export const WarningNotification: React.FC<
  Omit<InlineNotificationProps, "variant">
> = (props) => <InlineNotification variant="warning" {...props} />;

export const ErrorNotification: React.FC<
  Omit<InlineNotificationProps, "variant">
> = (props) => <InlineNotification variant="error" {...props} />;

export const InfoNotification: React.FC<
  Omit<InlineNotificationProps, "variant">
> = (props) => <InlineNotification variant="info" {...props} />;

export default InlineNotification;
