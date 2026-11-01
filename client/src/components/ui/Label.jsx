import { cn } from '../../utils/cn';

export default function Label({ children, className = '', ...props }) {
  return (
    <label className={cn('mb-1.5 block text-sm font-medium text-fg', className)} {...props}>
      {children}
    </label>
  );
}
