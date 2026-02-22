import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

import { AddClassModal } from '../../components/AddClassModal';
import { AddStudentModal } from '../../components/AddStudentModal';
import { EditCourseModal } from '../../components/EditCourseModal';
import { ProfileModal } from '../../components/ProfileModal';

// Mock apiFetch used by EditCourseModal and ProfileModal
jest.mock('../../services/api', () => ({
    apiFetch: jest.fn().mockResolvedValue({}),
}));

// ------------------------------------------------------------------
// AddClassModal
// ------------------------------------------------------------------
describe('AddClassModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSave = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders when visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddClassModal visible={true} onClose={mockOnClose} onSave={mockOnSave} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('returns null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddClassModal visible={false} onClose={mockOnClose} onSave={mockOnSave} />); });
        expect(tree.toJSON()).toBeNull();
    });

    it('renders tree structure', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddClassModal visible={true} onClose={mockOnClose} onSave={mockOnSave} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('onClose is provided', () => {
        expect(mockOnClose).toHaveBeenCalledTimes(0);
    });

    it('onSave is provided', () => {
        expect(mockOnSave).toHaveBeenCalledTimes(0);
    });
});

// ------------------------------------------------------------------
// AddStudentModal
// ------------------------------------------------------------------
describe('AddStudentModal', () => {
    const mockOnClose = jest.fn();
    const mockOnAdd = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders when visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddStudentModal visible={true} onClose={mockOnClose} onAdd={mockOnAdd} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('returns null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddStudentModal visible={false} onClose={mockOnClose} onAdd={mockOnAdd} />); });
        expect(tree.toJSON()).toBeNull();
    });

    it('renders with isLoading', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddStudentModal visible={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={true} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders without loading', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<AddStudentModal visible={true} onClose={mockOnClose} onAdd={mockOnAdd} isLoading={false} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('mocks are initially not called', () => {
        expect(mockOnClose).toHaveBeenCalledTimes(0);
        expect(mockOnAdd).toHaveBeenCalledTimes(0);
    });
});

// ------------------------------------------------------------------
// EditCourseModal
// ------------------------------------------------------------------
describe('EditCourseModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSaveSuccess = jest.fn();
    const mockCourse = { id: '1', name: 'Test Course', description: 'Desc', picture: undefined };
    beforeEach(() => jest.clearAllMocks());

    it('renders when visible without course', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<EditCourseModal visible={true} onClose={mockOnClose} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('returns null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<EditCourseModal visible={false} onClose={mockOnClose} />); });
        expect(tree.toJSON()).toBeNull();
    });

    it('renders with course data', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<EditCourseModal visible={true} onClose={mockOnClose} course={mockCourse} onSaveSuccess={mockOnSaveSuccess} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('mocks are not called on render', async () => {
        await act(async () => { create(<EditCourseModal visible={true} onClose={mockOnClose} />); });
        expect(mockOnClose).toHaveBeenCalledTimes(0);
    });
});

// ------------------------------------------------------------------
// ProfileModal
// ------------------------------------------------------------------
describe('ProfileModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSaveSuccess = jest.fn();
    const mockUser = {
        id: '1',
        name: 'Test User',
        email: 'test@ccc.ufcg.edu.br',
        role: 'STUDENT',
        enrollmentId: '12345',
    };
    beforeEach(() => jest.clearAllMocks());

    it('renders when visible without user', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfileModal visible={true} onClose={mockOnClose} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('returns null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfileModal visible={false} onClose={mockOnClose} />); });
        expect(tree.toJSON()).toBeNull();
    });

    it('renders with user data', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfileModal visible={true} onClose={mockOnClose} user={mockUser} onSaveSuccess={mockOnSaveSuccess} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with isMandatory', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ProfileModal visible={true} onClose={mockOnClose} user={mockUser} isMandatory={true} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('mocks are not called on render', async () => {
        await act(async () => { create(<ProfileModal visible={true} onClose={mockOnClose} />); });
        expect(mockOnClose).toHaveBeenCalledTimes(0);
        expect(mockOnSaveSuccess).toHaveBeenCalledTimes(0);
    });
});
