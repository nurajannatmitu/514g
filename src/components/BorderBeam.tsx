import React from 'react';

export const BorderBeam: React.FC<{
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}> = ({
  className = '',
  size = 200,
  duration = 12,
  colorFrom = '#d47a3a',
  colorTo = 'transparent',
}) => {
  return (
    <div
      style={
        {
          '--size': `${size}px`,
          '--duration': `${duration}s`,
          '--color-from': colorFrom,
          '--color-to': colorTo,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:1px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[var(--size)] after:animate-[border-beam_var(--duration)_infinite_linear] after:[animation-play-state:running] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--size)/2)_50%] after:[offset-path:rect(0_auto_auto_0_round_inherit)] ${className}`}
    />
  );
};
