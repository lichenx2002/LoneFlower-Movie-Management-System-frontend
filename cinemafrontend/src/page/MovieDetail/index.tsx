import React, { useEffect, useState, startTransition } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";
import { Button } from 'antd';
import { Movies, MovieStatus } from '../../types/movies';
import { moviesAPI } from "../../api/moviesAPI";
import { commentAPI } from '../../api/commentAPI';
import { Comment } from '../../types/comment';
import { List, Input, Rate, message, Popconfirm } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { userAuthAPI } from '../../api/userAPI';
import { getProxiedImageUrl, getFallbackImageUrl } from '../../utils/imageProxy';
import { getSensitiveWordsMessage, checkSensitiveWordsAPI } from '../../utils/sensitiveWords';
// @ts-ignore
import styles from './index.module.css';

const MovieDetail: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [movie, setMovie] = useState<Movies | null>(null);
    const [recommendedMovies, setRecommendedMovies] = useState<Movies[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentContent, setCommentContent] = useState('');
    const [commentRating, setCommentRating] = useState(5);
    const [commentLoading, setCommentLoading] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);
    const [userInfoMap, setUserInfoMap] = useState<{ [userId: number]: { username: string | null, phone: string } }>({});

    // 检查是否在选场次页面
    const isSchedulePage = () => {
        return location.pathname.includes('/schedule');
    };

    // 处理图片URL
    const getImageUrl = (originalUrl: string) => {
        if (!originalUrl) return getFallbackImageUrl();

        // 如果是豆瓣图片，使用代理
        if (originalUrl.includes('doubanio.com')) {
            return getProxiedImageUrl(originalUrl);
        }

        return originalUrl;
    };

    // 获取推荐电影
    const getRecommendedMovies = (currentMovie: Movies, allMovies: Movies[]) => {
        if (!currentMovie.genres) return [];

        const currentGenres = currentMovie.genres.split(',').map(genre => genre.trim());

        // 过滤出与当前电影类型相似且不是同一部电影的电影
        const similarMovies = allMovies.filter(movie =>
            movie.movieId !== currentMovie.movieId &&
            movie.genres &&
            currentGenres.some(genre => movie.genres.includes(genre))
        );

        // 按评分排序，取前3个
        return similarMovies
            .sort((a, b) => b.avgRating - a.avgRating)
            .slice(0, 3);
    };

    useEffect(() => {
        const fetchMovieDetail = async () => {
            setLoading(true);
            try {
                // 并行获取电影详情和所有电影
                const [movieResponse, allMoviesResponse] = await Promise.all([
                    moviesAPI.getMovieById(Number(id)),
                    moviesAPI.getAllMovies()
                ]);

                startTransition(() => {
                    setMovie(movieResponse);
                    // 获取推荐电影
                    const recommendations = getRecommendedMovies(movieResponse, allMoviesResponse);
                    setRecommendedMovies(recommendations);
                    setLoading(false);
                });
            } catch (err) {
                setError('获取电影详情失败');
                setLoading(false);
                console.error(err);
            }
        }
        if (id) {
            fetchMovieDetail();
        }
    }, [id]);

    // 获取评论
    useEffect(() => {
        if (!id) return;
        const fetchComments = async () => {
            try {
                const res = await commentAPI.getMovieComments(Number(id));
                setComments(res);

                // 收集所有 userId
                const userIds = Array.from(new Set(res.map(c => c.userId)));
                // 批量查用户信息
                const userInfoResults = await Promise.all(
                    userIds.map(uid => userAuthAPI.getUserProfile(uid).catch(() => null))
                );
                const map: { [userId: number]: { username: string | null, phone: string } } = {};
                userIds.forEach((uid, idx) => {
                    const info = userInfoResults[idx];
                    if (info) map[uid] = { username: info.username, phone: info.phone };
                });
                setUserInfoMap(map);
            } catch (err) {
                setComments([]);
            }
        };
        fetchComments();
    }, [id]);

    const handleBookClick = () => {
        if (movie) {
            navigate(`/MovieDetail/${movie.movieId}/schedule`);
        }
    };

    const handleRecommendClick = (movieId: number) => {
        navigate(`/MovieDetail/${movieId}`);
    };

    const handleAddComment = async () => {
        if (!user) {
            message.warning('请先登录后再评论');
            return;
        }
        if (!commentContent.trim()) {
            message.warning('请输入评论内容');
            return;
        }

        // 本地敏感词检测
        const sensitiveWordsMessage = getSensitiveWordsMessage(commentContent);
        if (sensitiveWordsMessage) {
            message.warning(sensitiveWordsMessage);
            return;
        }

        setCommentLoading(true);
        try {
            await commentAPI.addMovieComment(user.userId, Number(id), commentContent, commentRating);
            setCommentContent('');
            setCommentRating(5);
            message.success('评论成功');
            // 重新获取评论
            const res = await commentAPI.getMovieComments(Number(id));
            setComments(res);
        } catch (err) {
            message.error('评论失败');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            await commentAPI.deleteMovieComment(commentId);
            message.success('删除成功');
            setComments(comments.filter(c => c.commentId !== commentId));
        } catch (err) {
            message.error('删除失败');
        }
    };

    if (loading) {
        return (
            <div className={styles['loading-container']}>
                <div className={styles['loading-spinner']}></div>
                <div className={styles['loading-text']}>加载中...</div>
            </div>
        );
    }

    if (error) {
        return <div className={styles['error-message']}>{error}</div>;
    }

    if (!movie) {
        return <div className={styles['no-data']}>暂无电影数据</div>;
    }

    return (
        <div className={styles['movie-detail-container']}>
            {/* 顶部海报和信息区域 */}
            <div className={styles['movie-detail-top']}>
                <div className={styles['movie-detail-top-container']}>
                    {/* 电影海报 */}
                    <div className={styles['movie-post']}>
                        <img
                            src={getImageUrl(movie.posterUrl)}
                            alt={movie.title}
                            className={styles['poster-image']}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getFallbackImageUrl();
                            }}
                        />
                        <div className={styles['poster-overlay']}>
                            <button className={styles['play-trailer-btn']}>
                                <i className={styles['icon-play']}></i> 播放预告片
                            </button>
                        </div>
                    </div>

                    {/* 电影基本信息 */}
                    <div className={styles['movie-message']}>
                        <h2 className={styles['movie-title']}>{movie.title}</h2>
                        <p className={styles['movie-english-title']}>{movie.englishTitle}</p>

                        <div className={styles['movie-meta']}>
                            <span className={styles['meta-item']}>

                                电影类型：{movie.genres}
                            </span>
                            <span className={styles['meta-item']}>
                                影片时长：{movie.duration}分钟
                            </span>
                            <span className={styles['meta-item']}>
                                {movie.releaseDate} {movie.releaseLocation}
                            </span>
                            <span className={styles['meta-item']}>
                                导演： {movie.director}
                            </span>
                        </div >
                        <div className={styles['meta-buttons']}>
                            {!isSchedulePage() && movie.status === MovieStatus.ON_SHELF && (
                                <Button
                                    size='large'
                                    color="danger"
                                    variant="solid"
                                    onClick={handleBookClick}
                                >
                                    立即购票
                                </Button>
                            )}
                            {!isSchedulePage() && movie.status === MovieStatus.COMING_SOON && (
                                <Button
                                    size='large'
                                    color="primary"
                                    variant="outlined"
                                    disabled
                                >
                                    即将上映
                                </Button>
                            )}
                            {!isSchedulePage() && movie.status === MovieStatus.OFF_SHELF && (
                                <Button
                                    size='large'
                                    color="default"
                                    variant="outlined"
                                    disabled
                                >
                                    已下架
                                </Button>
                            )}
                        </div>

                    </div>

                    {/* 评分和票房 */}
                    <div className={styles['movie-rating']}>
                        <div className={styles['rating-box']}>
                            <div className={styles['rating-score']}>{movie.avgRating.toFixed(1)}</div>
                            <div className={styles['rating-text']}>观众评分</div>
                            <div className={styles['rating-stars']}>
                                {[...Array(5)].map((_, i) => (
                                    <i
                                        key={i}
                                        className={`icon-star ${i < Math.floor(movie.avgRating / 2) ? 'filled' : ''}`}
                                    ></i>
                                ))}
                            </div>
                        </div>

                        <div className={styles['box-office']}>
                            <div className={styles['box-office-text']}>累计票房</div>
                            <div className={styles['box-office-number']}>{movie.boxOffice}元</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 中部详情内容区域 */}
            {isSchedulePage() ? (
                <Outlet />
            ) : (
                <div className={styles['movie-detail-center-container']}>
                    <div className={styles['movie-detail-left']}>
                        {/* 剧情简介 */}
                        <div className={styles['movie-detail-message']}>
                            <div className={styles['movie-detail-header']}>剧情简介</div>
                            <div className={styles['movie-description']}>{movie.description}</div>
                        </div>

                        {/* 演员列表 */}
                        <div className={styles['movie-detail-message']}>
                            <div className={styles['movie-detail-header']}>演员列表</div>
                            <div className={styles['actors-list']}>
                                {movie.actors}
                            </div>
                        </div>

                        {/* 评论区 */}
                        <div className={styles['movie-detail-message']}>
                            <div className={styles['movie-detail-header']}>评论区</div>
                            <div style={{ marginBottom: 16 }}>
                                <Input.TextArea
                                    rows={3}
                                    maxLength={200}
                                    value={commentContent}
                                    onChange={e => setCommentContent(e.target.value)}
                                    placeholder={user ? '请输入评论内容' : '请先登录后评论'}
                                    disabled={!user}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                                    <span style={{ marginRight: 8 }}>评分：</span>
                                    <Rate value={commentRating} onChange={setCommentRating} disabled={!user} />
                                    <Button
                                        type="primary"
                                        style={{ marginLeft: 16 }}
                                        onClick={handleAddComment}
                                        loading={commentLoading}
                                        disabled={!user}
                                    >发布</Button>
                                </div>
                            </div>
                            <List
                                dataSource={comments}
                                locale={{ emptyText: '暂无评论' }}
                                renderItem={item => (
                                    <List.Item
                                        actions={user && user.userId === item.userId ? [
                                            <Popconfirm title="确定删除这条评论吗？" onConfirm={() => handleDeleteComment(item.commentId)} okText="删除" cancelText="取消">
                                                <Button color="danger" variant="text">
                                                    删除
                                                </Button>
                                            </Popconfirm>
                                        ] : []}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <span>
                                                    {
                                                        (() => {
                                                            const info = userInfoMap[item.userId];
                                                            console.log('评论用户信息:', info);
                                                            if (info && typeof info.username === 'string' && info.username.trim().length > 0) {
                                                                return info.username.trim();
                                                            } else if (info && typeof info.phone === 'string' && info.phone.length > 0) {
                                                                return info.phone.replace(/^([\d]{3})[\d]{4}([\d]{4})$/, '$1****$2');
                                                            }
                                                            return '匿名用户';
                                                        })()
                                                    }
                                                    <Rate disabled value={item.rating} style={{ fontSize: 14, marginLeft: 8 }} />
                                                </span>
                                            }
                                            description={<span>{item.content}</span>}
                                        />
                                        <div style={{ color: '#888', fontSize: 12 }}>{item.LocalDateTime}</div>
                                    </List.Item>
                                )}
                            />
                        </div>
                    </div>

                    {/* 右侧区域 */}
                    <div className={styles['movie-detail-right']}>
                        <div className={styles['movie-detail-message']}>
                            <div className={styles['movie-detail-header']}>预告片 & 花絮</div>
                            <div className={styles['trailer-container']}>
                                <div className={styles['trailer-video-placeholder']}>
                                    <i className={styles['icon-play-circle']}></i>
                                    <p>点击播放预告片</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles['recommendations']}>
                            <div className={styles['movie-detail-header']}>你可能也喜欢</div>
                            <div className={styles['recommend-list']}>
                                {recommendedMovies.length > 0 ? (
                                    recommendedMovies.map((recommendedMovie) => (
                                        <div key={recommendedMovie.movieId} className={styles['recommend-item']}>
                                            <img
                                                src={getImageUrl(recommendedMovie.posterUrl)}
                                                alt={recommendedMovie.title}
                                                className={styles['recommend-image']}
                                                onClick={() => handleRecommendClick(recommendedMovie.movieId)}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.src = getFallbackImageUrl();
                                                }}
                                            />
                                            <div className={styles['recommend-title']}>{recommendedMovie.title}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className={styles['no-recommendations']}>
                                        <p>暂无相似电影推荐</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieDetail;