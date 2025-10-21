import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class RegistrationsService {
  constructor(private api: ApiService) {}

  getAll(params?: any) {
    return this.api.client.get('/registrations', { params });
  }

  getById(id: string) {
    return this.api.client.get(`/registrations/${id}`);
  }

  create(data: { userId: string; eventId: string }) {
    return this.api.client.post('/registrations', data);
  }

  update(id: string, data: any) {
    return this.api.client.put(`/registrations/${id}`, data);
  }

  delete(id: string) {
    return this.api.client.delete(`/registrations/${id}`);
  }
}
