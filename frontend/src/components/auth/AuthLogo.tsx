// components/auth/AuthLogo.tsx
export default function AuthLogo({ variant = 'default' }: { variant?: 'default' | 'red' }) {
  return (
    <img
      src={variant === 'red' ? '/assets/yapred.svg' : '/assets/yapwhite.svg'}
      alt="YAP Logo"
      className="h-[56px] w-auto"
    />
  );
}
