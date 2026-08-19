import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'relative inline-flex items-center justify-center gap-2 rounded-md font-semibold font-display tracking-tight transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';

  const variants = {
    primary:
      'bg-gradient-to-b from-[#4a93ff] to-primary text-white shadow-glow hover:shadow-[0_0_0_1px_rgba(46,123,255,0.3),0_14px_36px_rgba(46,123,255,0.35)] hover:-translate-y-0.5 shine-hover',
    secondary:
      'glass text-ink hover:border-primary/40 hover:-translate-y-0.5',
    ghost:
      'bg-transparent text-ink-variant hover:bg-white/50',
    danger:
      'bg-danger text-white hover:bg-danger/90 shadow-glow',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-lg',
    md: 'px-5 py-2.5 text-base rounded-lg',
    lg: 'px-7 py-3.5 text-lg rounded-md',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
