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
