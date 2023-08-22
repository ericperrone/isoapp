import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { CardKeywordsDialogComponent } from '../../card-dialogs/card-keywords-dialog/card-keywords-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-keywords',
  templateUrl: './card-keywords.component.html',
  styleUrls: ['./card-keywords.component.scss']
})
export class CardKeywordsComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = { ref: '', authors: [], keywords: [] };
  public disabled = true;
  public keywords = '';
  private sub: Subscription | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }


  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.keywords = '';
        this.queryFilter.keywords = [];
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  public editCard(): void {
    let ref = this.modalService.open(CardKeywordsDialogComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.keywords = '';
        for (let key of this.queryFilter.keywords) {
          this.keywords += key + ' ';
        }
        this.keywords = this.keywords.trim();
      }
      console.log(this.queryFilter);  
      ref.close()
      this.emitter.emit(true);
    });
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.keywords = [];
    this.storeService.push({key: FILTER_KEY, data: this.queryFilter});
    this.keywords = '';
    this.emitter.emit(true);
  }
}
