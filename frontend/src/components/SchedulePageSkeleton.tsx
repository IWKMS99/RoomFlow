import React from 'react';
import Skeleton from './Skeleton';
import styles from '../pages/SchedulePage.module.css';

const SchedulePageSkeleton: React.FC = () => {
    const skeletonSlots = Array.from({length: 5});
    const skeletonRooms = Array.from({length: 2});

    return (
        <div className={styles.timeSlotsContainer}>
            {skeletonSlots.map((_, slotIndex) => (
                <div key={slotIndex} className={styles.timeSlot}>
                    <div className={styles.timeLabel}>
                        <Skeleton width="100px" height="20px"/>
                    </div>
                    <div className={styles.roomsList}>
                        {skeletonRooms.map((__, roomIndex) => (
                            <div key={roomIndex} className={styles.roomCard} style={{borderColor: 'var(--bg-card)'}}>
                                <div className={styles.roomInfo}>
                                    <Skeleton width="8px" height="8px" className="skeleton-circle"/>
                                    <div>
                                        <Skeleton width="150px" height="20px"/>
                                        <div style={{height: '4px'}}/>
                                        <Skeleton width="120px" height="16px"/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SchedulePageSkeleton;