import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { ChevronRight } from 'lucide-react-native';

interface Props {
  icon: React.ReactNode;
  title: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDark: boolean;
}

export default function SettingOptionRow({ icon, title, value, onPress, rightElement, isDark }: Props) {
  const textColor = isDark ? '#FFFFFF' : '#111827';
  const mutedColor = isDark ? '#9CA3AF' : '#6B7280';

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.leftContainer}>
        <View style={styles.iconWrapper}>{icon}</View>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
      </View>
      
      <View style={styles.rightContainer}>
        {value && <Text style={[styles.value, { color: mutedColor }]}>{value}</Text>}
        {rightElement}
        {onPress && !rightElement && <ChevronRight size={16} color="#9CA3AF" />}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    marginRight: 14,
    width: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '500',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    marginRight: 8,
  },
});