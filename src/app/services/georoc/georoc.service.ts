import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, switchMap } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthorName } from 'src/app/models/author';

export const GEOROC_URL = 'https://api-test.georoc.eu/api/v1/';

@Injectable({
  providedIn: 'root'
})
export class GeorocService {
  private GEOROC_KEY_NAME: string = 'DIGIS-API-ACCESSKEY';
  private GEOROC_KEY_VALUE: string = 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==';
  constructor(private http: HttpClient) { }

  public getAuthorList(): Observable<any> {
    let endpoint = GEOROC_URL + 'queries/authors';
    return this.http.get(endpoint, { headers: { 'DIGIS-API-ACCESSKEY' : 'SVRJTkVSSVM6U1ZSSlRrVlNTVk5mUkVsSFNWTmZRVkJKWHpFMk9EZzJOREV5TnpjPQ==' } }).pipe(map(
      (res: any) => {
        let authors = new Array<AuthorName>();
        if (!!res) {
          for (let r of res.data) {
            authors.push({ personId: r.personId, firstName: r.personFirstName, lastName: r.personLastName });
          }
        }
        return authors;
      }
    ),
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse) {
    if (error.status === 0) {
      console.error('An error occurred:', error.error);
    } else {
      console.error(
        `Backend returned code ${error.status}, body was: `, error.error);
    }
    return of('Error code: ' + error.status + ' Error detail: ' + error.error);
  }
}
