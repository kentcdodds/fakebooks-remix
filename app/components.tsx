export function LabelText({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12px] font-medium uppercase leading-[24px] text-gray-400">
      {children}
    </div>
  );
}
