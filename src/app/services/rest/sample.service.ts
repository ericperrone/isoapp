import { Injectable } from '@angular/core';
import { Rest, corsOptions } from './rest';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Sample } from 'src/app/models/sample';
import { QueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';


@Injectable({
  providedIn: 'root'
})
export class SampleService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public insertSample(sampleList: Array<Sample>): Observable<any> {
    let payload = {
      samples: sampleList
    }
    return this.http.post(this.serviceUrl + 'insert-sample', payload);
  }

  private buildQueryString(filter: QueryFilter): string {
    let url = '';
    if (filter.ref.length > 0) {
      url += '&ref=' + filter.ref;
    }
    if (filter.keywords.length > 0) {
      let keys = '';
      for(let k of filter.keywords) {
        keys += k + ' ';
      }
      url += "&meta=" + keys.trimEnd();
    }
    if (filter.authors.length > 0) {
      let auth = '';
      for (let a of filter.authors) {
        auth += a + ';';
      }
      url += "&auth=" + auth.substring(0, auth.length - 1);
    }
    return url;
  }

  public mainQueryTable(filter: QueryFilter): Observable<any> {
    let url = this.serviceUrl + 'get-samples?1=1';
    url += this.buildQueryString(filter);
    return this.http.get(url);
  }


  public mainQuery(filter: QueryFilter): Observable<any> {
    let url = this.serviceUrl + 'query?1=1';
    url += this.buildQueryString(filter);
    return this.http.get(url);
  }
}
