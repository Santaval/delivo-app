import { PrimaryButton, ThemedText, ThemedView } from '@/components';
import { BorderRadius, Spacing, Typography } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';

type DeletedProductsWarningModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const DeletedProductsWarningModal: React.FC<DeletedProductsWarningModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const colors = useThemeColor();
  const { t } = useTranslation();

  const handleConfirm = () => {
    onClose();
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="warning" size={48} color={colors.danger} />
            </View>

            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t('deletedProductsWarning')}
            </ThemedText>

            <ThemedText style={[styles.message, { color: colors.textSecondary }]}>
              {t('deletedProductsWarningMessage')}
            </ThemedText>

            <View style={styles.actions}>
              <PrimaryButton
                title={t('cancel')}
                onPress={onClose}
                variant="outline"
                style={styles.cancelButton}
              />

              <PrimaryButton
                title={t('generateAnyway')}
                onPress={handleConfirm}
                style={styles.confirmButton}
              />
            </View>
          </ThemedView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  message: {
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  actions: {
    width: '100%',
    gap: Spacing.md,
  },
  cancelButton: {
    marginBottom: Spacing.sm,
  },
  confirmButton: {},
});

export default DeletedProductsWarningModal;