import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DailyChallenge {
  challengeId: number;
  points: number[][]; // [lat, lng]
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TransportService {
  private apiUrl = 'https://localhost:7253/api/challenge'; // Ajustá tu puerto

  constructor(private http: HttpClient) {}

  getDaily(): Observable<DailyChallenge> {
    return this.http.get<DailyChallenge>(`${this.apiUrl}/daily`);
  }

  getAutocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/autocomplete?query=${query}`);
  }

  checkGuess(challengeId: number, guess: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/guess`, { challengeId, guess });
  }
  
  reveal(challengeId: number): Observable<any> {
  return this.http.get(`${this.apiUrl}/reveal/${challengeId}`);
}
}