import { Injectable } from '@angular/core';
import { StoreService } from '../common/store.service';
import { HttpClient } from '@angular/common/http';
import { Rest } from './rest';
import { Observable, catchError, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService  extends Rest {
  constructor(private http: HttpClient, private storeService: StoreService) { super(); }

  public login(user: string, password: string): Observable<any> {
    const payload = {
      data: {account: user, password: password}
    };

    return this.http.post(this.serviceUrl + 'login', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          this.storeService.setCurrentUser({username: user, key: res.key});
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }
}
