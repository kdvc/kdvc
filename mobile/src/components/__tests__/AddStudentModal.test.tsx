import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AddStudentModal } from '../AddStudentModal';

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
