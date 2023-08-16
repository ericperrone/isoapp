import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';

export const FILTER_KEY = '_FILTER_KEY_';
export interface QueryFilter {
  ref: string;
  authors: string[];
  geo?: any;
}

@Component({
  selector: 'app-main-db-querying',
  templateUrl: './main-db-querying.component.html',
  styleUrls: ['./main-db-querying.component.scss']
})
export class MainDbQueryingComponent implements OnInit {

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.storeService.push({key: FILTER_KEY, data: { ref: '', authors: [] }});
  }

}
