import React, { useEffect, useState } from 'react';
import { Card, List, Avatar, Tag, Spin } from 'antd';
import { Movies } from '../../types/movies';
import { moviesAPI } from '../../api/moviesAPI';
import { getProxiedImageUrl } from '../../utils/imageProxy';

const Rank: React.FC = () => {
    const [movies, setMovies] = useState<Movies[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const res = await moviesAPI.getAllMovies();
                setMovies(res);
            } catch (err) {
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // 评分榜
    const ratingRank = [...movies]
        .sort((a, b) => b.avgRating - a.avgRating)
        .slice(0, 10);
    // 票房榜
    const boxOfficeRank = [...movies]
        .sort((a, b) => b.boxOffice - a.boxOffice)
        .slice(0, 10);

    return (
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', padding: 24 }}>
            <Card
                title={<span style={{ fontWeight: 600, fontSize: 18 }}>评分榜 TOP10</span>}
                style={{ width: 380, minWidth: 280, flex: 1 }}
                bodyStyle={{ padding: 0 }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={ratingRank}
                        renderItem={(item, idx) => (
                            <List.Item style={{ padding: '16px 20px' }}>
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" size={56} src={getProxiedImageUrl(item.posterUrl)} />}
                                    title={<span style={{ fontWeight: 500 }}>{idx + 1}. {item.title}</span>}
                                    description={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                            <Tag color="blue">评分: {item.avgRating?.toFixed(1) ?? '--'}</Tag>
                                            <span style={{ color: '#888' }}>上映: {item.releaseDate?.slice(0, 10) ?? '--'}</span>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
            <Card
                title={<span style={{ fontWeight: 600, fontSize: 18 }}>票房榜 TOP10</span>}
                style={{ width: 380, minWidth: 280, flex: 1 }}
                bodyStyle={{ padding: 0 }}
            >
                {loading ? (
                    <div style={{ textAlign: 'center', padding: 40 }}><Spin /></div>
                ) : (
                    <List
                        itemLayout="horizontal"
                        dataSource={boxOfficeRank}
                        renderItem={(item, idx) => (
                            <List.Item style={{ padding: '16px 20px' }}>
                                <List.Item.Meta
                                    avatar={<Avatar shape="square" size={56} src={getProxiedImageUrl(item.posterUrl)} />}
                                    title={<span style={{ fontWeight: 500 }}>{idx + 1}. {item.title}</span>}
                                    description={
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                            <Tag color="volcano">票房: {item.boxOffice?.toLocaleString() ?? '--'} 元</Tag>
                                            <span style={{ color: '#888' }}>上映: {item.releaseDate?.slice(0, 10) ?? '--'}</span>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                )}
            </Card>
        </div>
    );
};

export default Rank;