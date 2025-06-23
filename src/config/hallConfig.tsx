import React from 'react';
import SeatIcon from "../components/SeatIcon";

// 座位状态类型定义：可用、已选择、已占用、锁定
export type SeatStatus = 'AVAILABLE' | 'SELECTED' | 'OCCUPIED' | 'LOCKED';

// 座位类型配置接口
interface SeatTypeConfig {
  color: string;  // 座位颜色
  icon: (props: React.ComponentProps<typeof SeatIcon>) => JSX.Element;  // 座位图标组件
}

// 影厅类型配置接口
interface HallTypeConfig {
  aislePositions: number[];  // 过道位置（列号）
  seatTypes: {  // 座位类型配置
    [key: string]: SeatTypeConfig;
  };
  legendIcons: {  // 图例图标配置
    [key in SeatStatus]: {
      color: string;
      icon: (props: React.ComponentProps<typeof SeatIcon>) => JSX.Element;
    };
  };
}

// 影厅配置对象：包含大型、中型、小型和情侣厅的配置
export const hallConfig: Record<string, HallTypeConfig> = {
  // 大型影厅配置
  LARGE: {
    aislePositions: [5, 20], // 在第5列和第19列后添加过道
    seatTypes: {
      STANDARD: {  // 标准座位（大写）
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      VIP: {  // VIP座位
        color: '#ffd700',  // 金色
        icon: (props) => <SeatIcon {...props} color="#ffd700" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    },
    legendIcons: {  // 图例配置
      AVAILABLE: {  // 可用座位
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      SELECTED: {  // 已选择座位
        color: '#83fc5c',
        icon: (props) => <SeatIcon {...props} color="#83fc5c" />
      },
      OCCUPIED: {  // 已占用座位
        color: '#fd0000',
        icon: (props) => <SeatIcon {...props} color="#ff4545" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    }
  },
  // 中型影厅配置
  MEDIUM: {
    aislePositions: [4, 16],  // 在第4列和第15列后添加过道
    seatTypes: {
      standard: {  // 标准座位
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      STANDARD: {  // 标准座位（大写）
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      VIP: {  // VIP座位
        color: '#ffd700',  // 金色
        icon: (props) => <SeatIcon {...props} color="#ffd700" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    },
    legendIcons: {  // 图例配置
      AVAILABLE: {  // 可用座位
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      SELECTED: {  // 已选择座位
        color: '#83fc5c',
        icon: (props) => <SeatIcon {...props} color="#83fc5c" />
      },
      OCCUPIED: {  // 已占用座位
        color: '#ff4545',
        icon: (props) => <SeatIcon {...props} color="#ff4545" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    }
  },
  // 小型影厅配置
  SMALL: {
    aislePositions: [3, 12],  // 在第3列和第12列后添加过道
    seatTypes: {
      standard: {  // 标准座位
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      STANDARD: {  // 标准座位（大写）
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      VIP: {  // VIP座位
        color: '#ffd700',  // 金色
        icon: (props) => <SeatIcon {...props} color="#ffd700" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    },
    legendIcons: {  // 图例配置
      AVAILABLE: {  // 可用座位
        color: '#8c8c8c',
        icon: (props) => <SeatIcon {...props} color="#8c8c8c" />
      },
      SELECTED: {  // 已选择座位
        color: '#83fc5c',
        icon: (props) => <SeatIcon {...props} color="#83fc5c" />
      },
      OCCUPIED: {  // 已占用座位
        color: '#ff4545',
        icon: (props) => <SeatIcon {...props} color="#ff4545" />
      },
      LOCKED: {  // 锁定座位
        color: '#ff6b49',
        icon: (props) => <SeatIcon {...props} color="#ff6b49" />
      }
    }
  },
  // 情侣厅配置
  LOVERS: {
    aislePositions: [2, 10],  // 在第2列和第10列后添加过道
    seatTypes: {
      couple: {  // 情侣座位
        color: '#f6b2d6',
        icon: (props) => <SeatIcon {...props} color="#f6b2d6" />
      },
      COUPLE: {  // 情侣座位（大写）
        color: '#f6b2d6',
        icon: (props) => <SeatIcon {...props} color="#f6b2d6" />
      },
      LOCKED: {  // 锁定座位
        color: '#a891e5',
        icon: (props) => <SeatIcon {...props} color="#a891e5" />
      },
    },
    legendIcons: {  // 图例配置
      AVAILABLE: {  // 可用座位
        color: '#f6b2d6',
        icon: (props) => <SeatIcon {...props} color="#f6b2d6" />
      },
      SELECTED: {  // 已选择座位
        color: '#0fffe7',
        icon: (props) => <SeatIcon {...props} color="#0fffe7" />
      },
      OCCUPIED: {  // 已占用座位
        color: '#f12b96',
        icon: (props) => <SeatIcon {...props} color="#f12b96" />
      },
      LOCKED: {  // 锁定座位
        color: '#a891e5',
        icon: (props) => <SeatIcon {...props} color="#a891e5" />
      }
    }
  }
};
