import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY, RESET_FILTER } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';
import { CardAuthorsDialogComponent } from '../../card-dialogs/card-authors-dialog/card-authors-dialog.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card-authors',
  templateUrl: './card-authors.component.html',
  styleUrls: ['./card-authors.component.scss']
})
export class CardAuthorsComponent implements OnInit, OnDestroy {
  public queryFilter: QueryFilter = { ref: '', authors: [], keywords: [] };
  public disabled = true;
  public authors = '';
  private sub: Subscription | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal) { }


  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.sub = this.eventGeneratorService.on(RESET_FILTER).subscribe(
      (event: any) => {
        this.authors = '';
        this.queryFilter.authors = [];
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }
  
  public editCard(): void {
    let ref = this.modalService.open(CardAuthorsDialogComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM) {
        this.queryFilter = this.storeService.get(FILTER_KEY);
        this.authors = '';
        for (let key of this.queryFilter.authors) {
          this.authors += key + ', ';
        }
        this.authors = this.authors.trim();
        this.authors = this.authors.substring(0, this.authors.length - 1);
        this.emitter.emit(true);
      }
      ref.close()
    });
  }

  public resetFilter(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
    this.queryFilter.authors = [];
    this.storeService.push({key: FILTER_KEY, data: this.queryFilter});
    this.authors = '';
    this.emitter.emit(true);
  }

}
