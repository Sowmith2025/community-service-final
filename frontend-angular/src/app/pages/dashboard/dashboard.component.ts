import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { UsersService } from '../../core/services/users.service';
import { AuthService } from '../../core/services/auth.service';
import { EventsService } from '../../core/services/events.service';
import { ThemeService } from '../../core/services/theme.service';
import { Chart, ChartConfiguration, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatCardModule, MatProgressBarModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('participationChart') chartCanvas!: ElementRef<HTMLCanvasElement>;
  private chart: Chart | null = null;
  loading = false;
  error = '';
  registered: any[] = [];
  attended: any[] = [];

  constructor(private users: UsersService, private auth: AuthService, private eventsService: EventsService, public theme: ThemeService, private router: Router) {}

  async ngOnInit() {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.loading = true;
    try {
      const res = await this.users.getProfile(user.id);
      this.registered = res.data.data?.registeredEvents || res.data.registeredEvents || [];

      // Only consider attended events that the user registered for
      const registeredIds = new Set((this.registered || []).map((e: any) => e.id));
      const eventMap: Record<string, any> = {};
      for (const e of this.registered) {
        if (e && e.id) eventMap[e.id] = e;
      }

      this.attended = (res.data.data?.attendance || res.data.attendance || [])
        .filter((a: any) => registeredIds.has(a.eventId))
        .map((a: any) => ({
          ...a,
          event: eventMap[a.eventId]
        }));
        
      // Debug logging
      console.log('Dashboard - Registered events:', this.registered);
      console.log('Dashboard - Attended events:', this.attended);
    } catch (e: any) {
      this.error = e?.response?.data?.message || 'Failed to load dashboard';
    } finally {
      this.loading = false;
    }
  }

  ngAfterViewInit() {
    // Create chart after view is initialized
    setTimeout(() => this.createParticipationChart(), 100);
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  private createParticipationChart() {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    // Calculate participation statistics
    const totalRegistered = this.registered.length;
    const totalAttended = this.attended.length;
    const totalHours = this.attended.reduce((sum: number, a: any) => sum + (a.hours || 0), 0);
    const completionRate = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Registered Events', 'Attended Events', 'Total Hours', 'Completion Rate (%)'],
        datasets: [{
          label: 'Participation Metrics',
          data: [totalRegistered, totalAttended, totalHours, completionRate],
          backgroundColor: [
            'rgba(54, 162, 235, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(153, 102, 255, 0.8)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Your Participation Overview',
            font: {
              size: 18,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/home');
  }
}
