// AuthButtons.tsx
// This component renders authentication buttons for login and sign-up.

interface AuthButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  className?: string;
}

const AuthButton: React.FC<AuthButtonProps> = ({
  icon,
  label,
  onClick,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full py-3 my-2 rounded-full 
              bg-quaternary text-secondary shadow-sm border border-gray-300 hover:shadow-md transition"
    >
      <span className="mr-2">{icon}</span>
      <span>{label}</span>
    </button>
  );
};
export default AuthButton;
