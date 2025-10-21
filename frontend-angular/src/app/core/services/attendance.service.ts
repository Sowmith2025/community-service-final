import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  constructor(private api: ApiService) {}

  getAll(params?: any) {
    return this.api.client.get('/attendance', { params });
  }

  getById(id: string) {
    return this.api.client.get(`/attendance/${id}`);
  }

  checkIn(data: any) {
    return this.api.client.post('/attendance/check-in', data);
  }

  checkOut(data: any) {
    return this.api.client.post('/attendance/check-out', data);
  }

  update(id: string, data: any) {
    return this.api.client.put(`/attendance/${id}`, data);
  }

  delete(id: string) {
    return this.api.client.delete(`/attendance/${id}`);
  }
}
