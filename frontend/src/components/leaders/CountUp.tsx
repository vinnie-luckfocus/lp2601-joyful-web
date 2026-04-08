import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

export interface CountUpProps {
  value: number;
  duration?: number;
  decimals?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 0.8,
  decimals = 0,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [hasStarted, setHasStarted] = useState(false);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) => {
    if (decimals > 0) {
      return `${prefix}${current.toFixed(decimals)}${suffix}`;
    }
    return `${prefix}${Math.round(current)}${suffix}`;
  });

  const [displayValue, setDisplayValue] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(String(latest));
    });
    return unsubscribe;
  }, [display]);

  useEffect(() => {
    // Small delay to ensure animation is visible
    const timeout = setTimeout(() => {
      setHasStarted(true);
      spring.set(value);
    }, 100);

    return () => clearTimeout(timeout);
  }, [value, spring]);

  // Reset animation when value changes
  useEffect(() => {
    if (hasStarted) {
      spring.set(0);
      spring.set(value);
    }
  }, [value, spring, hasStarted]);

  return (
    <motion.span
      className={className}
      data-testid="count-up"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      {displayValue}
    </motion.span>
  );
};

export default CountUp;
