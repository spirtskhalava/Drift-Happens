import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SegmentService {
  private apiUrl = 'http://localhost:3000/segments';

  constructor(private http: HttpClient) {}

  getSegments() {
    return this.http.get<any[]>(this.apiUrl);
  }

  evaluate(id: string) {
    return this.http.post(`${this.apiUrl}/${id}/evaluate`, {});
  }
}
