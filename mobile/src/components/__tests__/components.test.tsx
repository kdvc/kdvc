import React from 'react';
import { act, create, ReactTestRenderer } from 'react-test-renderer';

// Component imports
import { AttendanceModal } from '../../components/AttendanceModal';
import { ClassCard } from '../../components/ClassCard';
import { DisciplineCard } from '../../components/DisciplineCard';
import PresenceCard from '../../components/PresenceCard';
import PrimaryButton from '../../components/PrimaryButton';
import { StartClassModal } from '../../components/StartClassModal';

// ------------------------------------------------------------------
// AttendanceModal
// ------------------------------------------------------------------
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
        // Modal renders null when not visible
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

// ------------------------------------------------------------------
// ClassCard
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// DisciplineCard
// ------------------------------------------------------------------
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
        // Text children are split: "42" + " alunos"
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

// ------------------------------------------------------------------
// PresenceCard
// ------------------------------------------------------------------
describe('PresenceCard', () => {
    it('renders with present status', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Presente');
    });

    it('renders with absent status', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={false} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Ausente');
    });

    it('displays date', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="15/03" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('15/03');
    });

    it('displays topic', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" topic="Aula Prática" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Aula Prática');
    });

    it('shows Chamada as default topic', async () => {
        let tree!: ReactTestRenderer;
        await act(async () => { tree = create(<PresenceCard date="10/02" present={true} />); });
        expect(JSON.stringify(tree.toJSON())).toContain('Chamada');
    });
});

// ------------------------------------------------------------------
// PrimaryButton
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// StartClassModal
// ------------------------------------------------------------------
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
