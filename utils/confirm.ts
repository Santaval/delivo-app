import i18n from '@/i18n';
import { Alert } from 'react-native';

export type ConfirmDestructiveOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  onConfirm: () => void;
};

/**
 * Native confirmation dialog for destructive actions (delete, sign out, etc.).
 * Toasts are for notifications; confirmations stay on Alert.alert so they are
 * blocking, accessible, and platform-correct.
 */
export function confirmDestructive({
  title,
  message,
  confirmLabel,
  onConfirm,
}: ConfirmDestructiveOptions) {
  Alert.alert(title, message, [
    { text: i18n.t('cancel'), style: 'cancel' },
    { text: confirmLabel ?? i18n.t('delete'), style: 'destructive', onPress: onConfirm },
  ]);
}
