import { Component, OnInit } from '@angular/core';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { StoreService } from 'src/app/services/common/store.service';
import { Router } from '@angular/router';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-file-csv-process',
  templateUrl: './file-csv-process.component.html',
  styleUrls: ['./file-csv-process.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})

export class FileCsvProcessComponent extends DataGathering implements OnInit {

  constructor(private router: Router,
    private storeService: StoreService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session) {
      this.router.navigate(['main-data-processing']);
    }
  }

  public goNext(): void {
  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }
}
