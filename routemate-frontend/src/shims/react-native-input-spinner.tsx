import type { CSSProperties } from 'react';

interface InputSpinnerProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
  buttonStyle?: CSSProperties;
  buttonTextStyle?: CSSProperties;
  textColor?: string;
  style?: CSSProperties;
}

export default function InputSpinner({
  value,
  min = 1,
  max = 99,
  step = 1,
  onChange,
  buttonStyle,
  buttonTextStyle,
  textColor,
  style,
}: InputSpinnerProps) {
  function clamp(nextValue: number) {
    return Math.min(max, Math.max(min, nextValue));
  }

  return (
    <div className="input-spinner" style={style}>
      <button
        type="button"
        className="input-spinner__button"
        style={buttonStyle}
        onClick={() => onChange?.(clamp(value - step))}
        aria-label="Decrease value"
      >
        <span style={buttonTextStyle}>-</span>
      </button>

      <div className="input-spinner__value" style={{ color: textColor }}>
        {value}
      </div>

      <button
        type="button"
        className="input-spinner__button"
        style={buttonStyle}
        onClick={() => onChange?.(clamp(value + step))}
        aria-label="Increase value"
      >
        <span style={buttonTextStyle}>+</span>
      </button>
    </div>
  );
}
