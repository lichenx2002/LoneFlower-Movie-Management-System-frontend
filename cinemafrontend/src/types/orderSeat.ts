export interface OrderSeatDetail {
    orderId: number;
    totalAmount: number;
    orderTime: string;
    status: string;
    paymentId: string | null;
    userId: number;
    username: string | null;
    userPhone: string;
    userEmail: string | null;
    movieId: number;
    movieTitle: string;
    movieEnglishTitle: string;
    moviePoster: string;
    movieGenres: string;
    movieDuration: number;
    hallId: number;
    hallName: string;
    hallType: string;
    scheduleId: number;
    startTime: string;
    basePrice: number;
    seats: {
        ssId: number;
        rowLabel: string;
        colNum: number;
        seatType: string;
        actualPrice: number;
    }[];
}