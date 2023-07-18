import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export const CURRENT_USER = '_CURRENT_USER_';

export interface storeParam {
  key: string,
  data: any
}

export interface storeType {
  [key: string] : any
}

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private store: storeType = [];
  constructor() { }

  public push(something: storeParam): void {
    this.store[something.key] = something.data; 
  }

  public get(key: string): any {
    return this.store[key];
  }

  public clean(key: string): void {
    delete(this.store[key]);
  }

  public deleteCurrentUser(): void {
    delete(this.store[CURRENT_USER]);
  }
  
  public onKey(key: string): Observable<any> | undefined {
    return of(this.store[key]);
  }

}
