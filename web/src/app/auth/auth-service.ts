import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { tap, type Observable } from 'rxjs';
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

  signOut(): void {
    clearSession();
    this.users.signOut();
  }

  private start(session: Session): void {
    writeSession(session);
    this.users.setProfile(session.user);
  }
}
