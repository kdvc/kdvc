import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../services/api';

export function useProfessorClassStudents(courseId: string) {
  return useQuery({
    queryKey: ['professorClassStudents', courseId],
    queryFn: async () => {
      const students = await apiFetch<any[]>(`/courses/${courseId}/students`);
      return students ?? [];
    },
    enabled: !!courseId,
  });
}

// Types for the transformed data
export interface AttendanceHistoryItem {
  id: string;
  date: string;
  topic: string;
  presentCount: number;
  totalCount: number;
  classId: string; // Keep reference to original class ID
  raw: any; // Keep raw data for export
}

export function useProfessorAttendanceHistory(courseId: string) {
  return useQuery({
    queryKey: ['professorAttendanceHistory', courseId],
    queryFn: async () => {
      const classes = await apiFetch<any[]>(`/courses/${courseId}/classes`);

      // Transform backend Class[] to UI expected format (AttendanceRecord-ish)
      // Backend Class: { id, topic, date, attendances: [...] }
      return (
        classes
          ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(cls => {
            const dateObj = new Date(cls.date);
            const formattedDate = dateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            }) + ' às ' + dateObj.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            });

            // We need total students count to calculate "totalCount" or just use enrolled students length?
            // The mock used 'totalCount'. For now, let's use attendances length as present count.
            // But we don't know total students count here easily without another call or context.
            // However, usually "totalCount" in this context implies "Total Students in Class".
            // The backend `classes` include `attendances`. `attendances` only exist for present students usually?
            // Or if we have a list of all students, we can check.
            // For the UI "Presente X/Y", Y is total students.
            // Let's assume we can get total students from somewhere else or just map what we have.
            // For now, let's map what we can.

            return {
              id: cls.id,
              date: formattedDate,
              topic: cls.topic || '',
              presentCount: cls.attendances?.length || 0,
              totalCount: 0,
              classId: cls.id,
              raw: cls,
            };
          }) ?? []
      );
    },
    enabled: !!courseId,
  });
}
