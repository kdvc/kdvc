import { ExportService } from '../exportService';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { Alert } from 'react-native';

// Mock dependencies
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/path',
  writeFile: jest.fn().mockResolvedValue(true),
}));

jest.mock('react-native-share', () => ({
  open: jest.fn().mockResolvedValue({ success: true, message: 'Shared' }),
}));

jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'android',
  },
}));

describe('ExportService', () => {
  const mockStudents = [
    { id: '1', name: 'Student A', enrollmentId: '123' },
    { id: '2', name: 'Student B', enrollmentId: '456' },
  ];

  const mockAttendanceHistory = [
    {
      id: 'c1',
      date: '10/02',
      raw: {
        attendances: [{ studentId: '1' }], // Only Student A present
      },
    },
    {
      id: 'c2',
      date: '17/02',
      raw: {
        attendances: [{ studentId: '1' }, { studentId: '2' }], // Both present
      },
    },
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCourseSummaryCSV', () => {
    it('should generate correct CSV for course summary', () => {
      const csv = ExportService.generateCourseSummaryCSV(
        mockStudents,
        mockAttendanceHistory,
      );

      const lines = csv.split('\n');
      expect(lines[0]).toContain(
        'Matrícula,Nome,Total de Presenças,Total de Aulas,Percentual',
      );

      // Student A: 2 presents / 2 classes = 100%
      expect(lines.find(l => l.includes('Student A'))).toContain(
        '123,Student A,2,2,100.0%',
      );

      // Student B: 1 present / 2 classes = 50%
      expect(lines.find(l => l.includes('Student B'))).toContain(
        '456,Student B,1,2,50.0%',
      );
    });

    it('should handle empty students list', () => {
      const csv = ExportService.generateCourseSummaryCSV(
        [],
        mockAttendanceHistory,
      );
      expect(csv).toContain(
        'Matrícula,Nome,Total de Presenças,Total de Aulas,Percentual',
      );
      expect(csv.split('\n').length).toBe(1); // Only header
    });

    it('should handle empty attendance history', () => {
      const csv = ExportService.generateCourseSummaryCSV(mockStudents, []);
      const lines = csv.split('\n');

      // Student A: 0 presents / 0 classes = 0.0%
      expect(lines.find(l => l.includes('Student A'))).toContain(
        '123,Student A,0,0,0.0%',
      );
    });
  });

  describe('generateAttendanceCSV', () => {
    it('should generate correct CSV for single class attendance', () => {
      const classItem = mockAttendanceHistory[0]; // Only Student A present
      const csv = ExportService.generateAttendanceCSV(mockStudents, classItem);

      const lines = csv.split('\n');
      expect(lines[0]).toContain(`Presença (${classItem.date})`);

      expect(lines.find(l => l.includes('Student A'))).toContain('Presente');
      expect(lines.find(l => l.includes('Student B'))).toContain('Ausente');
    });

    it('should handle empty students list', () => {
      const classItem = mockAttendanceHistory[0];
      const csv = ExportService.generateAttendanceCSV([], classItem);
      expect(csv).toContain(`Presença (${classItem.date})`);
      expect(csv.split('\n').length).toBe(1);
    });
  });

  describe('exportToCSV', () => {
    it('should write file and call Share', async () => {
      const content = 'csv,content';
      const filename = 'test.csv';
      const title = 'Test Export';

      await ExportService.exportToCSV(content, filename, title);

      expect(RNFS.writeFile).toHaveBeenCalledWith(
        '/mock/path/test.csv',
        content,
        'utf8',
      );
      expect(Share.open).toHaveBeenCalledWith({
        title,
        url: 'file:///mock/path/test.csv',
        type: 'text/csv',
        failOnCancel: false,
      });
    });

    it('should handle write error', async () => {
      (RNFS.writeFile as jest.Mock).mockRejectedValueOnce(
        new Error('Write failed'),
      );

      await ExportService.exportToCSV('content', 'file.csv', 'Title');

      expect(Alert.alert).toHaveBeenCalledWith(
        'Erro na exportação',
        'Write failed',
      );
    });
  });
});
