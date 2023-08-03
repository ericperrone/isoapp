import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { Dataset } from 'src/app/models/dataset';
import { trigger, style, animate, transition } from '@angular/animations';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploaderComponent } from 'src/app/shared/modals/file-uploader/file-uploader.component';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ModalParams, DataListItem, CONFIRM } from 'src/app/shared/modals/modal-params';


@Component({
  selector: 'app-list-file',
  templateUrl: './list-file.component.html',
  styleUrls: ['./list-file.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ListFileComponent implements OnInit {
  public datasets = null;
  public spinnerOn = false;
  public selected = '';

  constructor(private dataProcessingService: DataProcessingService, private router: Router,
    private datasetService: DatasetService,
    private modalService: NgbModal,
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
    let s = this.datasetService.getDatasetList().subscribe(
      (data) => {
        if (typeof data === 'string') {
          s.unsubscribe();
          this.spinnerOn = false;
          alert(data);
          return;
        }
        this.datasets = data;
        s.unsubscribe();
        this.spinnerOn = false;
      }
    );
  }

  public showInfo(dataset: Dataset): void {
    let listInfo = new Array<DataListItem>();
    let info = JSON.parse(dataset.metadata);
    let keys = Object.keys(info);
    for (let k of keys) {
      listInfo.push({ key: k, value: info[k] });
    }
    let params: ModalParams = {
      headerText: 'Dataset info',
      list: listInfo
    };
    let ref = this.modalService.open(AlertComponent, { centered: true });
    ref.componentInstance.params = params;
    ref.componentInstance.emitter.subscribe(() => ref.close());
  }

  public uploadFile(): void {
    let ref = this.modalService.open(FileUploaderComponent, { centered: true });
    ref.componentInstance.emitter.subscribe(
      (response: string) => {
        ref.close();
        if (response === CONFIRM) {
          this.loadFileList();
        }
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
    if (this.selected.length > 0) {
      if (this.selected.toLowerCase().endsWith('.xlsx') || this.selected.toLowerCase().endsWith('.xls'))
        this.router.navigate(['file-process']);
      else
        this.router.navigate(['file-csv-process']);
    }

  }

}
