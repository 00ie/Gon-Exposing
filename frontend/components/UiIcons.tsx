import type { ReactNode } from "react";


type IconProps = {
  className?: string;
};

function iconBox(path: ReactNode, className = "h-4 w-4") {
  return (
    <svg aria-hidden="true" className={className} fill="none" viewBox="0 0 24 24">
      {path}
    </svg>
  );
}

export function HomeIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M9.5 20v-5h5v5" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function SearchIcon({ className }: IconProps) {
  return iconBox(
    <>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m16 16 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function ReportIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="M7 3.75h7l4 4V20H7V3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M14 3.75v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M10 11h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M10 15h5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function LearnIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21V5.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M8.5 7h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <path d="M8.5 11h6" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function GithubIcon({ className }: IconProps) {
  return iconBox(
    <path
      d="M12 4a8 8 0 0 0-2.53 15.59c.4.07.54-.17.54-.38v-1.34c-2.19.48-2.65-.93-2.65-.93-.36-.92-.87-1.16-.87-1.16-.71-.49.06-.48.06-.48.79.05 1.2.8 1.2.8.69 1.18 1.83.84 2.28.64.07-.5.27-.84.49-1.03-1.75-.2-3.58-.87-3.58-3.86 0-.85.3-1.54.8-2.08-.08-.2-.35-1 .08-2.08 0 0 .65-.21 2.14.8a7.4 7.4 0 0 1 3.9 0c1.49-1.01 2.14-.8 2.14-.8.43 1.08.16 1.88.08 2.08.5.54.8 1.23.8 2.08 0 3-1.83 3.66-3.58 3.86.28.24.53.72.53 1.46v2.17c0 .21.14.45.55.38A8 8 0 0 0 12 4Z"
      fill="currentColor"
    />,
    className
  );
}

export function DiscordIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path
        d="M18.5 7.5a13.5 13.5 0 0 0-3.34-1.04l-.16.32a12.18 12.18 0 0 0-6 0l-.16-.32A13.5 13.5 0 0 0 5.5 7.5C3.8 10.02 3.38 12.47 3.6 14.88A13.8 13.8 0 0 0 7.72 17l.88-1.42c-.48-.18-.94-.4-1.38-.65l.33-.26c2.66 1.22 5.54 1.22 8.17 0l.33.26c-.44.25-.9.47-1.38.65l.88 1.42a13.8 13.8 0 0 0 4.12-2.12c.3-2.78-.5-5.2-1.17-7.38Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.3"
      />
      <circle cx="9.25" cy="12.25" r="1.1" fill="currentColor" />
      <circle cx="14.75" cy="12.25" r="1.1" fill="currentColor" />
    </>,
    className
  );
}

export function TelegramIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="m20 5-2.4 13.2c-.18.95-.68 1.19-1.38.74l-3.82-2.82-1.84 1.77c-.2.2-.38.38-.76.38l.27-3.92 7.13-6.45c.31-.27-.06-.42-.48-.15L7.91 13.3l-3.78-1.18c-.82-.26-.84-.82.17-1.22L19 5.28c.68-.25 1.28.15 1 .72Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.3" />
    </>,
    className
  );
}

export function ShieldIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="M12 3.5 18.5 6v5.8c0 4.1-2.54 6.74-6.5 8.7-3.96-1.96-6.5-4.6-6.5-8.7V6L12 3.5Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="m9.25 12.25 1.75 1.75 3.75-4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function LockIcon({ className }: IconProps) {
  return iconBox(
    <>
      <rect x="6" y="10" width="12" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 10V7.75a3.5 3.5 0 1 1 7 0V10" stroke="currentColor" strokeWidth="1.5" />
    </>,
    className
  );
}

export function FileIcon({ className }: IconProps) {
  return iconBox(
    <>
      <path d="M7 3.75h7l4 4V20H7V3.75Z" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
      <path d="M14 3.75v4h4" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.5" />
    </>,
    className
  );
}

export function CopyIcon({ className }: IconProps) {
  return iconBox(
    <>
      <rect x="9" y="9" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 9V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" stroke="currentColor" strokeWidth="1.5" />
    </>,
    className
  );
}
