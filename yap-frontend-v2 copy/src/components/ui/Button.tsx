import React from 'react';

interface AuthButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const Button: React.FC<AuthButtonProps> = ({ label, onClick, className }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-full py-3 my-2 rounded-full 
                  bg-white text-secondary shadow-sm border border-gray-300 hover:shadow-md transition"
    >
      <span>{label}</span>
    </button>
  );
};

export default Button;
