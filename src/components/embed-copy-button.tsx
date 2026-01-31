'use client';

interface EmbedCopyButtonProps {
  embedCode: string;
}

export function EmbedCopyButton({ embedCode }: EmbedCopyButtonProps) {
  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
  };

  return (
    <button
      type="button"
      onClick={handleCopyCode}
      className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
    >
      Copy Embed Code
    </button>
  );
}
