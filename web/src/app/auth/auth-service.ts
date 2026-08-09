import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, of, tap, type Observable } from 'rxjs';
import { UserStore } from '../user/user-store';
import type { Credentials, Registration, Session } from './auth.model';
import { clearSession, writeSession } from './session-storage';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly users = inject(UserStore);

  login(credentials: Credentials): Observable<Session> {
    return this.http
      .post<Session>('/api/auth/login', credentials)
      .pipe(tap((session) => this.start(session)));
  }

  register(registration: Registration): Observable<Session> {
    return this.http
      .post<Session>('/api/auth/register', registration)
      .pipe(tap((session) => this.start(session)));
  }

  signOut(): Observable<void> {
    return this.http.post('/api/auth/logout', {}).pipe(
      catchError(() => of(null)),
      tap(() => this.clear()),
      map(() => undefined),
    );
  }

  private start(session: Session): void {
    writeSession(session);
    this.users.setProfile(session.user);
  }

  private clear(): void {
    clearSession();
    this.users.signOut();
  }
}
