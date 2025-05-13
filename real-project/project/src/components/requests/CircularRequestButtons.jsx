import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

/**
 * Circular icon-only buttons for request approval/rejection
 */
const CircularRequestButtons = ({
  onApprove,
  onReject,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Button
        variant="outline"
        size="icon-xs"
        rounded="full"
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        onClick={onReject}
      >
        <XCircle className="h-4 w-4" />
        <span className="sr-only">Reject</span>
      </Button>
      <Button
        size="icon-xs"
        rounded="full"
        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
        onClick={onApprove}
      >
        <CheckCircle className="h-4 w-4" />
        <span className="sr-only">Approve</span>
      </Button>
    </div>
  );
};

export default CircularRequestButtons;
