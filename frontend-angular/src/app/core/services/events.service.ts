import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class EventsService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.client.get('/events');
  }

  getById(id: string) {
    return this.api.client.get(`/events/${id}`);
  }

  create(eventData: any) {
    return this.api.client.post('/events', eventData);
  }

  update(id: string, eventData: any) {
    return this.api.client.put(`/events/${id}`, eventData);
  }

  delete(id: string) {
    return this.api.client.delete(`/events/${id}`);
  }

  register(eventId: string, userId: string) {
    return this.api.client.post(`/events/${eventId}/register`, { userId });
  }

  cancelRegistration(eventId: string, userId: string) {
    return this.api.client.delete(`/events/${eventId}/register/${userId}`);
  }

  getRegistrations(eventId: string) {
    return this.api.client.get(`/events/${eventId}/registrations`);
  }
}
