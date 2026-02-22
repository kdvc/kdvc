import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { StartClassModal } from '../StartClassModal';

describe('StartClassModal', () => {
    const mockOnClose = jest.fn();
    const mockOnStartNew = jest.fn();
    const mockOnReopen = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders when visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={true} hasActiveClass={false} hasAnyClass={false} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('shows Iniciar Chamada title when no active class', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={true} hasActiveClass={false} hasAnyClass={false} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Iniciar Chamada');
    });

    it('shows Gerenciar Chamada title when active class', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={true} hasActiveClass={true} hasAnyClass={true} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Gerenciar Chamada');
    });

    it('shows Cancelar button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={true} hasActiveClass={false} hasAnyClass={false} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Cancelar');
    });

    it('shows Iniciar Nova button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={true} hasActiveClass={false} hasAnyClass={false} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Iniciar Nova');
    });

    it('returns null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<StartClassModal visible={false} hasActiveClass={false} hasAnyClass={false} onClose={mockOnClose} onStartNew={mockOnStartNew} onReopen={mockOnReopen} />); });
        expect(tree.toJSON()).toBeNull();
    });
});
