import React from 'react';

interface SeatIconProps {
    size?: number;        // 图标大小
    color?: string;       // 图标颜色
    className?: string;   // 自定义类名
    style?: React.CSSProperties; // 自定义样式
}

const SeatIcon: React.FC<SeatIconProps> = ({
    size = 200,
    color = 'currentColor',
    className = '',
    style = {}
}) => {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 1024 1024"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            style={style}
        >
            <path
                d="M935 959H729c-14 0-25-11-25-25v-39H320v39c0 14-11 25-25 25H90c-14 0-25-11-25-25V409c0-14 11-25 25-25h39V138c0-41 33-75 75-75h618c41 0 75 34 75 75v245h39c14 0 25 11 25 25v525c0 14-11 25-25 25zM833 152c0-14-11-25-25-25H216c-14 0-25 11-25 25v231h42c14 0 23 11 23 25v167h512V409c0-14 11-25 25-25h40V152zm64 295h-64v167c0 14-11 25-25 25H217c-14 0-25-11-25-25V447h-64v449h130v-39c0-14 11-25 25-25h461c14 0 25 11 25 25v39h129V447z"
                fill={color}
                stroke="none"
            />
        </svg>
    );
};

export default SeatIcon;