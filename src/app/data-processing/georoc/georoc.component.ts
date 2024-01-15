import { Component, ElementRef, OnInit, ViewChild, Renderer2, OnDestroy } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable, Subscription, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { GeorocService } from 'src/app/services/georoc/georoc.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';
import { ConfirmComponent } from 'src/app/shared/modals/confirm/confirm.component';
import { ModalParams, CONFIRM, CANCEL, DataListItem } from 'src/app/shared/modals/modal-params';
import { GeorocData, GeorocFullData, GeorocNative, toGeorocFullData } from 'src/app/models/georoc';
import { SampleService } from 'src/app/services/rest/sample.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { PROGRESS_TEXT, ProgressComponent } from 'src/app/shared/modals/progress/progress.component';


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
  public active = 0;

  constructor(private renderer: Renderer2,
    private router: Router,
    private eventGeneratorService: EventGeneratorService,
    private modalService: NgbModal,
    private sampleService: SampleService,
    private geoRocService: GeorocService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {

  }

  public goPrevious(): void {
    this.router.navigate(['file-list']);
  }

}


