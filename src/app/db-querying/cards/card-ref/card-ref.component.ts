import { Component, OnInit } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { QueryFilter, FILTER_KEY } from 'src/app/db-querying/main-db-querying/main-db-querying.component';
import { CardRefDialogComponent } from '../../card-dialogs/card-ref-dialog/card-ref-dialog.component';
import { CONFIRM } from 'src/app/shared/modals/modal-params';

@Component({
  selector: 'app-card-ref',
  templateUrl: './card-ref.component.html',
  styleUrls: ['./card-ref.component.scss']
})
export class CardRefComponent implements OnInit {
  public queryFilter: QueryFilter = { ref: '', authors: [] };
  public disabled = true;

  constructor(private storeService: StoreService,
    private modalService: NgbModal) { }

  ngOnInit(): void {
    this.queryFilter = this.storeService.get(FILTER_KEY);
  }

  public editCard(): void {
    let ref = this.modalService.open(CardRefDialogComponent, { centered: true });
    ref.componentInstance.emitter.subscribe((result: string) => {
      if (result === CONFIRM)
        this.queryFilter = this.storeService.get(FILTER_KEY);
      ref.close()
    });
  }

}
