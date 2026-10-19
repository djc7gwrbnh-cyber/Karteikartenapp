// Globale Dialoge: Bestätigen, Aktionsmenü, Texteingabe und kurze Hinweise.
import type { UiIcon } from './icons';

export interface ActionItem {
  id: string;
  label: string;
  icon?: UiIcon;
  destructive?: boolean;
}

export type DialogRequest =
  | {
      kind: 'confirm';
      id: number;
      title: string;
      message?: string;
      confirmLabel: string;
      cancelLabel: string;
      destructive: boolean;
      resolve: (ok: boolean) => void;
    }
  | {
      kind: 'actions';
      id: number;
      title?: string;
      items: ActionItem[];
      resolve: (id: string | null) => void;
    };

export interface Toast {
  id: number;
  text: string;
  action?: { label: string; run: () => void };
}

export const overlays = $state<{ dialogs: DialogRequest[]; toasts: Toast[] }>({ dialogs: [], toasts: [] });

let counter = 0;

function close(id: number) {
  overlays.dialogs = overlays.dialogs.filter((d) => d.id !== id);
}

export function confirmDialog(opts: {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const id = ++counter;
    overlays.dialogs.push({
      kind: 'confirm',
      id,
      title: opts.title,
      message: opts.message,
      confirmLabel: opts.confirmLabel ?? 'OK',
      cancelLabel: opts.cancelLabel ?? 'Abbrechen',
      destructive: opts.destructive ?? false,
      resolve: (ok) => {
        close(id);
        resolve(ok);
      }
    });
  });
}

export function actionSheet(items: ActionItem[], title?: string): Promise<string | null> {
  return new Promise((resolve) => {
    const id = ++counter;
    overlays.dialogs.push({
      kind: 'actions',
      id,
      title,
      items,
      resolve: (choice) => {
        close(id);
        resolve(choice);
      }
    });
  });
}

export function toast(text: string, action?: Toast['action'], opts: { persistent?: boolean } = {}) {
  const id = ++counter;
  overlays.toasts = [...overlays.toasts.slice(-1), { id, text, action }];
  if (!opts.persistent) {
    setTimeout(() => {
      overlays.toasts = overlays.toasts.filter((t) => t.id !== id);
    }, action ? 4500 : 2600);
  }
}

export function dismissToast(id: number) {
  overlays.toasts = overlays.toasts.filter((t) => t.id !== id);
}
