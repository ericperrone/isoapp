import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CardRefDialogComponent } from '../../card-dialogs/card-ref-dialog/card-ref-dialog.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-ref',
  templateUrl: './card-ref.component.html',
  styleUrls: ['./card-ref.component.scss']
})
export class CardRefComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = { ref: '', authors: [], keywords: [] };
  public disabled = true;
  private sub: Subscription | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.queryFilter.ref = '';
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  public editCard(): void {
    let ref = this.modalService.open(CardRefDialogComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.emitter.emit(true);
      }
      ref.close()
    });
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.ref = '';
    this.storeService.push({key: FILTER_KEY, data: this.queryFilter});    
    this.emitter.emit(true);
  }
}
