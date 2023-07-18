import { Injectable } from '@angular/core';
import { Rest, corsOptions } from './rest';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Sample } from 'src/app/models/sample';


@Injectable({
  providedIn: 'root'
})
export class SampleService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public insertSample(sampleList: Array<Sample>): Observable<any> {
    // let payload = JSON.stringify(samples);
    let payload = {
      samples: sampleList
    }
    
    // return this.http.post(this.serviceUrl + 'insert-sample', payload,  { headers: corsOptions } );
    return this.http.post(this.serviceUrl + 'insert-sample', payload);
  }
}
