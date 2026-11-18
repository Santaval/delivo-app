import { SwipeButton } from '@/components';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

type CompleteDeliveryButtonProps = {
  onSwipeComplete: () => void;
  isLoading?: boolean;
  text?: string;
};

const CompleteDeliveryButton: React.FC<CompleteDeliveryButtonProps> = ({
  onSwipeComplete,
  isLoading = false,
  text,
}) => {
  const colors = useThemeColor();
  const { t } = useTranslation();
  // No container chrome: it's rendered in the route sheet's sticky footer,
  // which provides the padding and top border.
  return (
    <SwipeButton
      onSwipeComplete={onSwipeComplete}
      text={isLoading ? t('completingDelivery') : (text ?? t('slideToCompleteDelivery'))}
      isLoading={isLoading}
      iconName="checkmark"
      backgroundColor={colors.success}
      style={styles.completeDeliveryButton}
    />
  );
};

const styles = StyleSheet.create({
  completeDeliveryButton: {
    marginBottom: 0,
  },
});

export default CompleteDeliveryButton;
