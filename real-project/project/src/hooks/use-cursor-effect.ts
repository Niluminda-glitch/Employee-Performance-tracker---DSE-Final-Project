import { useEffect } from 'react';
import { useCursor } from '@/context/CursorContext';

interface UseCursorEffectOptions {
  size?: number;
  color?: string;
  opacity?: number;
  blur?: string;
  disabled?: boolean;
}

/**
 * Hook to customize cursor effect for specific pages or components
 * @param options Cursor effect options
 * @param deps Dependencies array to control when the effect runs
 */
export function useCursorEffect(
  options: UseCursorEffectOptions = {},
  deps: React.DependencyList = []
) {
  const {
    setCursorSize,
    setCursorColor,
    setCursorOpacity,
    setCursorBlur,
    setCursorDisabled,
    resetCursor,
  } = useCursor();

  useEffect(() => {
    // Apply custom cursor settings
    if (options.size !== undefined) setCursorSize(options.size);
    if (options.color !== undefined) setCursorColor(options.color);
    if (options.opacity !== undefined) setCursorOpacity(options.opacity);
    if (options.blur !== undefined) setCursorBlur(options.blur);
    if (options.disabled !== undefined) setCursorDisabled(options.disabled);

    // Reset cursor settings when component unmounts
    return () => {
      resetCursor();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    setCursorSize,
    setCursorColor,
    setCursorOpacity,
    setCursorBlur,
    setCursorDisabled,
    resetCursor,
  };
}
