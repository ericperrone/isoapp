import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { StoreService } from 'src/app/services/common/store.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { DataGathering } from '../data-gathering';
import { trigger, style, animate, transition } from '@angular/animations';
import { DATA_GATHERING, DataGatheringSession } from '../main-data-processing/main-data-processing.component';
import { ModalParams } from 'src/app/shared/modals/modal-params';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { DataProcessingService } from 'src/app/services/rest/data-processing.service';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-save-data',
  templateUrl: './save-data.component.html',
  styleUrls: ['./save-data.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SaveDataComponent extends DataGathering implements OnInit, OnDestroy {
  public spinnerOn = false;
  private subscription: Subscription | undefined;
  constructor(private dataProcessingService: DataProcessingService,
    private sampleService: SampleService,
    private datasetService: DatasetService,
    private router: Router,
    private modalService: NgbModal,
    private storeService: StoreService) { super(); }

  ngOnInit(): void {
    let session: DataGatheringSession = this.storeService.get(DATA_GATHERING);
    if (!session || !session.header) {
      this.router.navigate(['main-data-processing']);
    } else {
      this.session = session;
    }
    console.log(this.session);
    this.subscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!this.router.navigated) {
          const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
            (r) => {
              console.log(r);
              su.unsubscribe();
            }
          );
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (!!this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public goPrevious(): void {
    this.router.navigate(['sample-definition']);
  }

  public saveSamples(): void {
    this.spinnerOn = true;
    const s = this.sampleService.insertSample(this.session.samples).subscribe(
      (res: any) => {
        console.log(res);
        this.spinnerOn = false;
        s.unsubscribe();
        
        const su = this.dataProcessingService.releaseContent(this.session.key).subscribe(
          (r) => { 
            console.log(r);
            su.unsubscribe();

            const ds = this.datasetService.closeDataset({dataset: this.session.selectedDataset}).subscribe(
              (res) => {
                console.log(res);
                ds.unsubscribe();
              }
            );
          }            
        );

        let params: ModalParams = {};
        if (!!res.status && res.status === 'success') {
          params = {
            headerText: 'Success',
            bodyText: 'Selected records has been successfully added to the database. Press the CLOSE button to exit this dialog and go back to the start of the procedure'
          }
        } else if (!!res.status && res.status === 'error') {
          params = {
            headerText: 'Error',
            bodyText: res.message
          }
        } else {
          params = {
            headerText: 'Error',
            bodyText: 'Unexpected error'
          }
        }
        let ref = this.modalService.open(AlertComponent, { centered: true });
        ref.componentInstance.params = params;
        // setTimeout(() => {
        //   ref.componentInstance.params = params;
        // }, 100);
        
        ref.componentInstance.emitter.subscribe(
          () => { 
            ref.close();
            this.router.navigate(['main-data-processing']);
          }
        );
      }
    );
  }

}
