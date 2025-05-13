// This is a shim for web and Android where the tab bar is generally opaque.
import { View } from 'react-native';

export default function TabBarBackground() {
  return <View style={{ flex: 1 }} />;
}

export function useBottomTabOverflow() {
  return 0;
}
