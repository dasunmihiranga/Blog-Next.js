"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import React from 'react';

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
};

interface ButtonProps {
  children: React.ReactNode;
  pendingText: string;
  isLoading?: boolean; // Add the `isLoading` prop
}

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} {...props}>
      {pending ? pendingText : children}
    </Button>
  );
}

export const SubmitButton1 = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, pendingText, isLoading = false, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        disabled={isLoading}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        {isLoading ? pendingText : children}
      </button>
    );
  }
);

SubmitButton.displayName = 'SubmitButton';
