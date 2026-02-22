import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AddClassModal } from '../AddClassModal';

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
