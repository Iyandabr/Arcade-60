import { motion, type HTMLMotionProps } from "framer-motion";

type Props = Omit<HTMLMotionProps<"button">, "whileTap"> & {
  variant?: "primary" | "secondary" | "ghost";
  size?:    "sm" | "md" | "lg";
};

const variants = {
  primary:   "bg-neon text-black font-bold hover:opacity-90 disabled:opacity-40",
  secondary: "bg-card border border-border text-white hover:border-white/30 disabled:opacity-40",
  ghost:     "text-gray-400 hover:text-white disabled:opacity-40",
};

const sizes = {
  sm: "px-4 py-2 text-xs rounded-lg",
  md: "px-5 py-3 text-sm rounded-xl",
  lg: "px-6 py-4 text-base rounded-xl",
};

export function Button({ variant = "secondary", size = "md", className = "", children, disabled, ...props }: Props) {
  return (
    <motion.button
      whileTap={{ scale: disabled ? 1 : 0.97 }}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 select-none ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
