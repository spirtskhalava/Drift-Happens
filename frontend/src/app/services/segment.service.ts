import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SegmentService {
  private apiUrl = 'http://localhost:3000/segments';

  constructor(private http: HttpClient) { }

  getSegments(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getMembers(id: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/members`);
  }

  evaluate(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/evaluate`, {});
  }

  getDelta(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}/delta`);
  }

  simulateTransaction(customerId: string, amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/simulate-transaction/${customerId}`, { amount });
  }
}
