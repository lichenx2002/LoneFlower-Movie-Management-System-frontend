import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ScheduleDetail, Seat } from '../../types/hall';
import { useSelector } from "react-redux";
import { RootState } from '../../redux/store';
import { seatAPI } from '../../api/seatAPI';
import { scheduleAPI } from '../../api/scheduleAPI';
import { orderAPI } from '../../api/orderAPI';
import { ScheduleResponse } from '../../types/schedule';
import { hallConfig } from '../../config/hallConfig';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useAuth } from '../../context/AuthContext';
// @ts-ignore
import styles from './index.module.css';
import { Button, message } from 'antd';


// 格式化时间函数
const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (date.toDateString() === today.toDateString()) {
        dateStr = '今天';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        dateStr = '明天';
    } else {
        dateStr = format(date, 'MM月dd日', { locale: zhCN });
    }

    const timeStr = format(date, 'HH:mm', { locale: zhCN });
    return `${dateStr} ${timeStr}`;
};

const SeatSelection: React.FC = () => {
    const { setShowLogin } = useAuth();
    const { scheduleId } = useParams();
    const navigate = useNavigate();
    const [scheduleDetail, setScheduleDetail] = useState<ScheduleDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
    const [rowLabels, setRowLabels] = useState<string[]>([]);
    const [availableSchedules, setAvailableSchedules] = useState<ScheduleResponse | null>(null);
    const [showScheduleList, setShowScheduleList] = useState(false);
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const user = useSelector((state: RootState) => state.auth.user);

    useEffect(() => {
        const fetchSeatData = async () => {
            try {
                const data = await seatAPI.getSeatsByScheduleId(Number(scheduleId));
                setScheduleDetail(data);
                // 获取所有行标签并排序
                const labels = Array.from(new Set(data.seats.map(seat => seat.rowLabel))).sort();
                setRowLabels(labels);
                setLoading(false);

                // 获取可用场次
                try {
                    const schedules = await scheduleAPI.getSchedulesByMovieId(data.movie.movieId);
                    setAvailableSchedules(schedules);
                } catch (error) {
                    console.error('获取场次信息失败:', error);
                }
            } catch (error) {
                console.error('获取座位信息失败:', error);
                setError('获取座位信息失败，请稍后重试');
                setLoading(false);
            }
        };

        if (scheduleId) {
            fetchSeatData();
        }
    }, [scheduleId]);

    const handleScheduleChange = (newScheduleId: number) => {
        navigate(`/movies/${scheduleDetail?.movie.movieId}/schedule/${newScheduleId}/seat`);
    };

    const handleSeatClick = (seat: Seat) => {
        // 检查用户是否已登录
        if (!isAuthenticated) {
            setShowLoginModal(true);
            return;
        }
        //
        if (seat.status === 'OCCUPIED' || seat.status === 'LOCKED') return;

        if (!scheduleDetail?.hall || scheduleDetail.hall.type !== 'LOVERS') {
            // 如果不是情侣厅，使用原来的逻辑
            setSelectedSeats(prev => {
                const isSelected = prev.some(s => s.ssId === seat.ssId);
                if (isSelected) {
                    return prev.filter(s => s.ssId !== seat.ssId);
                } else {
                    return [...prev, seat];
                }
            });
            return;
        }

        // 情侣厅选座逻辑
        setSelectedSeats(prev => {
            const isSelected = prev.some(s => s.ssId === seat.ssId);
            if (isSelected) {
                // 如果当前座位已被选中，取消选中当前座位和配对座位
                const pairedSeat = scheduleDetail.seats.find(s =>
                    s.rowLabel === seat.rowLabel &&
                    ((seat.colNum % 2 === 1 && s.colNum === seat.colNum + 1) ||
                        (seat.colNum % 2 === 0 && s.colNum === seat.colNum - 1))
                );
                return prev.filter(s => s.ssId !== seat.ssId && (!pairedSeat || s.ssId !== pairedSeat.ssId));
            } else {
                // 如果当前座位未被选中，选中当前座位和配对座位
                const pairedSeat = scheduleDetail.seats.find(s =>
                    s.rowLabel === seat.rowLabel &&
                    ((seat.colNum % 2 === 1 && s.colNum === seat.colNum + 1) ||
                        (seat.colNum % 2 === 0 && s.colNum === seat.colNum - 1))
                );
                if (pairedSeat && pairedSeat.status !== 'OCCUPIED') {
                    return [...prev, seat, pairedSeat];
                }
                return [...prev, seat];
            }
        });
    };


    const handleConfirmOrder = async () => {
        if (!selectedSeats.length) {
            message.error('请选择座位');
            return;
        }

        if (!user?.userId) {
            message.error('请先登录');
            return;
        }

        try {
            const response = await orderAPI.createOrder({
                userId: user.userId,
                ssIds: selectedSeats.map(seat => seat.ssId),
                totalAmount: calculateTotalPrice()
            });

            // 修改跳转路径
            navigate(`/orders/confirm/${user.userId}/${response.orderId}`);
        } catch (error) {
            console.error('创建订单失败:', error);
            message.error('创建订单失败');
        }
    };

    const calculateTotalPrice = () => {
        return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
    };

    const getSeatIcon = (seat: Seat) => {
        if (!scheduleDetail?.hall) return null;

        const hallType = scheduleDetail.hall.type;
        const hallTemplate = hallConfig[hallType];

        if (!hallTemplate) return null;

        // 根据影厅类型设置座位大小
        const seatSize = hallType === 'LARGE' ? 24 : 30;

        // 获取座位类型配置（处理大小写）
        let seatTypeConfig = hallTemplate.seatTypes[seat.seatType];
        if (!seatTypeConfig) {
            // 如果找不到配置，尝试转换为大写
            const upperSeatType = seat.seatType.toUpperCase();
            seatTypeConfig = hallTemplate.seatTypes[upperSeatType];
        }

        if (!seatTypeConfig) {
            // 如果还是找不到，根据影厅类型使用默认配置
            if (hallType === 'LOVERS') {
                seatTypeConfig = hallTemplate.seatTypes.couple || hallTemplate.seatTypes.COUPLE;
            } else {
                seatTypeConfig = hallTemplate.seatTypes.standard || hallTemplate.seatTypes.STANDARD;
            }
        }

        // 根据座位状态使用对应的图标配置
        if (selectedSeats.some(s => s.ssId === seat.ssId)) {
            // 已选择的座位
            return hallTemplate.legendIcons.SELECTED.icon({ size: seatSize });
        } else if (seat.status === 'OCCUPIED') {
            // 已占用的座位
            return hallTemplate.legendIcons.OCCUPIED.icon({ size: seatSize });
        } else if (seat.status === 'LOCKED') {
            // 锁定的座位
            return hallTemplate.legendIcons.LOCKED.icon({ size: seatSize });
        } else {
            // 可选座位，使用座位类型的图标
            return seatTypeConfig.icon({ size: seatSize });
        }
    };

    const renderSeatsInRow = (rowLabel: string) => {
        if (!scheduleDetail?.hall) return null;

        const hallType = scheduleDetail.hall.type;
        const hallTemplate = hallConfig[hallType];

        if (!hallTemplate) return null;

        const rowSeats = scheduleDetail.seats
            .filter(seat => seat.rowLabel === rowLabel)
            .sort((a, b) => a.colNum - b.colNum);

        // 动态决定过道
        const colCount = scheduleDetail.hall.colCount;
        const aislePositions = colCount < 8 ? [] : (hallTemplate.aislePositions || []);

        return (
            <div key={rowLabel} className={styles['seat-row']}>
                <div className={styles['row-label']}>{rowLabel}</div>
                <div className={styles['row-seats']}>
                    {rowSeats.map((seat, index) => (
                        <React.Fragment key={seat.ssId}>
                            <div
                                className={`seat ${seat.status === 'OCCUPIED' ? 'occupied' : ''} ${seat.status === 'LOCKED' ? 'locked' : ''} ${selectedSeats.some(s => s.ssId === seat.ssId) ? 'selected' : ''}`}
                                onClick={() => handleSeatClick(seat)}
                            >
                                {getSeatIcon(seat)}
                            </div>
                            {aislePositions.includes(index + 1) && <div className={styles['aisle']} />}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        );
    };

    const getCurrentDateSchedules = () => {
        if (!availableSchedules || !scheduleDetail) return [];
        const currentDate = format(new Date(scheduleDetail.schedule.startTime), 'yyyy-MM-dd');
        return availableSchedules.schedules[currentDate] || [];
    };

    if (loading) {
        return <div className={styles['loading']}>加载中...</div>;
    }

    if (error) {
        return <div className={styles['error-message']}>{error}</div>;
    }

    if (!scheduleDetail) {
        return <div className={styles['no-data']}>暂无座位信息</div>;
    }

    return (
        <div className={styles['seat-selection-container']}>
            <div className={styles['movie-info-container']}>
                <div className={styles['movie-info']}>
                    <div className={styles['movie-title']}>
                        <h2>{scheduleDetail?.movie.title}</h2>
                        <span className={styles['movie-english-title']}>{scheduleDetail?.movie.englishTitle}</span>
                    </div>
                    <div className={styles['movie-details']}>
                        <div className={styles['detail-item']}>
                            <span className={styles['label']}>场次时间：</span>
                            <span className={styles['value']}>
                                {scheduleDetail && formatTime(scheduleDetail.schedule.startTime)}
                            </span>
                        </div>
                        <div className={styles['detail-item']}>
                            <span className={styles['label']}>影厅：</span>
                            <span className={styles['value']}>{scheduleDetail?.hall.name}</span>
                        </div>
                        <div className={styles['detail-item']}>
                            <span className={styles['label']}>类型：</span>
                            <span className={styles['value']}>{scheduleDetail?.movie.genres}</span>
                        </div>
                        <div className={styles['detail-item']}>
                            <span className={styles['label']}>时长：</span>
                            <span className={styles['value']}>{scheduleDetail?.movie.duration}分钟</span>
                        </div>
                        <Button
                            color="pink"
                            variant="solid"
                            onClick={() => setShowScheduleList(!showScheduleList)}
                        >
                            {showScheduleList ? '收起' : '选择其他场次'}
                        </Button>
                    </div>
                </div>
                <div className={styles['viewing-tips']}>
                    <h3>观影小贴士</h3>
                    <ul>
                        <li>请提前15分钟到达影厅，以免错过精彩开场</li>
                        <li>观影期间请将手机调至静音模式</li>
                        <li>请勿在影厅内饮食或大声喧哗</li>
                        <li>如遇紧急情况，请听从工作人员指引</li>
                    </ul>
                </div>

            </div>

            <div className={styles['screen-container']}>
                <div className={styles['screen']}>
                    <div className={styles['screen-text']}>{scheduleDetail.hall.name} 银幕</div>
                </div>
            </div>

            <div className={styles['seat-map-container']}>
                <div className={styles['seat-map']}>
                    {rowLabels.map(rowLabel => renderSeatsInRow(rowLabel))}
                </div>
            </div>

            <div className={styles['legend-container']}>
                <div className={styles['legend']}>
                    {scheduleDetail?.hall && hallConfig[scheduleDetail.hall.type]?.legendIcons && (
                        <>
                            <div className={styles['legend-item']}>
                                {hallConfig[scheduleDetail.hall.type].legendIcons.AVAILABLE.icon({ size: 24 })}
                                <span>可选</span>
                            </div>
                            <div className={styles['legend-item']}>
                                {hallConfig[scheduleDetail.hall.type].legendIcons.SELECTED.icon({ size: 24 })}
                                <span>已选</span>
                            </div>
                            <div className={styles['legend-item']}>
                                {hallConfig[scheduleDetail.hall.type].legendIcons.OCCUPIED.icon({ size: 24 })}
                                <span>已售</span>
                            </div>
                            <div className={styles['legend-item']}>
                                {hallConfig[scheduleDetail.hall.type].legendIcons.LOCKED.icon({ size: 24 })}
                                <span>锁定</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className={styles['selection-summary']}>
                <div className={styles['selected-seats']}>
                    <h3>已选座位</h3>
                    <div className={styles['seat-list']}>
                        {selectedSeats.map(seat => (
                            <div key={seat.ssId} className={styles['selected-seat-item']}>
                                <span className={styles['seat-info']}>{seat.rowLabel}排{seat.colNum}座</span>
                                <span className={styles['seat-price']}>¥{seat.price}</span>
                                <Button
                                    color="red"
                                    variant="outlined"
                                    size="small"
                                    shape="circle"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSeatClick(seat);
                                    }}
                                >
                                    ×
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className={styles['price-summary']}>
                    <div className={styles['total-price']}>
                        总计: ¥{calculateTotalPrice()}
                    </div>
                    <Button color="primary" variant="solid" onClick={handleConfirmOrder} disabled={selectedSeats.length === 0}>
                        确认选座
                    </Button>
                </div>
            </div>

            {/* 侧边场次选择抽屉 */}
            <div className={`${styles['schedule-drawer']} ${showScheduleList ? styles['open'] : ''}`}>
                <div className={styles['schedule-drawer-header']}>
                    <h3>选择场次</h3>
                    <button
                        className={styles['close-drawer-btn']}
                        onClick={() => setShowScheduleList(false)}
                    >
                        ×
                    </button>
                </div>
                <div className={styles['schedule-drawer-content']}>
                    {getCurrentDateSchedules().map(schedule => (
                        <div
                            key={schedule.scheduleId}
                            className={`${styles['schedule-item']} ${schedule.scheduleId === Number(scheduleId) ? styles['active'] : ''}`}
                            onClick={() => {
                                handleScheduleChange(schedule.scheduleId);
                                setShowScheduleList(false);
                            }}
                        >
                            <div className={styles['schedule-time']}>{formatTime(schedule.startTime)}</div>
                            <div className={styles['schedule-hall']}>{schedule.hallName}</div>
                            <div className={styles['schedule-price']}>¥{schedule.basePrice}起</div>
                        </div>
                    ))}
                </div>
            </div>
            {showScheduleList && <div className={styles['drawer-overlay']} onClick={() => setShowScheduleList(false)} />}
            {showLoginModal && (
                <div className={styles['login-modal']}>
                    <div className={styles['modal-content']}>
                        <h3>请先登录</h3>
                        <p>登录后即可选座</p>
                        <button onClick={() => {
                            setShowLoginModal(false);
                            setShowLogin(true);
                        }}>去登录</button>
                        <button onClick={() => setShowLoginModal(false)}>取消</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SeatSelection;