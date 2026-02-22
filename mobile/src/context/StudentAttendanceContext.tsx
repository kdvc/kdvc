import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { apiFetch } from '../services/api';
import { usePermissions } from '../shared/hooks/usePermissions';
import { useScanner } from '../domain/bluetooth/useScanner';
import { INDENTIFIER } from '../domain/bluetooth/types';
import { stringify as uuidStringify } from 'uuid';
import { getCurrentUser } from '../services/authStore';

interface AttendanceContextData {
    courseClassMap: Record<string, { id: string, topic: string }>;
    registeredIds: Set<string>;
    setRegisteredIds: React.Dispatch<React.SetStateAction<Set<string>>>;
}

const AttendanceContext = createContext<AttendanceContextData>({} as AttendanceContextData);

export const StudentAttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [courseClassMap, setCourseClassMap] = useState<Record<string, { id: string, topic: string }>>({});
    const [registeredIds, setRegisteredIds] = useState<Set<string>>(new Set());

    const { allowed } = usePermissions();
    const lastSeenRef = useRef<Record<string, number>>({});
    const courseMapRef = useRef<Record<string, { courseId: string, topic: string, date: string }>>({});
    const blacklistRef = useRef<Record<string, number>>({});

    const handleDeviceFound = useCallback((device: any) => {
        if (
            device.manufacturerData &&
            device.manufacturerData.length >= 16 &&
            device.manufacturerId === INDENTIFIER
        ) {
            try {
                const classId = uuidStringify(new Uint8Array(device.manufacturerData.slice(1)));

                const now = Date.now();
                const blacklistExpiry = blacklistRef.current[classId];
                if (blacklistExpiry && now < blacklistExpiry) {
                    return;
                }
                if (blacklistExpiry) {
                    delete blacklistRef.current[classId];
                }

                lastSeenRef.current[classId] = Date.now();

                if (courseMapRef.current[classId]) {
                    const info = courseMapRef.current[classId];
                    setCourseClassMap(prev => {
                        if (prev[info.courseId]?.id === classId) return prev;
                        return {
                            ...prev,
                            [info.courseId]: { id: classId, topic: info.topic },
                        };
                    });
                } else {
                    apiFetch<any>(`/classes/${classId}`)
                        .then(async classDetails => {
                            if (classDetails.courseId) {
                                const topicStr = classDetails.topic || 'Chamada Ativa';

                                const classDate = classDetails.date || new Date().toISOString();

                                // Fetch course to get activeClassId to fight ghost beacons securely!
                                try {
                                    const courseData = await apiFetch<any>(`/courses/${classDetails.courseId}`);
                                    if (courseData.activeClassId && courseData.activeClassId !== classId) {
                                        // The backend disagrees! This is a ghost beacon.
                                        blacklistRef.current[classId] = Date.now() + 60000;
                                        return;
                                    }
                                } catch (e) {
                                    console.warn('Could not verify active class ID, proceeding anyway', e);
                                }

                                courseMapRef.current[classId] = { courseId: classDetails.courseId, topic: topicStr, date: classDate };
                                setCourseClassMap(prev => {
                                    const oldEntry = prev[classDetails.courseId];
                                    if (oldEntry?.id === classId) return prev;

                                    if (oldEntry && oldEntry.id !== classId) {
                                        setRegisteredIds(prevIds => {
                                            if (!prevIds.has(classDetails.courseId)) return prevIds;
                                            const next = new Set(prevIds);
                                            next.delete(classDetails.courseId);
                                            return next;
                                        });
                                    }

                                    return {
                                        ...prev,
                                        [classDetails.courseId]: { id: classId, topic: topicStr },
                                    };
                                });

                                const user = await getCurrentUser();
                                const userId = user?.id;
                                if (userId && classDetails.attendances) {
                                    const alreadyRegistered = classDetails.attendances.some(
                                        (a: any) => a.studentId === userId,
                                    );
                                    if (alreadyRegistered) {
                                        setRegisteredIds(prev => {
                                            if (prev.has(classDetails.courseId)) return prev;
                                            const next = new Set(prev);
                                            next.add(classDetails.courseId);
                                            return next;
                                        });
                                    }
                                }
                            }
                        })
                        .catch(err => console.warn('Failed to resolve classId:', classId, err));
                }
            } catch (e) {
                console.warn('Error parsing UUID from BLE device', e);
            }
        }
    }, [allowed]);

    const { startScan } = useScanner({ allowed, onDeviceFound: handleDeviceFound });

    useEffect(() => {
        startScan();
    }, [startScan]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const TTL = 8000;

            setCourseClassMap(prevMap => {
                let changed = false;
                const newMap = { ...prevMap };
                for (const [courseId, classInfo] of Object.entries(newMap)) {
                    const classId = classInfo.id;
                    const lastSeen = lastSeenRef.current[classId] || 0;

                    if (now - lastSeen > TTL) {
                        delete newMap[courseId];
                        delete courseMapRef.current[classId];
                        delete lastSeenRef.current[classId];

                        blacklistRef.current[classId] = now + 10000;
                        changed = true;
                    }
                }
                return changed ? newMap : prevMap;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AttendanceContext.Provider value={{ courseClassMap, registeredIds, setRegisteredIds }}>
            {children}
        </AttendanceContext.Provider>
    );
};

export function useStudentAttendance() {
    return useContext(AttendanceContext);
}
