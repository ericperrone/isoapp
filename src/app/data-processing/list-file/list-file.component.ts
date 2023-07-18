import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { Sample } from 'src/app/models/sample';

@Component({
  selector: 'app-list-file',
  templateUrl: './list-file.component.html',
  styleUrls: ['./list-file.component.scss']
})
export class ListFileComponent implements OnInit {
  public files = null;
  public spinnerOn = false;
  public selected = '';

  constructor(private dataProcessingService: DataProcessingService, private router: Router,
    private eventGenerator: EventGeneratorService,
    private storeService: StoreService) { }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session) {
      this.router.navigate(['main-data-processing']);
    } else {
      if (!!session.selectedFile) {
        this.selected = session.selectedFile;
      }
    }
    this.loadFileList();
  }

  private loadFileList(): void {
    this.spinnerOn = true;
    let s = this.dataProcessingService.getFileList().subscribe(
      (data) => {
        if (typeof data === 'string') {
          s.unsubscribe();
          this.spinnerOn = false;
          alert(data);
          return;
        }
        this.files = data;
        s.unsubscribe();
        this.spinnerOn = false;
      }
    );
  }

  public processFile(file: string): void {
    this.selected = file;
    let session = this.storeService.get(DATA_GATHERING);
    session.selectedFile = this.selected;
    this.storeService.push({ key: DATA_GATHERING, data: session });
  }

  public goNext(): void {
    if (this.selected.length > 0)
      this.router.navigate(['file-process']);
  }

}
