// src/services/mockApi.ts

// ==================== TYPES ====================

export type Attendance = {
  id: string;
  date: string;
  present: boolean;
};

export type Class = {
  id: string;
  name: string;
  description: string;
  isAttendanceActive: boolean;
  attendanceHistory: Attendance[];
};

export type Discipline = {
  id: string;
  name: string;
  schedule: string;
  studentCount: number;
};

export type Student = {
  id: string;
  name: string;
  present: boolean;
};

export type ProfessorStudent = {
  id: string;
  name: string;
  enrollmentId: string;
};

export type AttendanceRecord = {
  id: string;
  date: string;
  presentCount: number;
  totalCount: number;
};

// ==================== DATA ====================

const classesDatabase: Class[] = [
  {
    id: '1',
    name: 'Estrutura de Dados',
    description: 'Adalberto',
    isAttendanceActive: true,
    attendanceHistory: [
      { id: '1', date: '10/02', present: true },
      { id: '2', date: '17/02', present: true },
    ],
  },
  {
    id: '2',
    name: 'Banco de Dados',
    description: 'Campelo',
    isAttendanceActive: false,
    attendanceHistory: [
      { id: '1', date: '11/02', present: true },
      { id: '2', date: '18/02', present: false },
    ],
  },
];

const disciplinesDatabase: Discipline[] = [
  {
    id: '1',
    name: 'Matemática Discreta',
    schedule: 'Segunda 08:00 - 10:00',
    studentCount: 42,
  },
  {
    id: '2',
    name: 'Cálculo I',
    schedule: 'Quarta 12:00 - 16:00',
    studentCount: 35,
  },
  {
    id: '3',
    name: 'Álgebra Linear',
    schedule: 'Sexta 10:00 - 12:00',
    studentCount: 28,
  },
  {
    id: '4',
    name: 'Física I',
    schedule: 'Terça 16:00 - 18:00',
    studentCount: 30,
  },
  {
    id: '5',
    name: 'Projeto Final',
    schedule: 'Quinta 20:00 - 23:00',
    studentCount: 15,
  },
];

const studentsDatabase: Student[] = [
  { id: '1', name: 'Ana Silva', present: false },
  { id: '2', name: 'Bruno Santos', present: false },
  { id: '3', name: 'Carla Oliveira', present: false },
  { id: '4', name: 'Daniel Souza', present: false },
  { id: '5', name: 'Eduarda Costa', present: false },
];

const professorStudentsDatabase: ProfessorStudent[] = [
  { id: '1', name: 'Ana Silva', enrollmentId: '2023001' },
  { id: '2', name: 'Bruno Santos', enrollmentId: '2023002' },
  { id: '3', name: 'Carla Oliveira', enrollmentId: '2023003' },
  { id: '4', name: 'Daniel Souza', enrollmentId: '2023004' },
  { id: '5', name: 'Eduarda Costa', enrollmentId: '2023005' },
  { id: '6', name: 'Felipe Lima', enrollmentId: '2023006' },
  { id: '7', name: 'Gabriela Rocha', enrollmentId: '2023007' },
];

const attendanceHistoryDatabase: AttendanceRecord[] = [
  { id: '1', date: '07/02/2026', presentCount: 45, totalCount: 50 },
  { id: '2', date: '05/02/2026', presentCount: 48, totalCount: 50 },
  { id: '3', date: '03/02/2026', presentCount: 42, totalCount: 50 },
  { id: '4', date: '31/01/2026', presentCount: 49, totalCount: 50 },
];

// ==================== STUDENT API ====================

export function getStudentClasses() {
  return new Promise<Class[]>(resolve => {
    setTimeout(() => {
      resolve(classesDatabase);
    }, 500);
  });
}

export function getClassById(id: string) {
  return new Promise<Class | undefined>(resolve => {
    setTimeout(() => {
      const found = classesDatabase.find(c => c.id === id);
      resolve(found);
    }, 500);
  });
}

export function registerAttendance(classId: string) {
  return new Promise<Class | undefined>(resolve => {
    setTimeout(() => {
      const found = classesDatabase.find(c => c.id === classId);
      if (found && found.isAttendanceActive) {
        found.attendanceHistory.push({
          id: Date.now().toString(),
          date: new Date().toLocaleDateString('pt-BR'),
          present: true,
        });
      }
      resolve(found);
    }, 500);
  });
}

// ==================== PROFESSOR API ====================

export function getProfessorDisciplines() {
  return new Promise<Discipline[]>(resolve => {
    setTimeout(() => {
      resolve(disciplinesDatabase);
    }, 500);
  });
}

export function getProfessorStudents() {
  return new Promise<Student[]>(resolve => {
    setTimeout(() => {
      resolve(studentsDatabase);
    }, 500);
  });
}

export function getProfessorClassStudents() {
  return new Promise<ProfessorStudent[]>(resolve => {
    setTimeout(() => {
      resolve(professorStudentsDatabase);
    }, 500);
  });
}

export function getProfessorAttendanceHistory() {
  return new Promise<AttendanceRecord[]>(resolve => {
    setTimeout(() => {
      resolve(attendanceHistoryDatabase);
    }, 500);
  });
}
