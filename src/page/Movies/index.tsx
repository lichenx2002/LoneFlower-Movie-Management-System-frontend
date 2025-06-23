import React, { useEffect, useState } from 'react';
import { Movies } from '../../types/movies';
import { moviesAPI } from '../../api/moviesAPI';
import { getProxiedImageUrl, getFallbackImageUrl } from '../../utils/imageProxy';
// @ts-ignore
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import FilterGroup from '../../components/FilterGroup';

const MoviesPage: React.FC = () => {
    const navigate = useNavigate();
    const [movies, setMovies] = useState<Movies[]>([]);
    const [filteredMovies, setFilteredMovies] = useState<Movies[]>([]);
    const [years, setYears] = useState<string[]>([]);
    const [genres, setGenres] = useState<string[]>([]);
    const [locations, setLocations] = useState<string[]>([]);
    const [selectedYear, setSelectedYear] = useState<string>('全部');
    const [selectedGenre, setSelectedGenre] = useState<string>('全部');
    const [selectedLocation, setSelectedLocation] = useState<string>('全部');

    useEffect(() => {
        const fetchMovies = async () => {
            const response = await moviesAPI.getAllMovies();
            setMovies(response);
            setFilteredMovies(response);
            // 年份
            const yearSet = new Set(response.map(m => m.releaseDate.slice(0, 4)));
            setYears(['全部', ...Array.from(yearSet).sort((a, b) => Number(b) - Number(a))]);
            // 类型
            const genreSet = new Set<string>();
            response.forEach(m => m.genres.split(',').forEach(g => genreSet.add(g.trim())));
            setGenres(['全部', ...Array.from(genreSet)]);
            // 上映区域
            const locationSet = new Set(response.map(m => m.releaseLocation));
            setLocations(['全部', ...Array.from(locationSet)]);
        };
        fetchMovies();
    }, []);

    useEffect(() => {
        let result = [...movies];
        if (selectedYear !== '全部') {
            result = result.filter(m => m.releaseDate.startsWith(selectedYear));
        }
        if (selectedGenre !== '全部') {
            result = result.filter(m => m.genres.split(',').map(g => g.trim()).includes(selectedGenre));
        }
        if (selectedLocation !== '全部') {
            result = result.filter(m => m.releaseLocation === selectedLocation);
        }
        setFilteredMovies(result);
    }, [selectedYear, selectedGenre, selectedLocation, movies]);

    const handleMovieClick = (movieId: number) => {
        navigate(`/MovieDetail/${movieId}`);
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

    return (
        <div className={styles.page}>
            <div className={styles.filterPanel}>
                <FilterGroup options={genres} value={selectedGenre} onChange={setSelectedGenre} label="类型" />
                <FilterGroup options={years} value={selectedYear} onChange={setSelectedYear} label="年代" />
                <FilterGroup options={locations} value={selectedLocation} onChange={setSelectedLocation} label="区域" />
            </div>
            <div className={styles.grid}>
                {filteredMovies.map(movie => (
                    <div key={movie.movieId} className={styles.card} onClick={() => handleMovieClick(movie.movieId)}>
                        <img
                            className={styles.cover}
                            src={getImageUrl(movie.posterUrl)}
                            alt={movie.title}
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = getFallbackImageUrl();
                            }}
                        />
                        <div className={styles.info}>
                            <div className={styles.title}>{movie.title}</div>
                            <div className={styles.meta}>
                                <span>{movie.releaseDate.slice(0, 4)}</span>
                                <span>{movie.genres.split(',')[0]}</span>
                                <span>{movie.releaseLocation}</span>
                            </div>
                            <div className={styles.statusScore}>
                                <span className={styles.status}>{movie.releaseDate > new Date().toISOString().slice(0, 10) ? '待放映' : '已上映'}</span>
                                <span className={styles.score}>{movie.avgRating ? `${movie.avgRating}分` : '--'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MoviesPage;