import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

// Mock hooks used by LoginScreen
jest.mock('../../hooks/useLogin', () => ({
    useLogin: () => ({
        mutateAsync: jest.fn().mockResolvedValue({ user: { role: 'STUDENT' } }),
    }),
}));
jest.mock('../../services/authStore', () => ({
    getCurrentUser: jest.fn().mockResolvedValue({ id: '1', name: 'Test', role: 'STUDENT' }),
    loadTokens: jest.fn(),
    getAccessToken: jest.fn().mockReturnValue('mock-token'),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    updateCurrentUser: jest.fn(),
}));

import LoginScreen from '../LoginScreen';

describe('LoginScreen', () => {
    it('renders correctly', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays app title', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Keep Daily');
    });

    it('displays Virtual Check-in', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Virtual Check-in');
    });

    it('displays KDVC abbreviation', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('KDVC');
    });

    it('displays version', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Versão 1.0.0');
    });

    it('displays sign in label', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<LoginScreen />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Acesse sua conta institucional');
    });
});
