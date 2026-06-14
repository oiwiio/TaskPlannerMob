import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/constants/theme';

export default function App() {
  return (
    <SafeAreaView style={styles.root}>
      <HomeScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex:            1,
    backgroundColor: colors.bg,
  },
});