import { InputHTMLAttributes, ReactNode } from 'react';

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: ReactNode;
}

export function TextInput({ label, icon, ...props }: TextInputProps) {
  return (
    <label className="field-wrapper">
      <span className="field-label">{label}</span>
      <span className="field-input-wrap">
        {icon && <span className="field-icon">{icon}</span>}
        <input className="field-input" {...props} />
      </span>
    </label>
  );
}
