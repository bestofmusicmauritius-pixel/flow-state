export function EmptyState({ children }: { children: string }) {
  return (
    <p className="font-mono text-xs text-text-faint text-center py-6 px-3">
      {children}
    </p>
  );
}
