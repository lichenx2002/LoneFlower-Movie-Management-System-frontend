import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Schedule, ScheduleResponse } from '../../types/schedule';
import { scheduleAPI } from '../../api/scheduleAPI';
import { cinemaAPI } from '../../api/cinemaAPI';
import { hallAPI } from '../../api/hallAPI';
import { Cinema } from '../../types/cinema';
import { Hall } from '../../types/hall';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
// @ts-ignore
import styles from './index.module.css';

const ScheduleSelection: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cinemas, setCinemas] = useState<Cinema[]>([]);
    const [halls, setHalls] = useState<Hall[]>([]);
    const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
    const [allSchedules, setAllSchedules] = useState<ScheduleResponse | null>(null);
    const [filteredSchedules, setFilteredSchedules] = useState<ScheduleResponse | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
    const [loading, setLoading] = useState(true);
    const [scheduleLoading, setScheduleLoading] = useState(false);

    // 获取影院和影厅列表
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [cinemaRes, hallRes] = await Promise.all([
                    cinemaAPI.getAllCinemas(),
                    hallAPI.getAllHalls()
                ]);
                setCinemas(cinemaRes);
                setHalls(hallRes);
                if (cinemaRes.length > 0) {
                    setSelectedCinemaId(cinemaRes[0].cinemaId);
                }
            } catch (e) {
                setCinemas([]);
                setHalls([]);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 获取所有场次（只请求一次）
    useEffect(() => {
        if (!id) return;
        setScheduleLoading(true);
        scheduleAPI.getSchedulesByMovieId(Number(id))
            .then(response => {
                setAllSchedules(response);
            })
            .finally(() => setScheduleLoading(false));
    }, [id]);

    // 根据选中的影院筛选场次（用hallId）
    useEffect(() => {
        if (!allSchedules || !selectedCinemaId || halls.length === 0) {
            setFilteredSchedules(null);
            setSelectedDate('');
            setSelectedSchedule(null);
            return;
        }
        const hallIdsOfSelectedCinema = halls.filter(h => h.cinemaId === selectedCinemaId).map(h => h.hallId);
        const filtered: ScheduleResponse = { schedules: {} };
        Object.keys(allSchedules.schedules).forEach(date => {
            const filteredList = allSchedules.schedules[date].filter(s => hallIdsOfSelectedCinema.includes(s.hallId));
            if (filteredList.length > 0) {
                filtered.schedules[date] = filteredList;
            }
        });
        setFilteredSchedules(filtered);
        if (Object.keys(filtered.schedules).length > 0) {
            setSelectedDate(Object.keys(filtered.schedules)[0]);
        } else {
            setSelectedDate('');
        }
        setSelectedSchedule(null);
    }, [allSchedules, selectedCinemaId, halls]);

    const handleSelectSchedule = (schedule: Schedule) => {
        setSelectedSchedule(schedule);
    };

    const handleContinue = () => {
        if (selectedSchedule) {
            navigate(`/seat/movies/${id}/schedule/${selectedSchedule.scheduleId}`);
        }
    };

    const formatTime = (timeString: string) => {
        return format(new Date(timeString), 'HH:mm', { locale: zhCN });
    };

    const formatDate = (dateString: string) => {
        return format(new Date(dateString), 'MM月dd日 EEEE', { locale: zhCN });
    };

    if (loading) {
        return <div className={styles['loading']}>加载中...</div>;
    }

    return (
        <div className={styles['schedule-selection']}>
            {/* 影院选择 */}
            <div className={styles['cinema-list']} style={{ marginBottom: 24 }}>
                {cinemas.map(cinema => (
                    <div
                        key={cinema.cinemaId}
                        className={`${styles['cinema-item']} ${selectedCinemaId === cinema.cinemaId ? styles['selected'] : ''}`}
                        onClick={() => setSelectedCinemaId(cinema.cinemaId)}
                    >
                        {cinema.name}
                    </div>
                ))}
            </div>
            {/* 日期选择 */}
            {scheduleLoading ? (
                <div className={styles['loading']}>加载场次...</div>
            ) : !filteredSchedules || Object.keys(filteredSchedules.schedules).length === 0 ? (
                <div className={styles['no-schedules']}>暂无场次信息</div>
            ) : (
                <>
                    <div className={styles['schedule-dates']}>
                        {Object.keys(filteredSchedules.schedules).map(date => (
                            <div
                                key={date}
                                className={`${styles['date-item']} ${date === selectedDate ? styles['selected'] : ''}`}
                                onClick={() => setSelectedDate(date)}
                            >
                                {formatDate(date)}
                            </div>
                        ))}
                    </div>
                    {/* 场次列表 */}
                    <div className={styles['schedule-list']}>
                        {filteredSchedules.schedules[selectedDate]?.map(schedule => (
                            <div
                                key={schedule.scheduleId}
                                className={`${styles['schedule-item']} ${selectedSchedule?.scheduleId === schedule.scheduleId ? styles['selected'] : ''}`}
                                onClick={() => handleSelectSchedule(schedule)}
                            >
                                <div className={styles['schedule-time']}>
                                    <div className={styles['time']}>{formatTime(schedule.startTime)}</div>
                                    <div className={styles['duration']}>
                                        {formatTime(schedule.endTime)}
                                    </div>
                                </div>
                                <div className={styles['schedule-info']}>
                                    <div className={styles['hall-name']}>{schedule.hallName}</div>
                                    <div className={styles['hall-type']}>{schedule.hallType}</div>
                                </div>
                                <div className={styles['schedule-price']}>
                                    <div className={styles['price']}>¥{schedule.basePrice}</div>
                                    <div className={styles['price-type']}>起</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {selectedSchedule && (
                        <div className={styles['schedule-footer']}>
                            <div className={styles['selected-info']}>
                                <span>已选择：</span>
                                <span className={styles['selected-time']}>
                                    {formatDate(selectedDate)} {formatTime(selectedSchedule.startTime)}
                                </span>
                                <span className={styles['selected-hall']}>{selectedSchedule.hallName}</span>
                            </div>
                            <button className={styles['continue-button']} onClick={handleContinue}>
                                选座购票
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ScheduleSelection;