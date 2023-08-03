import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';
import { Dataset } from 'src/app/models/dataset';

@Injectable({
  providedIn: 'root'
})
export class DatasetService extends Rest {

  constructor(private http: HttpClient) {
    super();
  }

  public getDatasetList(): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-available-dataset-list').pipe(map(
      (res: any) => {
        let datasetList = new Array<Dataset>();
        if (!!res) {
          console.log(res);
          for (let r of res) {
            datasetList.push(r);
          }
        }
        return datasetList;
      }
    ),
      catchError(this.handleError)
    );
  }

  public insertDataset(data: any): Observable<any> {
    let payload = {
      dataset: data
    };
    return this.http.post(this.serviceUrl + 'insert-dataset', payload).pipe(map(
      (res: any) => {
        if (res.status && res.status === 'success') {
          return data;
        }
      }
    ),
      catchError(this.handleError)
    );
  }

  public upload(file: File): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    formData.append('file', file);

    const req = new HttpRequest('POST', this.serviceUrl + 'upload', formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }
}
