import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

// Mock all hooks/services used by BluetoothScreen
jest.mock('../../hooks/useLogin', () => ({
    useLogin: () => ({ mutateAsync: jest.fn().mockResolvedValue({ user: { role: 'STUDENT' } }) }),
}));
jest.mock('../../hooks/useProfessorDisciplines', () => ({
    useProfessorDisciplines: () => ({ data: [], isLoading: false, refetch: jest.fn() }),
}));
jest.mock('../../hooks/useCreateCourse', () => ({
    useCreateCourse: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock('../../hooks/useProfessorClassDetails', () => ({
    useProfessorClassStudents: () => ({ data: [], isLoading: false }),
    useProfessorAttendanceHistory: () => ({ data: [], isLoading: false }),
}));
jest.mock('../../hooks/useStudentClasses', () => ({
    useStudentClasses: () => ({ data: [], isLoading: false, refetch: jest.fn() }),
}));
jest.mock('../../hooks/useRemoveCourse', () => ({
    useRemoveCourse: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock('../../hooks/useRemoveStudent', () => ({
    useRemoveStudent: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock('../../hooks/useUpdateUser', () => ({
    useUpdateUser: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock('../../hooks/useAddStudents', () => ({
    useAddStudents: () => ({ mutateAsync: jest.fn().mockResolvedValue({}) }),
}));
jest.mock('../../hooks/useClassById', () => ({
    useCourseById: () => ({ data: null, isLoading: false }),
}));
jest.mock('../../hooks/useProfessorStudents', () => ({
    useProfessorStudents: () => ({ data: [], isLoading: false }),
}));
jest.mock('../../services/api', () => ({
    apiFetch: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../services/authStore', () => ({
    getCurrentUser: jest.fn().mockResolvedValue({ id: '1', name: 'Test', role: 'STUDENT' }),
    loadTokens: jest.fn(),
    getAccessToken: jest.fn().mockReturnValue('mock-token'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    updateCurrentUser: jest.fn(),
}));
jest.mock('../../services/exportService', () => ({
    ExportService: {
        generateCourseSummaryCSV: jest.fn().mockReturnValue('csv'),
        generateAttendanceCSV: jest.fn().mockReturnValue('csv'),
        exportToCSV: jest.fn().mockResolvedValue(undefined),
    },
}));
jest.mock('../../domain/bluetooth/useStartAttendance', () => ({
    useStartAttendance: () => ({
        isAdvertising: false,
        startAttendance: jest.fn(),
        stopAttendance: jest.fn(),
        allowed: true,
    }),
}));
jest.mock('../../domain/bluetooth/useScanner', () => ({
    useScanner: () => ({
        devices: [],
        isScanning: false,
        startScan: jest.fn(),
        stopScan: jest.fn(),
    }),
}));
jest.mock('../../context/StudentAttendanceContext', () => ({
    useStudentAttendance: () => ({
        courseClassMap: {},
        registeredIds: new Set(),
        setRegisteredIds: jest.fn(),
    }),
    StudentAttendanceProvider: ({ children }: any) => children,
}));
jest.mock('../../../CreateForm', () => {
    const React = require('react');
    return (props: any) => React.createElement('View', { testID: 'CreateForm' });
});

import BluetoothScreen from '../BluetoothScreen';

describe('BluetoothScreen', () => {
    it('renders correctly', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<BluetoothScreen />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays BLE Scanner title', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<BluetoothScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('BLE Scanner');
    });

    it('shows scan button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<BluetoothScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Iniciar Scan');
    });

    it('shows advertise button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<BluetoothScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Iniciar Advertising');
    });

    it('shows waiting status', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<BluetoothScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Aguardando ação...');
    });
});
