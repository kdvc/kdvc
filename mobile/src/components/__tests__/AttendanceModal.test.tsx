import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';
import { AttendanceModal } from '../AttendanceModal';

describe('AttendanceModal', () => {
    const mockOnClose = jest.fn();
    const mockOnSetPresence = jest.fn();
    const mockOnUpdateTopic = jest.fn();
    const mockStudents = [
        { id: '1', name: 'Ana', enrollmentId: '111', present: true },
        { id: '2', name: 'Bruno', enrollmentId: '222', present: false },
    ];

    beforeEach(() => jest.clearAllMocks());

    it('renders when visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Algebra" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders null when not visible', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={false} disciplineName="Math" classTopic="Algebra" students={[]} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(tree.toJSON()).toBeNull();
    });

    it('displays discipline name', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Cálculo I" classTopic="Derivadas" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Cálculo I');
    });

    it('displays student names', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        const json = JSON.stringify(tree.toJSON());
        expect(json).toContain('Ana');
        expect(json).toContain('Bruno');
    });

    it('shows Presença label', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Presença');
    });

    it('renders with onUpdateTopic prop', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} onUpdateTopic={mockOnUpdateTopic} />,
            );
        });
        expect(tree.toJSON()).toBeTruthy();
    });

    it('renders with empty students', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={[]} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('alunos');
    });

    it('shows enrollment id', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('111');
    });

    it('shows Fechar Chamada button', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => {
            tree = create(
                <AttendanceModal visible={true} disciplineName="Math" classTopic="Topic" students={mockStudents} onClose={mockOnClose} onSetPresence={mockOnSetPresence} />,
            );
        });
        expect(JSON.stringify(tree.toJSON())).toContain('Fechar Chamada');
    });
});
