import { Component, OnInit } from '@angular/core';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { StoreService } from 'src/app/services/common/store.service';
import { Router } from '@angular/router';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-file-process',
  templateUrl: './file-process.component.html',
  styleUrls: ['./file-process.component.scss'],
  animations: [
    trigger('fade', [ 
      transition('void => *', [
        style({ opacity: 0 }), 
        animate(1000, style({opacity: 1}))
      ]) 
    ])
  ]
})
export class FileProcessComponent extends DataGathering implements OnInit {
  public selected = '';
  public sheets = null;
  public content = null;
  public spinnerOn = false;
  public fileName = '';

  constructor(private dataProcessingService: DataProcessingService,
    private router: Router,
    private storeService: StoreService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session || !session.selectedFile) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.fileName = session.selectedFile;
      if (!!session.selectedSheet)
        this.selected = session.selectedSheet;
      session.content = undefined;  
      this.loadSheets();
      this.session = session;
    }
  }

  private loadSheets(): void {
    this.spinnerOn = true;
    let s = this.dataProcessingService.getSheets(this.fileName).subscribe(
      (data) => {
        if (typeof data === 'string') {
          s.unsubscribe();
          this.spinnerOn = false;
          alert(data);
          return;
        }
        this.sheets = data;
        s.unsubscribe();
        this.spinnerOn = false;
      }
    )
  }

  public processSheet(sheet: string): void {
    this.selected = sheet;
    this.session.selectedSheet = this.selected;
    this.storeService.push({ key: DATA_GATHERING, data: this.session });
  }

  public goNext(): void {
    if (this.selected.length < 1)
      return;
    this.router.navigate(['content-manager']);
  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

}
