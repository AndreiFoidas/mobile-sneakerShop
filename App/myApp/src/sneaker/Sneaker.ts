export interface Sneaker {
    _id?: string;
    name: string;
    brand: string;
    price: number;
    owned: boolean;
    releaseDate: string;
    latitude?: number;
    longitude?: number;
    webViewPath: string;
}