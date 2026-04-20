// Logo Component

interface LogoProps {
  className?: string;
  fillClassName?: string;
}

export function Logo({
  className = "h-10 w-auto",
}: LogoProps) {
  return (
    <img
      src="/Kuponovo.svg"
      alt="Kuponovo.bg"
      className={className}
    />
  );
}
