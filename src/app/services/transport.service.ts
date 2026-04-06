import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiUrl } from '../../enviroment.prod';

export interface DailyChallenge {
  challengeId: number;
  points: number[][]; // [lat, lng]
  date: string;
}

@Injectable({ providedIn: 'root' })
export class TransportService {


  constructor(private http: HttpClient) {}

  getDaily(): Observable<DailyChallenge> {
    return this.http.get<DailyChallenge>(`${apiUrl}/daily`);
  }

  getAutocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${apiUrl}/autocomplete?query=${query}`);
  }

  checkGuess(challengeId: number, guess: string): Observable<any> {
    return this.http.post(`${apiUrl}/guess`, { challengeId, guess });
  }
  
  reveal(challengeId: number): Observable<any> {
  return this.http.get(`${apiUrl}/reveal/${challengeId}`);
}
}