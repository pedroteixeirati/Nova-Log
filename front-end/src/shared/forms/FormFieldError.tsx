import React from 'react';

interface FormFieldErrorProps {
  message?: string;
}

export default function FormFieldError({ message }: FormFieldErrorProps) {
  if (!message) return null;

  return <p className="pl-1 text-xs font-medium text-error">{message}</p>;
}
