import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import PrimaryButton from '../PrimaryButton';

describe('PrimaryButton', () => {
    const mockOnPress = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders with title', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PrimaryButton title="Salvar" onPress={mockOnPress} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Salvar');
    });

    it('renders enabled by default', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PrimaryButton title="OK" onPress={mockOnPress} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders disabled state', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PrimaryButton title="OK" onPress={mockOnPress} disabled={true} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with different titles', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PrimaryButton title="Cadastrar" onPress={mockOnPress} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Cadastrar');
    });
});
