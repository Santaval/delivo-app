import { SwipeButton } from '@/components';
import { Spacing } from '@/constants';
import { useThemeColor } from '@/hooks/useColorScheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

type CompleteDeliveryButtonProps = {
  onSwipeComplete: () => void;
  isLoading?: boolean;
  text?: string;
};

const CompleteDeliveryButton: React.FC<CompleteDeliveryButtonProps> = ({
  onSwipeComplete,
  isLoading = false,
  text = 'Slide to complete delivery',
}) => {
  const colors = useThemeColor();
  return (
    <View style={[styles.completeDeliveryContainer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
      <SwipeButton
        onSwipeComplete={onSwipeComplete}
        text={isLoading ? 'Completing delivery...' : text}
        isLoading={isLoading}
        iconName="checkmark"
        backgroundColor={colors.success}
        style={styles.completeDeliveryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  completeDeliveryContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  completeDeliveryButton: {
    marginBottom: 0,
  },
});

export default CompleteDeliveryButton;
