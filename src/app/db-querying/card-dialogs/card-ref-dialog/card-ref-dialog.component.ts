import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-card-ref-dialog',
  templateUrl: './card-ref-dialog.component.html',
  styleUrls: ['./card-ref-dialog.component.scss']
})
export class CardRefDialogComponent implements OnInit {
  public dataSetRef = '';
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  
  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    if (this.queryFilter) {
      this.dataSetRef = this.queryFilter.ref;
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    filter.ref = this.dataSetRef;
    this.storeService.push({key: FILTER_KEY, data: filter});
    this.emitter.emit(CONFIRM);
  }
}
