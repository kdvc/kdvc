import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { EditCourseModal } from '../EditCourseModal';

jest.mock('../../services/api', () => ({
    apiFetch: jest.fn().mockResolvedValue({}),
}));

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
