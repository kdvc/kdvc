import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert } from 'react-native';

export const ExportService = {
  generateCourseSummaryCSV: (students: any[], attendanceHistory: any[]) => {
    const header =
      'Matrícula,Nome,Total de Presenças,Total de Aulas,Percentual';

    if (!students || students.length === 0) {
      return '\uFEFF' + header;
    }

    const rows = students.map((student: any) => {
      const totalClasses = attendanceHistory.length;
      const presents = attendanceHistory.filter((cls: any) =>
        cls.raw?.attendances?.some((a: any) => a.studentId === student.id),
      ).length;

      const percentage =
        totalClasses > 0 ? ((presents / totalClasses) * 100).toFixed(1) : '0.0';

      return `${student.enrollmentId || 'N/A'},${
        student.name
      },${presents},${totalClasses},${percentage}%`;
    });

    return '\uFEFF' + [header, ...rows].join('\n');
  },

  generateAttendanceCSV: (students: any[], attendanceItem: any) => {
    const header = `Matrícula,Nome,Presença (${attendanceItem.date})`;

    if (!students || students.length === 0) {
      return '\uFEFF' + header;
    }

    const rows = students.map((student: any) => {
      const isPresent = attendanceItem.raw?.attendances?.some(
        (a: any) => a.studentId === student.id,
      );
      return `${student.enrollmentId || 'N/A'},${student.name},${
        isPresent ? 'Presente' : 'Ausente'
      }`;
    });

    return '\uFEFF' + [header, ...rows].join('\n');
  },

  exportToCSV: async (content: string, filename: string, title: string) => {
    try {
      const path = `${RNFS.DownloadDirectoryPath}/${filename}`;
      await RNFS.writeFile(path, content, 'utf8');

      const shareOptions = {
        title,
        url: `file://${path}`,
        type: 'text/csv',
        failOnCancel: false,
      };

      console.log(shareOptions);

      await Share.open(shareOptions);
    } catch (error: any) {
      console.error('Export error:', error);
      // Ignore user cancellation errors
      if (error?.message !== 'User did not share') {
        Alert.alert(
          'Erro na exportação',
          error.message || 'Falha ao exportar arquivo.',
        );
      }
    }
  },
};
