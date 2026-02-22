import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { ClassCard } from '../ClassCard';

describe('ClassCard', () => {
    const mockOnPress = jest.fn();
    const mockOnRegister = jest.fn();
    beforeEach(() => jest.clearAllMocks());

    it('renders with title and description', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="Turma A" description="Desc A" />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('displays title text', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="Programação" description="Engenharia" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Programação');
    });

    it('displays description text', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="Turma" description="Descrição longa" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Descrição longa');
    });

    it('renders with picture', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" picture="https://img.com/a.png" />); });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders attendance active badge', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" isAttendanceActive={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Chamada Ativa');
    });

    it('renders with custom active topic', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" isAttendanceActive={true} activeTopic="Aula 5" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Aula 5');
    });

    it('shows Registrar button when not registered', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" isAttendanceActive={true} isRegistered={false} onRegisterPresence={mockOnRegister} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Registrar');
    });

    it('shows Registrada when registered', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" isAttendanceActive={true} isRegistered={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Registrada');
    });

    it('renders avatar initials when no picture', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="Turma Bom" description="D" />); });
        expect(JSON.stringify(tree.toJSON())).toContain('TB');
    });

    it('renders chevron when attendance not active', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<ClassCard title="T" description="D" isAttendanceActive={false} />); });
        expect(tree.toJSON()).toBeTruthy();
    });
});
