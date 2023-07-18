import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataProcessingService extends Rest {

  constructor(private http: HttpClient) {
    super();
  }

  public getFileList(): Observable<any> {
    return this.http.get(this.serviceUrl + 'contentdir').pipe(map(
      (res: any) => {
        let files = new Array<string>();
        if (!!res) {
          for (let r of res) {
            files.push(r);
          }
        }
        return files;
      }
    ),
      catchError(this.handleError)
    );
  }

  public getSheets(file: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'process-file?fileName=' + file).pipe(map(
      (res: any) => {
        let sheets = new Array<string>();
        if (!!res) {
          for (let r of res) {
            sheets.push(r);
          }
        }
        return sheets;
      }
    ),
    catchError(this.handleError)
    );
  }

  public getContentXlsx(sheet: string): Observable<any> {
    return this.http.get(this.serviceUrl + 'get-content-xls?sheet=' + sheet).pipe(map(
      (res: any) => {
        console.log(res);
        let sheets = new Array<Array<string>>();
        if (!!res) {
          for (let r of res) {
            sheets.push(r);
          }
        }
        return sheets;
      }
    ),
    catchError(this.handleError)
    );
  }


}
