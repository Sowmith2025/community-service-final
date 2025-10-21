import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { EventsService } from '../../core/services/events.service';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatCardModule, MatProgressBarModule, MatFormFieldModule, MatInputModule, FormsModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
  providers: []
})
export class EventsComponent implements OnInit {
  events: any[] = [];
  loading = false;
  error = '';
  registering: Record<string, boolean> = {};
  registeredSet: Set<string> = new Set();
  isOrganizer = false;
  creating = false;
  editing: Record<string, boolean> = {};
  deleting: Record<string, boolean> = {};
  editingEvent: any = null;
  searchQuery = '';
  viewingRegistrations: Record<string, boolean> = {};
  registrations: Record<string, any[]> = {};
  loadingRegistrations: Record<string, boolean> = {};
  newEvent: any = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    maxVolunteers: 20,
    category: 'other'
  };

  get filteredEvents() {
    if (!this.searchQuery.trim()) {
      return this.events;
    }
    const query = this.searchQuery.toLowerCase();
    return this.events.filter(event =>
      event.title?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query) ||
      event.location?.toLowerCase().includes(query) ||
      event.category?.toLowerCase().includes(query)
    );
  }

  constructor(private eventsService: EventsService, private auth: AuthService, private usersService: UsersService, public theme: ThemeService, private router: Router) {}

  async ngOnInit() {
    this.loading = true;
    this.error = '';
    
    try {
      const apiBaseUrl = 'http://localhost:5000/api';
      console.log('🔄 Starting Events Component Initialization');
      console.log('📍 API Base URL:', apiBaseUrl);
      
      // Step 1: Check if backend is running
      console.log('🏥 Checking backend health...');
      try {
        await fetch(`${apiBaseUrl}/health`).catch(() => {
          throw new Error('Backend health check failed');
        });
        console.log('✅ Backend is responsive');
      } catch (healthError: any) {
        throw new Error(`Backend not responding. Is it running on port 5000? Error: ${healthError.message}`);
      }
      
      // Step 2: Fetch events
      console.log('📥 Fetching events...');
      const res: any = await this.eventsService.getAll();
      console.log('📊 Events response received:', res);
      
      if (!res || !res.data) {
        throw new Error('Invalid response format from events API - expected {data: [...]}');
      }
      
      // Axios wraps response in data property, so we need res.data.data
      const eventsData = res.data.data || res.data;
      
      if (!Array.isArray(eventsData)) {
        console.warn('⚠️ Events data is not an array');
        this.events = [];
      } else {
        this.events = eventsData;
      }
      
      console.log(`✅ ${this.events.length} events loaded successfully`);
      
      // Step 3: Load user profile and registrations
      const user = this.auth.getCurrentUser();
      if (user) {
        console.log('👤 Loading user profile for:', user.id);
        try {
          const prof = await this.usersService.getProfile(user.id);
          console.log('📋 Profile data received:', prof);
          const regs = prof.data.data?.registeredEvents || prof.data.registeredEvents || [];
          this.registeredSet = new Set(regs.map((e: any) => e.id));
          this.isOrganizer = user.role === 'organizer';
          
          console.log(`✅ User loaded - Role: ${this.isOrganizer ? 'organizer' : 'student'}, Registered events: ${regs.length}`);
        } catch (profileError: any) {
          console.warn('⚠️ Could not load user profile:', profileError?.message);
          // Don't fail the whole component if profile fails
          this.isOrganizer = user.role === 'organizer';
        }
      }
    } catch (e: any) {
      console.error('❌ Error during initialization:', e.message);
      console.error('   Full error:', e);
      
      // Detailed error diagnosis
      if (e.code === 'ECONNREFUSED' || e.message?.includes('Cannot connect') || e.message?.includes('Backend not responding')) {
        this.error = `❌ Cannot connect to backend server.\n\nPlease ensure:\n1. Backend is running (npm start or npm run dev)\n2. MongoDB is running\n3. Port 5000 is not blocked`;
      } else if (e.message?.includes('Invalid response')) {
        this.error = `❌ Backend returned invalid data.\n\nPlease check:\n1. Backend logs for errors\n2. MongoDB connection\n3. Event model definition`;
      } else if (e.response?.status === 404) {
        this.error = '❌ Events API endpoint not found (404). Please check backend routes configuration.';
      } else if (e.response?.status >= 500) {
        this.error = `❌ Backend server error (${e.response?.status}). Check backend logs:\n${e.response?.data?.message || e.response?.data?.error || 'Unknown error'}`;
      } else if (e.response?.status >= 400) {
        this.error = `❌ Request error (${e.response?.status}): ${e?.response?.data?.message || e?.message}`;
      } else {
        this.error = `❌ Failed to load events: ${e?.response?.data?.message || e?.message || 'Unknown error'}`;
      }
      
      console.error('📝 Error diagnostic:', {
        message: e.message,
        code: e.code,
        status: e.response?.status,
        statusText: e.response?.statusText,
        backendMessage: e.response?.data?.message,
        backendError: e.response?.data?.error
      });
    } finally {
      this.loading = false;
    }
  }

  async register(eventId: string) {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.error = 'Please log in to register';
      return;
    }
    this.registering[eventId] = true;
    try {
      await this.eventsService.register(eventId, user.id);
      // Optimistic update: mark as registeredCount+1
      this.events = this.events.map(e => e.id === eventId ? { ...e, registeredCount: (e.registeredCount||0)+1 } : e);
      this.registeredSet.add(eventId);
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Registration failed';
    } finally {
      this.registering[eventId] = false;
    }
  }

  async createEvent() {
    const user = this.auth.getCurrentUser();
    if (!user || user.role !== 'organizer') {
      this.error = 'Only organizers can create events';
      return;
    }
    this.creating = true;
    this.error = '';
    try {
      const payload = { ...this.newEvent, organizerId: user.id };
      const res = await this.eventsService.create(payload);
      this.events = [res.data.event, ...this.events];
      this.newEvent = { title: '', description: '', date: '', time: '', location: '', maxVolunteers: 20, category: 'other' };
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to create event';
    } finally {
      this.creating = false;
    }
  }

  async deleteEvent(eventId: string) {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    this.deleting[eventId] = true;
    try {
      await this.eventsService.delete(eventId);
      this.events = this.events.filter(e => e.id !== eventId);
      this.error = '';
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to delete event';
      console.error('Delete error:', e);
    } finally {
      this.deleting[eventId] = false;
    }
  }

  editEvent(event: any) {
    this.editingEvent = { ...event };
  }

  async updateEvent() {
    if (!this.editingEvent) {
      return;
    }
    this.editing[this.editingEvent.id] = true;
    this.error = '';
    try {
      await this.eventsService.update(this.editingEvent.id, this.editingEvent);
      // Update the event in the list
      this.events = this.events.map(e => e.id === this.editingEvent.id ? this.editingEvent : e);
      this.editingEvent = null;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to update event';
      console.error('Update error:', e);
    } finally {
      this.editing[this.editingEvent?.id] = false;
    }
  }

  cancelEdit() {
    this.editingEvent = null;
  }

  async viewRegistrations(eventId: string) {
    if (this.viewingRegistrations[eventId]) {
      this.viewingRegistrations[eventId] = false;
      return;
    }
    
    this.loadingRegistrations[eventId] = true;
    try {
      const res = await this.eventsService.getRegistrations(eventId);
      this.registrations[eventId] = res.data.data || res.data || [];
      this.viewingRegistrations[eventId] = true;
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to load registrations';
      console.error('Registrations error:', e);
    } finally {
      this.loadingRegistrations[eventId] = false;
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}
