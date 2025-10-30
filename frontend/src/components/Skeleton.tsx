import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
    width?: string;
    height?: string;
    className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({width = '100%', height = '1rem', className = ''}) => {
    return (
        <div className={`${styles.skeleton} ${className}`} style={{width, height}}>
            <div className={styles.shimmer}></div>
        </div>
    );
};

export default Skeleton;