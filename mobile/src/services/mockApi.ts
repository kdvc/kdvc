// src/services/mockApi.ts

type Attendance = {
  id: string;
  date: string;
  present: boolean;
};

type Class = {
  id: string;
  name: string;
  description: string;
  isAttendanceActive: boolean;
  attendanceHistory: Attendance[];
};

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

// Simula rotas do back
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
