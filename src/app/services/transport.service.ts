import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.prod';

export interface DailyChallenge {
  challengeId: number;
  points: number[][]; // [lat, lng]
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TransportService {


  constructor(private http: HttpClient) {}

  getDaily(): Observable<DailyChallenge> {
    return this.http.get<DailyChallenge>(`${environment.apiUrl}/Challenge/daily`);
  }

  getAutocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.apiUrl}/Challenge/autocomplete?query=${query}`);
  }

  checkGuess(challengeId: number, guess: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/Challenge/guess`, { challengeId, guess });
  }
  
  reveal(challengeId: number): Observable<any> {
  return this.http.get(`${environment.apiUrl}/Challenge/reveal/${challengeId}`);
}
}