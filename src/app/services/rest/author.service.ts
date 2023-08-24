import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { Observable, catchError, map, switchMap } from 'rxjs';
import { Author } from 'src/app/models/author';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthorService extends Rest {
  constructor(private http: HttpClient) { super(); }

  public insertAuthor(author: Author): Observable<any> {
    return this.http.post(this.serviceUrl + 'insert-author', author).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public getAuthors(surname: string, name?: string): Observable<any> {
    let endpoint = this.serviceUrl + 'get-authors?surname=' + surname;
    if (!!name) {
      endpoint += '&name=' + name;
    }
    
    return this.http.get(endpoint).pipe(map(
      (res: any) => {
        let authors = new Array<Author>();
        if (!!res) {
          for (let r of res) {
            authors.push(r);
          }
        }
        return authors;
      }
    ),
      catchError(this.handleError)
    );
  }
}
