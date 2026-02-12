import { motion } from 'framer-motion';

interface IconProps {
  src: string;
  size?: number;
  className?: string;
}

export const Icon = ({ src, size = 20, className = '' }: IconProps) => {
  return (
    <motion.img 
      src={src} 
      alt="" 
      width={size} 
      height={size} 
      className={`inline-block ${className}`}
      style={{ filter: 'brightness(1)' }}
    />
  );
};
