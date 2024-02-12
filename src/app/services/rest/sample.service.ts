import { Injectable } from '@angular/core';
import { Rest, corsOptions } from './rest';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { ChemComponent, Sample, SampleElement } from 'src/app/models/sample';
import { QueryFilter } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { StoreService, UserInfo } from '../common/store.service';
import { ChemElements } from 'src/app/shared/const';


@Injectable({
  providedIn: 'root'
})
export class SampleService extends Rest {

  constructor(private http: HttpClient, private storeService: StoreService) { super(); }

  public getSamplesById(ids: Array<number>): Observable<any> {
    return this.http.get(this.serviceUrl + 'query-samples-by-id').pipe(map(
      (res: any) => {
        let samples = new Array<Sample>();
        if (!!res) {
          for (let r of res) {
            let sample = { id: r.id, fields: new Array<SampleElement>(), components: new Array<ChemComponent> };
            for (let c of r.components) {
              let chem = { component: c.component, value: '' + c.value, isIsotope: c.isIsotope };
              sample.components.push(chem);
            } 
          }
        }
        return samples;
      }
    ),
      catchError(this.handleError)
    );
  }

  public insertFullData(fullData: any): Observable<any> {
    let payload = {
      data: fullData
    }

    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      const options = {
        'headers': headers
      };
      return this.http.post(this.serviceUrl + 'insert-fulldata', payload, options);
    }

    return this.http.post(this.serviceUrl + 'insert-fulldata', payload);
  }

  public insertSample(sampleList: Array<Sample>): Observable<any> {
    let payload = {
      samples: sampleList
    }

    let userInfo: UserInfo = this.storeService.getCurrentUser();
    if (!!userInfo) {
      const headers: HttpHeaders = new HttpHeaders({
        'token': '' + userInfo.key,
      });
      const options = {
        'headers': headers
      };
      return this.http.post(this.serviceUrl + 'insert-sample', payload).pipe(map(
        (res: any) => {
          if (res.status && res.status === 'success') {
            return res;
          }
        }
      ),
        catchError(this.handleError)
      );
    }
    return this.http.post(this.serviceUrl + 'insert-sample', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return res;
        }
      }
    ),
      catchError(this.handleError)
    );;
  }

  private buildQueryString(filter: QueryFilter): string {
    let url = '';
    if (filter.ref.length > 0) {
      url += '&ref=' + filter.ref;
    }
    if (filter.keywords.length > 0) {
      let keys = '';
      for (let k of filter.keywords) {
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
    if (!!filter.geo) {
      url += "&x0=" + filter.geo.topLongitude + "&x1=" + filter.geo.bottomLongitude
        + "&y0=" + filter.geo.topLatitude + "&y1=" + filter.geo.bottomLatitude;
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
