import { getCurrencySymbol } from '@/utils/currency';
import React from 'react';
import { Text } from 'react-native';

type CurrencyTextProps = {
  amount: number;
  currency?: string;
  style?: any;
};

export default function CurrencyText({ amount, currency = 'CRC', style }: CurrencyTextProps) {
  return (
    <Text style={style}>{`${getCurrencySymbol(currency)}${amount.toFixed(2)}`}</Text>
  )
}