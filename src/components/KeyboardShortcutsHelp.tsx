"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Keyboard, X } from "lucide-react";
import { useModifierKey } from "@/lib/useModifierKey";

function ShortcutKeys({ keys }: { keys: string[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {keys.map((key, index) => (
        <kbd
          key={`${key}-${index}`}
          className="px-2 py-1 text-xs bg-[var(--bg2)] border border-[var(--rule)] rounded font-mono"
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

export default function KeyboardShortcutsHelp() {
  // Built here rather than at module scope because the search shortcut is
  // spelled per platform — see `useModifierKey`.
  const { mod } = useModifierKey();
  const shortcuts: Array<{ keys: string[]; description: string }> = [
    { keys: ["←", "→"], description: "Navigate between workshop pages" },
    { keys: ["/"], description: "Focus search bar" },
    { keys: [mod, "K"], description: "Focus search bar" },
    { keys: ["Esc"], description: "Close search or dialogs" },
    { keys: ["Home"], description: "Go to homepage" },
    { keys: ["End"], description: "Go to last workshop page" },
  ];

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="hidden md:flex fixed bottom-4 right-4 z-50 p-3 bg-[var(--bg2)] border border-[var(--rule)] rounded-full shadow-lg hover:bg-[var(--bg2)] transition-colors group"
          title="Show keyboard shortcuts"
          type="button"
        >
          <Keyboard className="w-5 h-5 text-[var(--tx2)] group-hover:text-[var(--tx)]" />
          <span className="sr-only">Open keyboard shortcuts</span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed bottom-4 right-4 z-50 max-w-sm bg-[var(--bg2)] border border-[var(--rule)] rounded-lg shadow-xl p-6 focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-semibold text-[var(--tx)]">
              Keyboard Shortcuts
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="text-[var(--tx2)] hover:text-[var(--tx)] p-1 rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center gap-3">
                <ShortcutKeys keys={shortcut.keys} />
                <span className="text-sm text-[var(--tx2)] flex-1">
                  {shortcut.description}
                </span>
              </div>
            ))}
          </div>

          <Dialog.Description className="mt-4 pt-3 border-t border-[var(--rule)] text-xs text-[var(--tx2)]">
            Press <ShortcutKeys keys={["Esc"]} /> to close this dialog.
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
