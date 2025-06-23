import React from 'react';
import { Modal, View, ActivityIndicator, StyleSheet } from 'react-native';

const LoadingModal = ({ modalVisible }) => (
  <Modal
    visible={modalVisible}
    transparent={true}
    animationType="fade"
    statusBarTranslucent={true}
  >
    <View style={styles.overlay}>
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // dark translucent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    padding: 20,
    backgroundColor: '#333',
    borderRadius: 10,
  },
});

export default LoadingModal;
