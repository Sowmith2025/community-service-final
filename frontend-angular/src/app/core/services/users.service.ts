import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UsersService {
  constructor(private api: ApiService) {}

  getAll() {
    return this.api.client.get('/users');
  }

  getProfile(id: string) {
    return this.api.client.get(`/users/${id}`);
  }

  updateProfile(id: string, data: any) {
    return this.api.client.put(`/users/${id}`, data);
  }

  deleteUser(id: string) {
    return this.api.client.delete(`/users/${id}`);
  }

  getLeaderboard() {
    return this.api.client.get('/users/leaderboard/top');
  }
}
