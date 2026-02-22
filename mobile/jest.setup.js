// Global mocks for native modules used throughout the app

// Mock react-native-get-random-values (must be mocked before uuid import)
jest.mock('react-native-get-random-values', () => { });

// Mock BLE native modules
jest.mock('./src/ble/BleScanner', () => ({
    startScan: jest.fn(() => jest.fn()),
    stopScan: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('./src/ble/BleBroadcaster', () => ({
    startBroadcast: jest.fn().mockResolvedValue(undefined),
    stopBroadcast: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-ble-plx', () => ({
    BleManager: jest.fn().mockImplementation(() => ({
        startDeviceScan: jest.fn(),
        stopDeviceScan: jest.fn(),
        destroy: jest.fn(),
        enable: jest.fn().mockResolvedValue(undefined),
    })),
    State: { PoweredOn: 'PoweredOn' },
}));

jest.mock('react-native-ble-advertiser', () => ({
    setCompanyId: jest.fn(),
    broadcast: jest.fn(),
    stopBroadcast: jest.fn(),
    enableAdapter: jest.fn(),
}));

jest.mock('react-native-permissions', () => ({
    request: jest.fn().mockResolvedValue('granted'),
    requestMultiple: jest.fn().mockResolvedValue({}),
    check: jest.fn().mockResolvedValue('granted'),
    PERMISSIONS: {
        ANDROID: {
            BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
            BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
            BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
            ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
        },
        IOS: {
            BLUETOOTH: 'ios.permission.BLUETOOTH',
            LOCATION_WHEN_IN_USE: 'ios.permission.LOCATION_WHEN_IN_USE',
        },
    },
    RESULTS: {
        UNAVAILABLE: 'unavailable',
        DENIED: 'denied',
        GRANTED: 'granted',
        BLOCKED: 'blocked',
    },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
    multiSet: jest.fn().mockResolvedValue(undefined),
    multiRemove: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-google-signin/google-signin', () => {
    const React = require('react');
    const MockGoogleSigninButton = (props) => React.createElement('View', { testID: 'GoogleSigninButton', ...props });
    MockGoogleSigninButton.Size = { Wide: 0, Standard: 1 };
    MockGoogleSigninButton.Color = { Dark: 0, Light: 1 };
    return {
        GoogleSignin: {
            configure: jest.fn(),
            hasPlayServices: jest.fn().mockResolvedValue(true),
            hasPreviousSignIn: jest.fn().mockReturnValue(false),
            signIn: jest.fn().mockResolvedValue({ type: 'success', data: { idToken: 'mock-token' } }),
            signOut: jest.fn().mockResolvedValue(null),
        },
        GoogleSigninButton: MockGoogleSigninButton,
        statusCodes: {
            SIGN_IN_CANCELLED: 'SIGN_IN_CANCELLED',
            IN_PROGRESS: 'IN_PROGRESS',
            PLAY_SERVICES_NOT_AVAILABLE: 'PLAY_SERVICES_NOT_AVAILABLE',
        },
    };
});

jest.mock('react-native-safe-area-context', () => {
    const mockReact = require('react');
    const mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
    const mockFrame = { x: 0, y: 0, width: 390, height: 844 };
    const mockSafeAreaInsetsContext = mockReact.createContext(mockInsets);
    const mockSafeAreaFrameContext = mockReact.createContext(mockFrame);

    return {
        SafeAreaProvider: ({ children }) => {
            return mockReact.createElement(
                mockSafeAreaFrameContext.Provider,
                { value: mockFrame },
                mockReact.createElement(
                    mockSafeAreaInsetsContext.Provider,
                    { value: mockInsets },
                    children,
                ),
            );
        },
        SafeAreaView: ({ children }) => children,
        SafeAreaInsetsContext: mockSafeAreaInsetsContext,
        SafeAreaFrameContext: mockSafeAreaFrameContext,
        useSafeAreaInsets: () => mockInsets,
        useSafeAreaFrame: () => mockFrame,
        initialWindowMetrics: {
            frame: mockFrame,
            insets: mockInsets,
        },
    };
});

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }) => children,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), replace: jest.fn() }),
    useRoute: () => ({ params: {} }),
}));

jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }) => children,
        Screen: () => null,
    }),
}));

jest.mock('react-native-screens', () => ({
    enableScreens: jest.fn(),
}));

jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

jest.mock('react-native-image-picker', () => ({
    launchImageLibrary: jest.fn(),
}));

jest.mock('@react-native-documents/picker', () => ({
    pick: jest.fn(),
    types: { allFiles: '*/*', csv: 'text/csv' },
    isErrorWithCode: jest.fn().mockReturnValue(false),
    errorCodes: { OPERATION_CANCELED: 'OPERATION_CANCELED' },
}));

jest.mock('react-native-share', () => ({
    open: jest.fn(),
}));

jest.mock('react-native-fs', () => ({
    DocumentDirectoryPath: '/mock/path',
    CachesDirectoryPath: '/mock/cache',
    writeFile: jest.fn(),
}));

jest.mock('react-native-webrtc', () => ({}));
jest.mock('socket.io-client', () => ({
    io: jest.fn(() => ({
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
    })),
}));

jest.mock('react-native-paper', () => {
    const React = require('react');
    return {
        Provider: ({ children }) => children,
        DefaultTheme: {},
    };
});

jest.mock('uuid', () => ({
    stringify: jest.fn().mockReturnValue('mock-uuid'),
    v4: jest.fn().mockReturnValue('mock-uuid-v4'),
}));
