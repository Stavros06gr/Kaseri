import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Download, UploadCloud } from 'lucide-react-native';

interface Props {
  onBackup: () => void;
  onRestore: () => void;
  isDark: boolean;
}

export default function BackupControls({ onBackup, onRestore, isDark }: Props) {
  const cardBg = isDark ? '#2D2D2D' : '#F3F4F6';
  const textColor = isDark ? '#FFFFFF' : '#111827';

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, { backgroundColor: cardBg }]} onPress={onBackup}>
        <Download size={18} color="#2563EB" />
        <Text style={[styles.btnText, { color: textColor }]}>Create Backup</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.btn, { backgroundColor: cardBg }]} onPress={onRestore}>
        <UploadCloud size={18} color="#10B981" />
        <Text style={[styles.btnText, { color: textColor }]}>Restore Data</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  btnText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
});