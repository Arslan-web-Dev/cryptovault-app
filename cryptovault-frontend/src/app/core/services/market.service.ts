import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CoinData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

@Injectable({
  providedIn: 'root'
})
export class MarketService {
  private readonly COINGECKO_API = 'https://api.coingecko.com/api/v3';

  constructor(private http: HttpClient) {}

  getTopCoins(limit: number = 50): Observable<CoinData[]> {
    return this.http.get<CoinData[]>(`${this.COINGECKO_API}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: limit.toString(),
        page: '1',
        sparkline: 'false'
      }
    });
  }

  getCoinDetails(id: string): Observable<any> {
    return this.http.get(`${this.COINGECKO_API}/coins/${id}`);
  }

  getGlobalMarketData(): Observable<any> {
    return this.http.get(`${this.COINGECKO_API}/global`);
  }
}
