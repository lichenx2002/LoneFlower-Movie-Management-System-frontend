export type HallType = 'LARGE' | 'MEDIUM' | 'SMALL' | 'LOVERS';

export interface Hall {
    hallId: number;
    name: string;
    type: HallType;
    rowCount: number;
    colCount: number;
    rowLabels: string;
    cinemaId: number;
}

export type SeatType = 'STANDARD' | 'VIP' | 'COUPLE';

export interface Seat {
    ssId: number;
    rowLabel: string;
    colNum: number;
    seatType: SeatType;
    status: 'AVAILABLE' | 'OCCUPIED' | 'LOCKED';
    price: number;
    userId: number | null;
    lockTime: string | null;
}

export interface ScheduleDetail {
    schedule: {
        scheduleId: number;
        movieId: number;
        hallId: number;
        startTime: string;
        endTime: string;
        basePrice: number;
        vipPrice: number;
        loverPrice: number;
    };
    movie: {
        movieId: number;
        title: string;
        englishTitle: string;
        director: string;
        genres: string;
        actors: string;
        duration: number;
        releaseDate: string;
        releaseLocation: string;
        posterUrl: string;
        trailerUrl: string;
        description: string;
        avgRating: number;
        boxOffice: number;
        wantToWatch: number;
    };
    hall: Hall;
    seats: Seat[];
}
