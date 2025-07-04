﻿# LoneFlower-Movie-Management-System-frontend

## 项目简介

本项目是一个基于 React 18 + TypeScript 的电影院选座与购票系统前端，实现了电影浏览、场次选择、智能选座、订单管理、用户认证、后台管理等完整购票流程。项目注重业务场景还原、用户体验和可扩展性，适合展示前端开发的综合能力。

---

## 主要功能

- **电影浏览与筛选**：支持按类型、年代、地区等多维度筛选电影，展示电影详情。
- **场次与座位选择**：可视化展示影厅座位图，支持多种影厅类型（大型/中型/小型/情侣厅），动态渲染过道。
- **智能选座系统**：支持情侣厅配对选座，自动选中相邻情侣座，普通厅支持多选。
- **订单管理**：下单、订单确认、历史订单查询。
- **用户系统**：注册、登录、权限校验，未登录用户无法下单。
- **后台管理**：管理员可管理电影、场次、用户、订单、评论等。
- **评论与评分**：用户可对电影进行评论和评分。

---

## 技术栈

- **前端框架**：React 18
- **语言**：TypeScript
- **状态管理**：Redux Toolkit + Redux Thunk + React Context
- **UI组件库**：Ant Design
- **路由管理**：React Router v6
- **样式**：CSS Modules
- **HTTP请求**：自定义请求封装，支持拦截器、错误处理
- **工具**：Webpack、react-app-rewired、date-fns

---

## 目录结构

```
cinemafrontend/
├── public/                # 静态资源
├── src/
│   ├── api/               # 所有后端接口请求
│   ├── components/        # 复用组件（如座位图标、导航栏、筛选组等）
│   ├── config/            # 配置文件（如影厅配置）
│   ├── context/           # React Context（如认证上下文）
│   ├── http/              # HTTP请求封装与拦截器
│   ├── layout/            # 页面布局组件
│   ├── page/              # 业务页面（首页、电影、选座、订单、后台等）
│   ├── redux/             # Redux相关（store、reducer、thunk等）
│   ├── routes/            # 路由配置
│   ├── styles/            # 全局样式
│   ├── types/             # TypeScript类型定义
│   ├── utils/             # 工具函数
│   └── index.tsx          # 应用入口
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## 运行方式

1. **安装依赖**

   ```bash
   npm install
   ```

2. **启动开发环境**

   ```bash
   npm start
   ```

3. **打包生产环境**

   ```bash
   npm run build
   ```

> 需要配合后端API服务使用，后端接口请参考 `/src/api/` 目录下的实现。

---

## 特色与亮点

- **多影厅类型支持**：通过配置文件支持大型、中型、小型、情侣厅等多种影厅布局和座位类型。
- **情侣厅配对选座**：实现情侣座自动配对选中/取消，提升用户体验。
- **动态过道渲染**：根据影厅配置动态渲染过道，座位布局灵活。
- **自定义HTTP拦截器**：统一处理认证、错误、重试等请求逻辑，便于维护和扩展。
- **状态管理分层**：Redux管理全局业务状态，Context管理局部UI状态，结构清晰。
- **组件化设计**：座位图标、筛选组、导航栏等高度复用，样式模块化隔离。
- **TypeScript全覆盖**：类型安全，便于维护和团队协作。
- **用户权限控制**：未登录用户无法下单，管理员有独立后台管理入口。
- **良好的用户体验**：响应式布局，交互流畅，错误提示友好。

---

## 部分核心代码示例

### 情侣厅配对选座逻辑

```typescript
// src/page/SeatSelection/index.tsx
const pairedSeat = scheduleDetail.seats.find(s =>
  s.rowLabel === seat.rowLabel &&
  ((seat.colNum % 2 === 1 && s.colNum === seat.colNum + 1) ||
   (seat.colNum % 2 === 0 && s.colNum === seat.colNum - 1))
);
```

### 影厅配置

```typescript
// src/config/hallConfig.tsx
export const hallConfig: Record<string, HallTypeConfig> = {
  LARGE: { aislePositions: [5, 20], ... },
  MEDIUM: { aislePositions: [4, 16], ... },
  SMALL: { aislePositions: [3, 12], ... },
  LOVERS: { aislePositions: [2, 10], ... }
};
```

---

## 适用场景

- 作为前端开发实习/校招/社招的项目作品
- 展示业务理解、系统设计、用户体验优化等综合能力
- 适合有电影院、票务、座位管理等相关业务需求的场景

---

## 贡献与反馈

如有建议或发现问题，欢迎提 issue 或 pull request！

---

## 作者信息

👨‍💻 **作者**: 李晨熙 (lichenx2002)

🔗 **GitHub**: [@lichenxigk2002](https://github.com/lichenxigk2002)

📝 **个人博客**: [孤芳不自赏](https://www.gfbzsblog.site/)

💼 **技术栈**: Java + TypeScript 全栈开发，正在学习 HarmonyOS Next

🎯 **目标**: 励志成为 Web3.0 的先锋

---

## 注意事项

- **本项目仅为前端部分，需配合后端项目 [LoneFlower-Movie-Management-System-backend](https://github.com/lichenx2002/LoneFlower-Movie-Management-System-backend) 一起使用。**
- 请先启动后端服务，并在前端项目中根据实际情况配置好 API 接口地址（如 `.env` 文件或相关配置文件）。
- 前后端接口需保持一致，否则部分功能无法正常使用。

---

# LoneFlower-Movie-Management-System-frontend

## Project Overview

This project is a cinema seat selection and ticketing frontend system built with React 18 and TypeScript. It implements a complete ticket purchasing workflow, including movie browsing, schedule selection, intelligent seat selection, order management, user authentication, and admin management. The project focuses on realistic business scenarios, user experience, and scalability, making it suitable for showcasing comprehensive frontend development skills.

---

## Main Features

- **Movie Browsing & Filtering**: Browse and filter movies by genre, year, region, etc., and view detailed information.
- **Schedule & Seat Selection**: Visual seat map for different auditorium types (large/medium/small/couple), with dynamic aisle rendering.
- **Intelligent Seat Selection**: Supports couple seat pairing logic in couple auditoriums; multi-selection in standard auditoriums.
- **Order Management**: Place orders, confirm orders, and view order history.
- **User System**: Registration, login, permission checks; unregistered users cannot place orders.
- **Admin Management**: Admins can manage movies, schedules, users, orders, and comments.
- **Comments & Ratings**: Users can comment on and rate movies.

---

## Tech Stack

- **Frontend Framework**: React 18
- **Language**: TypeScript
- **State Management**: Redux Toolkit + Redux Thunk + React Context
- **UI Library**: Ant Design
- **Routing**: React Router v6
- **Styling**: CSS Modules
- **HTTP Requests**: Custom request wrapper with interceptors and error handling
- **Tools**: Webpack, react-app-rewired, date-fns

---

## Directory Structure

```
cinemafrontend/
├── public/                # Static assets
├── src/
│   ├── api/               # All backend API requests
│   ├── components/        # Reusable components (seat icon, navbar, filter group, etc.)
│   ├── config/            # Config files (e.g., auditorium config)
│   ├── context/           # React Context (e.g., auth context)
│   ├── http/              # HTTP request wrappers and interceptors
│   ├── layout/            # Layout components
│   ├── page/              # Business pages (home, movies, seat selection, orders, admin, etc.)
│   ├── redux/             # Redux (store, reducer, thunk, etc.)
│   ├── routes/            # Route configuration
│   ├── styles/            # Global styles
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.tsx          # App entry point
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start development server**

   ```bash
   npm start
   ```

3. **Build for production**

   ```bash
   npm run build
   ```

> This project requires a backend API service. Please refer to the implementations in `/src/api/`.

---

## Features & Highlights

- **Multiple Auditorium Types**: Supports large, medium, small, and couple auditoriums via configuration files.
- **Couple Seat Pairing**: Automatically selects/deselects paired seats in couple auditoriums for a better user experience.
- **Dynamic Aisle Rendering**: Dynamically renders aisles based on auditorium configuration for flexible seat layouts.
- **Custom HTTP Interceptors**: Unified handling of authentication, errors, and retries for maintainability and extensibility.
- **Layered State Management**: Redux for global business state, Context for local UI state, with clear structure.
- **Componentization**: Highly reusable components (seat icon, filter group, navbar, etc.) with modular CSS.
- **Full TypeScript Coverage**: Type safety for easier maintenance and team collaboration.
- **User Permission Control**: Unauthenticated users cannot place orders; admins have a separate management portal.
- **Good User Experience**: Responsive layout, smooth interactions, and friendly error messages.

---

## Core Code Examples

### Couple Seat Pairing Logic

```typescript
// src/page/SeatSelection/index.tsx
const pairedSeat = scheduleDetail.seats.find(s =>
  s.rowLabel === seat.rowLabel &&
  ((seat.colNum % 2 === 1 && s.colNum === seat.colNum + 1) ||
   (seat.colNum % 2 === 0 && s.colNum === seat.colNum - 1))
);
```

### Auditorium Configuration

```typescript
// src/config/hallConfig.tsx
export const hallConfig: Record<string, HallTypeConfig> = {
  LARGE: { aislePositions: [5, 20], ... },
  MEDIUM: { aislePositions: [4, 16], ... },
  SMALL: { aislePositions: [3, 12], ... },
  LOVERS: { aislePositions: [2, 10], ... }
};
```

---

## Use Cases

- As a project for frontend development internship/campus recruitment/job application
- To demonstrate business understanding, system design, and user experience optimization
- Suitable for cinema, ticketing, or seat management business scenarios

---

## Contribution & Feedback

如有建议或发现问题，欢迎提 issue 或 pull request！

---

## Author Information

👨‍💻 **Author**: Chenxi Li (lichenx2002)

🔗 **GitHub**: [@lichenx2002](https://github.com/lichenx2002)

📝 **Personal Blog**: [孤芳不自赏](https://www.gfbzsblog.site/)

💼 **Tech Stack**: Java + TypeScript Full-stack Development, learning HarmonyOS Next

🎯 **Goal**: Aspiring to be a Web3.0 pioneer

---

## Notice

- **This project is the frontend part only. It must be used together with the backend project: [LoneFlower-Movie-Management-System-backend](https://github.com/lichenx2002/LoneFlower-Movie-Management-System-backend).**
- Please start the backend service first, and configure the API endpoint in the frontend project (such as in the `.env` file or related config files) according to your actual environment.
- The frontend and backend API specifications must match, otherwise some features may not work properly.

---
