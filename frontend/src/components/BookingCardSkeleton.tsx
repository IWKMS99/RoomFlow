import React from 'react';
import Skeleton from './Skeleton';
import cardStyles from '../pages/MyBookingsPage.module.css';

const BookingCardSkeleton: React.FC = () => {
    return (
        <div className={cardStyles.bookingCard}>
            <div className={cardStyles.cardTop}>
                <div>
                    <Skeleton width="180px" height="24px"/>
                    <div style={{height: '8px'}}/>
                    <Skeleton width="250px" height="18px"/>
                </div>
                <Skeleton width="80px" height="22px"/>
            </div>
        </div>
    );
};

export default BookingCardSkeleton;