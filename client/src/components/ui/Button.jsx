const VARIANTS = {
  primary: "bg-ink-700 text-white hover:bg-ink-800 focus-visible:ring-ink-700",
  outline: "border border-ink-700 text-ink-700 hover:bg-ink-50 focus-visible:ring-ink-700",
  ghost: "text-ink-700 hover:bg-ink-50 focus-visible:ring-ink-700",
  subtle: "bg-ink-50 text-ink-800 hover:bg-ink-100 focus-visible:ring-ink-700",
  danger: "bg-accent-red text-white hover:opacity-90 focus-visible:ring-accent-red",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  as: Tag = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Tag>
  );
}
