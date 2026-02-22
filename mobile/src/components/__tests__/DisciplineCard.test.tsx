import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { DisciplineCard } from '../DisciplineCard';

describe('DisciplineCard', () => {
    const mockStartCall = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders with name', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="Cálculo" onStartCall={mockStartCall} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays name', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="Física" onStartCall={mockStartCall} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Física');
    });

    it('displays schedule', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="Test" schedule="Seg 8-10" onStartCall={mockStartCall} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Seg 8-10');
    });

    it('shows student count value', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="Test" studentCount={42} onStartCall={mockStartCall} />); });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('42');
        expect(json).toContain('alunos');
    });

    it('renders with picture', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="T" picture="https://img.com/x.png" onStartCall={mockStartCall} />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('shows Gerenciar Chamada when active', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="T" isActive={true} onStartCall={mockStartCall} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Gerenciar Chamada');
    });

    it('shows Fora de Horário when inactive', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="T" isActive={false} onStartCall={mockStartCall} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Fora de Hor');
    });

    it('renders avatar initials', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<DisciplineCard name="Banco Dados" onStartCall={mockStartCall} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('BD');
    });
});
