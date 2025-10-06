import * as React from "react";

type Props = { size?: number; className?: string };

export const GeneralIcon: React.FC<Props> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       className={`transition-transform duration-200 ${className ?? ""}`}
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="whisperGeneralGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#fb7185" />
      </linearGradient>
    </defs>
    <path
      d="M4 6.5C4 4.567 5.79 3 8 3h8c2.21 0 4 1.567 4 3.5v4c0 1.933-1.79 3.5-4 3.5h-3.2L9 18.8c-.5.4-1.3.02-1.3-.6v-1.2H8c-2.21 0-4-1.567-4-3.5v-4Z"
      fill="url(#whisperGeneralGrad)"
    />
  </svg>
);

export const PraiseIcon: React.FC<Props> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       className={`transition-transform duration-200 ${className ?? ""}`}
       xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2l2.39 4.84 5.34.78-3.86 3.76.91 5.31L12 14.77 7.22 16.69l.91-5.31L4.27 7.62l5.34-.78L12 2Z"
      fill="#22c55e"
    />
  </svg>
);

export const ConcernIcon: React.FC<Props> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       className={`transition-transform duration-200 ${className ?? ""}`}
       xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2 1 21h22L12 2Z" fill="#ef4444" />
    <rect x="11" y="8" width="2" height="7" rx="1" fill="white" />
    <rect x="11" y="16.5" width="2" height="2" rx="1" fill="white" />
  </svg>
);

export const IdeaIcon: React.FC<Props> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       className={`transition-transform duration-200 ${className ?? ""}`}
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="whisperIdeaGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#22d3ee" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
    <path
      d="M12 3a7 7 0 0 1 5 11.83V17a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-1H8a1 1 0 0 1-1-1v-2.17A7 7 0 0 1 12 3Z"
      fill="url(#whisperIdeaGrad)"
    />
    <rect x="9" y="20" width="6" height="1.5" rx="0.75" fill="#0ea5e9" />
  </svg>
);

export const FunIcon: React.FC<Props> = ({ size = 18, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"
       className={`transition-transform duration-200 ${className ?? ""}`}
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="whisperFunGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f59e0b" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    <path d="M5 19c-1.1 0-2-.9-2-2V9l9-5 9 5v8a2 2 0 0 1-2 2H5Z" fill="url(#whisperFunGrad)" />
    <circle cx="9" cy="12" r="1.5" fill="white" />
    <circle cx="15" cy="12" r="1.5" fill="white" />
  </svg>
);

export type CategoryKind = "general" | "praise" | "concern" | "idea" | "fun";

/** Unified icon wrapper with gentle hover on any parent `.group` */
export const CategoryIcon = ({
  kind,
  size = 18,
  className,
}: { kind: CategoryKind; size?: number; className?: string }) => {
  const cn = `group-hover:scale-110 group-hover:-rotate-1 ${className ?? ""}`;
  switch (kind) {
    case "general": return <GeneralIcon size={size} className={cn} />;
    case "praise":  return <PraiseIcon  size={size} className={cn} />;
    case "concern": return <ConcernIcon size={size} className={cn} />;
    case "idea":    return <IdeaIcon    size={size} className={cn} />;
    case "fun":     return <FunIcon     size={size} className={cn} />;
    default:        return null;
  }
};