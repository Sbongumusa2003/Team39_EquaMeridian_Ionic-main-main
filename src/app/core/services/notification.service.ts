import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificationDto, NotificationListResponse, CreateAnnouncementRequest, AnnouncementResultDto
} from '../models/notification.models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private announcementsUrl = `${environment.apiUrl}/admin/announcements`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  // Pop-up support: emits notifications that are new since the last poll (e.g. a Supplier
  // registration or a listing coming in for Admin review), so the layout can toast them.
  // The very first poll after login just primes maxSeenId — it never toasts the whole
  // existing backlog, only genuinely new arrivals (higher NotificationID) from that point on.
  private newNotificationsSubject = new Subject<NotificationDto[]>();
  newNotifications$ = this.newNotificationsSubject.asObservable();
  private maxSeenId = 0;
  private primed = false;

  constructor(private http: HttpClient) {}

  getMine(params: { unreadOnly?: boolean; page?: number; pageSize?: number } = {}): Observable<NotificationListResponse> {
    let p = new HttpParams();
    if (params.unreadOnly !== undefined) p = p.set('unreadOnly', String(params.unreadOnly));
    p = p.set('page', (params.page ?? 1).toString());
    p = p.set('pageSize', (params.pageSize ?? 20).toString());
    return this.http.get<NotificationListResponse>(this.apiUrl, { params: p }).pipe(
      tap(res => this.unreadCountSubject.next(res.unreadCount))
    );
  }

  markRead(notificationId: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllRead(): Observable<{ updated: number }> {
    return this.http.patch<{ updated: number }>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  refreshUnreadCount(): void {
    this.getMine({ unreadOnly: true, page: 1, pageSize: 10 }).subscribe({
      next: res => {
        const items = res.notifications ?? [];
        const highestId = items.reduce((max, n) => Math.max(max, n.notificationID), this.maxSeenId);

        if (this.primed) {
          const freshlyArrived = items.filter(n => n.notificationID > this.maxSeenId);
          if (freshlyArrived.length > 0) this.newNotificationsSubject.next(freshlyArrived);
        }

        this.maxSeenId = highestId;
        this.primed = true;
      },
      error: () => {}
    });
  }

  broadcastAnnouncement(dto: CreateAnnouncementRequest): Observable<AnnouncementResultDto> {
    return this.http.post<AnnouncementResultDto>(this.announcementsUrl, dto);
  }
}
