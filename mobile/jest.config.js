module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-vector-icons|react-native-paper|react-native-safe-area-context|@react-navigation|react-native-screens|react-native-ble-plx|react-native-ble-advertiser|react-native-permissions|react-native-get-random-values|react-native-fs|react-native-share|react-native-image-picker|@react-native-documents|@react-native-async-storage|@react-native-google-signin|react-native-webrtc|uuid|react-native-get-random-values)/)',
  ],
};
