import { useQuery } from '@tanstack/react-query';
import {
  getProfessorClassStudents,
  getProfessorAttendanceHistory,
} from '../services/mockApi';

export function useProfessorClassStudents() {
  return useQuery({
    queryKey: ['professorClassStudents'],
    queryFn: getProfessorClassStudents,
  });
}

export function useProfessorAttendanceHistory() {
  return useQuery({
    queryKey: ['professorAttendanceHistory'],
    queryFn: getProfessorAttendanceHistory,
  });
}
