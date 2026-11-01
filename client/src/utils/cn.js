// Tiny class-name joiner: cn('a', cond && 'b', undefined) -> 'a b'
export const cn = (...parts) => parts.filter(Boolean).join(' ');
