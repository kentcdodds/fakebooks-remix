export function LabelText({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-medium uppercase leading-[24px] text-gray-400">
      {children}
    </div>
  );
}

export function FullFakebooksLogo({
  size,
  position,
}: {
  size: "sm" | "lg";
  position: "left" | "center";
}) {
  const [logoSize, textSize] = {
    sm: [`h-4 w-4`, `text-d-p-sm`],
    lg: [`h-12 w-12`, `text-d-h2`],
  }[size];
  return (
    <div
      className={`flex items-center ${
        position === "center" ? "justify-center" : ""
      } text-[color:#23BF1F]`}
    >
      <FakebooksLogo className={`relative top-[1px] ${logoSize}`} />
      <div className="w-1" />
      <div className={`font-display ${textSize}`}>Fakebooks</div>
    </div>
  );
}

export function FakebooksLogo({ className }: { className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#23BF1F"
        fillRule="evenodd"
        d="M12 3a9 9 0 000 18h4.5c1.398 0 2.097 0 2.648-.228a3 3 0 001.624-1.624C21 18.597 21 17.898 21 16.5V12a9 9 0 00-9-9zm-4 8a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm3 4a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function FilePlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24px" height="24px" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11.25 19.25h-3.5a2 2 0 0 1-2-2V6.75a2 2 0 0 1 2-2H14L18.25 9v2.25M17 14.75v4.5M19.25 17h-4.5"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18 9.25h-4.25V5"
      />
    </svg>
  );
}

export function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24px" height="24px" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 5.75v12.5M18.25 12H5.75"
      />
    </svg>
  );
}

export function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="24px" height="24px" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.25 12.25H5.75"
      />
    </svg>
  );
}
