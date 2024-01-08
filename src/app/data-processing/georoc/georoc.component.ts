import { Component, ElementRef, OnInit, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { GeorocService } from 'src/app/services/georoc/georoc.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { ModalParams, CONFIRM, CANCEL } from 'src/app/shared/modals/modal-params';
import { GeorocData, GeorocFullData, GeorocNative, toGeorocFullData } from 'src/app/models/georoc';
import { SampleService } from 'src/app/services/rest/sample.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { PROGRESS_TEXT, ProgressComponent } from 'src/app/shared/modals/progress/progress.component';

export const FULL_DATA_LOOP = '_FULL_DATA_LOOP_';

interface FinalReport {
  author: String;
  items: number;
  inserted: number;
  rejected: number;
}

@Component({
  selector: 'app-georoc',
  templateUrl: './georoc.component.html',
  styleUrls: ['./georoc.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate(1000, style({ opacity: 1 }))
      ])
    ])
  ]
})
export class GeorocComponent implements OnInit, OnDestroy {
  public spinnerOn = false;
  public spinner2On = false;
  public lastName = '';
  public authors: any;
  public filteredAuthors: any;
  public waitingSpinner = false;
  public selection: any;
  public finalReport: FinalReport = {author: '', items: 0, inserted: 0, rejected: 0};
  private previousSelection: any;
  private sampleList = new Array<number>();
  private sampleIndex = 0;
  private loop: Subscription | undefined;
  private progress: any;
  @ViewChild('authlist') authlist: ElementRef | undefined;

  constructor(private renderer: Renderer2,
    private router: Router,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal,
    private sampleService: SampleService,
    private geoRocService: GeorocService) { }

  ngOnInit(): void {
    this.spinnerOn = true;
    let s = this.geoRocService.getAuthorList().subscribe(
      (res: any) => {
        this.spinnerOn = false;

        if (typeof res === 'string') {
          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = { headerText: 'ERROR', bodyText: res };
          ref.componentInstance.emitter.subscribe(() => { ref.close(); this.goPrevious() });
        } else {
          this.authors = res.sort(function (a: any, b: any) {
            let cmp = ('' + a.lastName).localeCompare('' + b.lastName);
            switch (cmp) {
              case 0:
                return ('' + a.firstName).localeCompare('' + b.firstName);
              default:
                return cmp;
            }
          });
          this.filteredAuthors = [...this.authors];
        }
        // console.log(this.authors);
      }
    );

    this.loop = this.eventGeneratorService.on(FULL_DATA_LOOP).subscribe(
      () => {
        this.sampleIndex++;
        if (this.sampleIndex >= this.sampleList.length) {
          this.progress.close();
          console.log(this.finalReport);
          let text = 'Author: ' + this.finalReport.author + '.\n\n';
          text += 'Inserted ' + this.finalReport.inserted + ' new items of ' + this.finalReport.items + '.\n';
          text += 'Not inserted ' + this.finalReport.rejected + ' items (already in database) of ' + this.finalReport.items + '.\n';
          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = { headerText: 'ERROR', bodyText: text };
          ref.componentInstance.emitter.subscribe(() => { ref.close(); });
        } else {
          this.eventGeneratorService.emit({
            key: PROGRESS_TEXT,
            content: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
          });
          this.importSamples();
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (!!this.loop) {
      this.loop.unsubscribe();
    }
  }

  public select(author: any) {
    console.log(author);
    if (this.previousSelection) {
      this.previousSelection.color = undefined;
    }
    author.color = 'orange';
    this.previousSelection = author;
    this.selection = author;
  }

  public filterAuthors(): void {
    if (!!this.authors) {
      this.filteredAuthors.length = 0;
      this.waitingSpinner = true;
      setTimeout(() => {
        if (this.lastName.length === 0) {
          this.filteredAuthors = [...this.authors];
          this.waitingSpinner = false;
          this.reset();
          return;
        }

        let sub = this.getAuthorsFromFilter().subscribe(
          (res: any) => {
            this.filteredAuthors = res;
            this.waitingSpinner = false;
            sub.unsubscribe();
          }
        )
      }, 20);
    }
  }

  private getAuthorsFromFilter(): Observable<any> {
    let outList = new Array<any>();
    let found = false;
    if (!!this.lastName) {
      let name = this.lastName.toLowerCase();
      for (let a of this.authors) {
        if (a.lastName.toLowerCase().startsWith(name)) {
          outList.push(a);
          found = true;
        } else {
          if (found === true) {
            return of(outList);
          }
        }
      }
    }
    return of(outList);
  }

  public getAuthors(): void {
    if (!!this.authors && this.authors.length > 0 && this.lastName.length > 1) {
      this.getAuthorsFromCache(this.lastName).subscribe(
        (res: any) => {
          Array.from(this.authlist?.nativeElement.children).forEach(child => {
            this.renderer.removeChild(this.authlist?.nativeElement, child);
          });

          for (let r of res) {
            const option = this.renderer.createElement('option');
            option.setAttribute('value', r.lastName + ', ' + r.firstName);
            this.renderer.appendChild(this.authlist?.nativeElement, option);
          }
        }
      );
    }
  }

  private getAuthorsFromCache(lastName?: string): Observable<any> {
    let outList = new Array<any>();
    if (!!lastName) {
      for (let a of this.authors) {
        if (a.lastName.toLowerCase().indexOf(lastName.toLowerCase()) >= 0) {
          outList.push(a);
        }
      }
    }
    return of(outList);
  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

  public reset() {
    if (!!this.previousSelection)
      this.previousSelection.color = undefined;
    if (!!this.selection)
      this.selection.color = undefined;
    this.previousSelection = undefined;
    this.selection = undefined;
  }

  public use() {
    this.spinner2On = true;
    let sub = this.geoRocService.getSamplesByAuthor(this.selection.lastName, this.selection.firstName).subscribe(
      (res: Array<number>) => {
        this.spinner2On = false;
        this.sampleList.length = 0;
        for (let r of res) {
          this.sampleList.push(r);
        }
        // console.log(res);
        this.finalReport.author = this.selection.lastName + ' ' + this.selection.firstName;
        this.finalReport.items = res.length;
        let ref = this.modalService.open(ConfirmComponent, { centered: true });
        ref.componentInstance.params = {
          headerText: 'Confirm',
          bodyText: 'Found ' + res.length + ' items related to ' + this.selection.lastName + ' ' + this.selection.firstName + '.'
            + ' Please confirm data import.'
        };
        ref.componentInstance.emitter.subscribe(
          (response: string) => {
            ref.close();
            if (response === CONFIRM) {
              this.sampleIndex = 0;
              this.progress = this.modalService.open(ProgressComponent, { centered: true });
              ref.componentInstance.params = {
                bodyText: 'Processed ' + this.sampleIndex + ' items of ' + this.sampleList.length
              }
              this.importSamples();
            }
          }
        );
      }
    );
  }

  private importSamples(): void {
    if (this.sampleIndex >= this.sampleList.length) {
      console.log(this.finalReport);
      return;
    }
    let sampleData = this.geoRocService.getSampleFullData(this.sampleList[this.sampleIndex]).subscribe(
      (res: GeorocNative) => {
        console.log(res);
        let fullData: GeorocFullData = toGeorocFullData(res);
        console.log(fullData);
        let s = this.sampleService.insertFullData(fullData).subscribe(
          (res: any) => {
            console.log(res);
            let r = parseInt(res.result);
            if (r === 1) {
              this.finalReport.inserted ++;
            } else {
              this.finalReport.rejected ++;
            }
            s.unsubscribe();
            this.eventGeneratorService.emit({key: FULL_DATA_LOOP});
          }
        );
        sampleData.unsubscribe();
      }
    );
  }
}


