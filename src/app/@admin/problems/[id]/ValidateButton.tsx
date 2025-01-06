'use client';

interface ValidateButtonProps {
  onValidate: () => Promise<void>;
  isValidating: boolean;
  className?: string;
}

export default function ValidateButton({ onValidate, isValidating, className }: ValidateButtonProps) {
  return (
    <button
      type="button"
      onClick={onValidate}
      disabled={isValidating}
      className={className}
    >
      {isValidating ? 'Validating...' : 'Validate All'}
    </button>
  );
}