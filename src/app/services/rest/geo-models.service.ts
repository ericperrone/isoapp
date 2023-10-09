import { Injectable } from '@angular/core';
import { Rest } from './rest';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map } from 'rxjs';

export interface MixingModelPayload {
  endMemberName: string;
  elementName: string;
  elementValue: string;
  concentration?: string;
  concentrationValue?: string;
}

export interface MixingModelMember {
  member: string;
  concentration: number;
  isotope?: number;
}

export interface MixingModelServicePayloadItem {
  element: string;
  increment: number;
  members: Array<MixingModelMember>;
}

@Injectable({
  providedIn: 'root'
})
export class GeoModelsService extends Rest {

  constructor(private http: HttpClient) { super(); }

  public mixingModel(data: Array<MixingModelPayload>): Observable<any> {
    let payload = { data: new Array<MixingModelServicePayloadItem>() };

    let payloadItem: MixingModelServicePayloadItem = {
      element: data[0].elementName,
      increment: 0.01,
      members: new Array<MixingModelMember>()
    };

    for (let p of data) {
      let member: MixingModelMember = {
        member: p.endMemberName,
        concentration: parseFloat(p.elementValue),
        isotope: p.concentrationValue ? parseFloat(p.concentrationValue) : undefined
      };
      payloadItem.members.push(member);
    }

    payload.data.push(payloadItem);

    return this.http.post(this.serviceUrl + 'mixing-model', payload).pipe(map(
      (res: any) => {
        // console.log(res);
        return res;
      }
    ),
      catchError(this.handleError)
    );
  }
}
