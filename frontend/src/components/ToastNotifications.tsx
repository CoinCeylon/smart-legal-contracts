
import React from 'react';
import { toast } from "@/hooks/use-toast";
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export const showSuccessToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "border-green-200 bg-green-50 text-green-800",
    action: <CheckCircle className="h-4 w-4 text-green-600" />,
  });
};

export const showWarningToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "border-yellow-200 bg-yellow-50 text-yellow-800",
    action: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  });
};

export const showErrorToast = (title: string, description?: string) => {
  toast({
    variant: "destructive",
    title,
    description,
    action: <XCircle className="h-4 w-4" />,
  });
};

export const showInfoToast = (title: string, description?: string) => {
  toast({
    title,
    description,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    action: <Info className="h-4 w-4 text-blue-600" />,
  });
};

// Utility function to show toast based on type
export const showToast = (
  type: 'success' | 'warning' | 'error' | 'info',
  title: string,
  description?: string
) => {
  switch (type) {
    case 'success':
      showSuccessToast(title, description);
      break;
    case 'warning':
      showWarningToast(title, description);
      break;
    case 'error':
      showErrorToast(title, description);
      break;
    case 'info':
      showInfoToast(title, description);
      break;
  }
};
