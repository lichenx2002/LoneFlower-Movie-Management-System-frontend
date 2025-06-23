import React, { useState, useEffect } from 'react';
import { Movies, MovieStatus } from '../../types/movies';
import { moviesAPI } from '../../api/moviesAPI';
import { getProxiedImageUrl, getFallbackImageUrl } from '../../utils/imageProxy';
// @ts-ignore
import styles from './index.module.css';
import { useNavigate } from "react-router-dom";
import { Button } from 'antd';

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [onShelfMovies, setOnShelfMovies] = useState<Movies[]>([]);
    const [comingSoonMovies, setComingSoonMovies] = useState<Movies[]>([]);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // 并行获取热映和即将上映的电影
                const [onShelfResponse, comingSoonResponse] = await Promise.all([
                    moviesAPI.getOnShelfMovies(),
                    moviesAPI.getComingSoonMovies()
                ]);

                setOnShelfMovies(onShelfResponse);
                setComingSoonMovies(comingSoonResponse);
            } catch (error) {
                console.error('获取电影数据失败:', error);
            }
        }
        fetchMovies();
    }, []);

    const handleMovieClick = (movieId: number) => {
        navigate(`/MovieDetail/${movieId}`);
    }

    // 获取评分最高的前5部电影（从所有电影中筛选）
    const allMovies = [...onShelfMovies, ...comingSoonMovies];
    const topRatedMovies = [...allMovies]
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 5);

    // 处理图片URL
    const getImageUrl = (originalUrl: string) => {
        if (!originalUrl) return getFallbackImageUrl();

        // 如果是豆瓣图片，使用代理
        if (originalUrl.includes('doubanio.com')) {
            return getProxiedImageUrl(originalUrl);
        }

        return originalUrl;
    };

    // 渲染电影卡片的通用组件
    const renderMovieCard = (movie: Movies) => (
        <div
            key={movie.movieId}
            className={styles['movie-card']}
        >
            <div className={styles['poster-container']}>
                <img
                    src={getImageUrl(movie.posterUrl)}
                    alt={movie.title}
                    className={styles['poster-image']}
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getFallbackImageUrl();
                    }}
                />
                <div className={styles['rating-tag']}>
                    {movie.avgRating.toFixed(1)}分
                </div>
            </div>

            <div className={styles['movie-info']}>
                <h3 className={styles['movie-title']}>
                    {movie.title}
                </h3>

                <div className={styles['movie-meta']}>
                    <span>导演：{movie.director}</span>
                    <span>{movie.duration}分钟</span>
                </div>

                <div className={styles['movie-description']}>
                    {movie.description}
                </div>

                <div className={styles['movie-footer']}>
                    <span className={styles['movie-price']}>
                        ¥{movie.avgRating * 10}
                    </span>
                    <Button
                        onClick={() => handleMovieClick(movie.movieId)}
                        color="primary"
                        variant="solid"
                    >
                        {movie.status === MovieStatus.COMING_SOON ? '查看详情' : '选座购票'}
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className={styles['page-container']}>
            <div className={styles['home-container']}>
                {/* 热映电影部分 */}
                <div className={styles['banner']}>
                    <h1>热映电影</h1>
                    <p>最新上映，精彩不断</p>
                </div>

                <div className={styles['movie-grid']}>
                    {onShelfMovies.map(renderMovieCard)}
                </div>

                {/* 即将上映电影部分 */}
                {comingSoonMovies.length > 0 && (
                    <>
                        <div className={styles['banner']} style={{ marginTop: '40px' }}>
                            <h1>即将上映</h1>
                            <p>精彩预告，敬请期待</p>
                        </div>

                        <div className={styles['movie-grid']}>
                            {comingSoonMovies.map(renderMovieCard)}
                        </div>
                    </>
                )}
            </div>

            <div className={styles['ranking-card']}>
                <h2 className={styles['ranking-title']}>评分排行</h2>
                <ul className={styles['ranking-list']}>
                    {topRatedMovies.map((movie, index) => (
                        <li key={movie.movieId} className={styles['ranking-item']}>
                            <div className={styles['ranking-number']}>{index + 1}</div>
                            <div className={styles['ranking-info']}>
                                <div className={styles['ranking-movie-title']}>{movie.title}</div>
                                <div className={styles['ranking-rating']}>{movie.avgRating.toFixed(1)}分</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Home;