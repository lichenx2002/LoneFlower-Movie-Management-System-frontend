import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { navRoutes } from '../../routes/nav-routes';
import Search from "antd/es/input/Search";
import { UserOutlined, LogoutOutlined, IdcardOutlined } from '@ant-design/icons';
import { Alert, Avatar, Space, Dropdown, Menu, message } from "antd";
// @ts-ignore
import styles from './index.module.css';
import { Movies } from "../../types/movies";
import { moviesAPI } from "../../api/moviesAPI";
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useAuth } from '../../context/AuthContext';
import { logout as logoutThunk } from '../../redux/userAuth/thunks';

const Navbar: React.FC = () => {
    const [movies, setMovies] = useState<Movies[]>();
    const [searchValue, setSearchValue] = useState('');
    const [filteredMovies, setFilteredMovies] = useState<Movies[]>([]);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const navigate = useNavigate();
    const { setShowLogin } = useAuth();
    const { user } = useSelector((state: RootState) => state.auth);
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await moviesAPI.getAllMovies()
                setMovies(response)
            } catch (err) {
                console.error('获取电影列表失败:', err);
            }
        }
        fetchMovies();
    }, []);

    // 实时模糊匹配
    useEffect(() => {
        if (!searchValue || !movies) {
            setFilteredMovies([]);
            setDropdownVisible(false);
            return;
        }
        const matched = movies.filter(movie => movie.title.includes(searchValue));
        setFilteredMovies(matched);
        setDropdownVisible(true);
    }, [searchValue, movies]);

    const handleMenuClick = (movieId: number) => {
        setDropdownVisible(false);
        setSearchValue('');
        navigate(`/MovieDetail/${movieId}`);
    };

    const handleLogout = () => {
        dispatch(logoutThunk());
        message.success('已退出登录');
        navigate('/');
    };

    const menu = (
        <Menu>
            {filteredMovies.length > 0 ? (
                filteredMovies.map(movie => (
                    <Menu.Item key={movie.movieId} onClick={() => handleMenuClick(movie.movieId)}>
                        {movie.title}
                    </Menu.Item>
                ))
            ) : (
                <Menu.Item disabled key="no-match">无匹配电影</Menu.Item>
            )}
        </Menu>
    );

    const avatarMenu = (
        <Menu>
            {user ? (
                <>
                    <Menu.Item key="profile" icon={<IdcardOutlined />} onClick={() => navigate('/profile')}>
                        个人信息
                    </Menu.Item>
                    <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                        退出登录
                    </Menu.Item>
                </>
            ) : (
                <Menu.Item key="login" icon={<UserOutlined />} onClick={() => setShowLogin(true)}>
                    去登录
                </Menu.Item>
            )}
        </Menu>
    );

    return (
        <div>
            <nav className={styles.navbar}>
                <div className={styles.navLogo}>
                    <img className={styles.moviesIcon} src="/images/movies.png" alt="" />
                    <span>孤芳电影</span>
                </div>
                <ul className={styles.navLinks}>
                    {navRoutes
                        .filter((navRoutes) => navRoutes.id <= 4)
                        .map((route) => (
                            <li key={route.path} >
                                <Link
                                    className={styles.navLinksItem}
                                    to={route.path}
                                >{route.name}</Link>
                            </li>
                        ))}
                </ul>
                <div>
                    <Space.Compact>
                        <Dropdown
                            overlay={menu}
                            visible={dropdownVisible && (searchValue.length > 0)}
                            onVisibleChange={setDropdownVisible}
                            placement="bottomLeft"
                        >
                            <Search
                                placeholder="请输入电影名称"
                                allowClear
                                value={searchValue}
                                onChange={e => setSearchValue(e.target.value)}
                                onSearch={v => setSearchValue(v)}
                                style={{ width: 200 }}
                                onBlur={() => setTimeout(() => setDropdownVisible(false), 200)}
                                onFocus={() => { if (filteredMovies.length > 0) setDropdownVisible(true); }}
                            />
                        </Dropdown>
                    </Space.Compact>
                </div>
                <div>
                    <Dropdown overlay={avatarMenu} trigger={["hover"]} placement="bottomRight">
                        <Avatar size={32} icon={<UserOutlined />} style={{ cursor: 'pointer' }} />
                    </Dropdown>
                </div>
            </nav>
        </div>
    );
};

export default Navbar;