import { SwipeButton } from '@/components';
import { Colors, Spacing } from '@/constants';
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
  return (
    <View style={styles.completeDeliveryContainer}>
      <SwipeButton
        onSwipeComplete={onSwipeComplete}
        text={isLoading ? 'Completing delivery...' : text}
        isLoading={isLoading}
        iconName="checkmark"
        backgroundColor={Colors.light.success}
        style={styles.completeDeliveryButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  completeDeliveryContainer: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  completeDeliveryButton: {
    marginBottom: 0,
  },
});

export default CompleteDeliveryButton;
