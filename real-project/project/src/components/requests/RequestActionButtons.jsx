import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Reusable component for request approval/rejection buttons
 * Supports both text buttons and icon-only circular buttons
 */
const RequestActionButtons = ({
  request,
  onApprove,
  onReject,
  variant = 'text', // 'text' or 'icon'
  size = 'sm',
  className = ''
}) => {
  if (variant === 'icon') {
    return (
      <div className={`flex space-x-2 ${className}`}>
        <Button
          variant="outline"
          size="icon-xs"
          rounded="full"
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={() => onReject(request)}
        >
          <XCircle className="h-4 w-4" />
          <span className="sr-only">Reject</span>
        </Button>
        <Button
          variant="outline"
          size="icon-xs"
          rounded="full"
          className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
          onClick={() => onApprove(request)}
        >
          <CheckCircle className="h-4 w-4" />
          <span className="sr-only">Approve</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button
        variant="outline"
        size={size}
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        onClick={() => onReject(request)}
      >
        <XCircle className="h-4 w-4 mr-2" />
        Reject
      </Button>
      <Button
        variant="outline"
        size={size}
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        onClick={() => onApprove(request)}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Approve
      </Button>
    </div>
  );
};

export default RequestActionButtons;
