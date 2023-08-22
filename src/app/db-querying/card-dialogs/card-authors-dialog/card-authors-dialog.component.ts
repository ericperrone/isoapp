import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { distinct, deleteByValue } from 'src/app/shared/tools';


@Component({
  selector: 'app-card-authors-dialog',
  templateUrl: './card-authors-dialog.component.html',
  styleUrls: ['./card-authors-dialog.component.scss']
})
export class CardAuthorsDialogComponent implements OnInit {
  public author = '';
  public authors = new Array<string>();
  public queryFilter: QueryFilter | undefined;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private storeService: StoreService) { }

  ngOnInit(): void {
    this.authors = new Array<string>();
    this.queryFilter = this.storeService.get(FILTER_KEY);
    if (!!this.queryFilter) {
      for (let a of this.queryFilter.authors) {
        this.authors.push(a);
      }
    }
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public addAuthor(): void {
    if (this.author.length > 0) {
      this.authors.push(this.author);
      this.authors = distinct(this.authors);
      this.author = '';
    }
  }

  public confirm() {
    let filter = this.storeService.get(FILTER_KEY);
    filter.authors = this.authors;
    this.storeService.push({key: FILTER_KEY, data: filter});
    this.emitter.emit(CONFIRM);
  }

  public deleteFromList(author: string): void {
    this.authors = deleteByValue(this.authors, author);
  }

}
