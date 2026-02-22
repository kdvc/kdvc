import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ProfileModal } from '../ProfileModal';

jest.mock('../../services/api', () => ({
    apiFetch: jest.fn().mockResolvedValue({}),
}));

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
