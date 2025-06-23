export type SeatType = 'NORMAL' | 'VIP' | 'LOVER';
export type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'LOCKED';

export interface Seat {
  ssId: number;
  rowLabel: string;
  colNum: number;
  seatType: SeatType;
  status: SeatStatus;
  price: number;
  userId: number | null;
  lockTime: string | null;
}

export interface Hall {
  hallId: number;
  name: string;
  type: string;
  rowCount: number;
  colCount: number;
  rowLabels: string;
}

export interface Schedule {
  scheduleId: number;
  movieId: number;
  hallId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  vipPrice: number;
  loverPrice: number;
}

export interface Movie {
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
}

export interface ScheduleDetail {
  schedule: Schedule;
  movie: Movie;
  hall: Hall;
  seats: Seat[];
} 