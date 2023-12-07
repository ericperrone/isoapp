import { Component, ElementRef, OnInit, ViewChild, Renderer2 } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { JsonPipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { GeorocService } from 'src/app/services/georoc/georoc.service';
import { AlertComponent } from 'src/app/shared/modals/alert/alert.component';

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
export class GeorocComponent implements OnInit {
  public spinnerOn = false;
  public lastName = '';
  public authors: any;
  @ViewChild('authlist') authlist: ElementRef | undefined;

  constructor(private renderer: Renderer2,
    private router: Router,
    private modalService: NgbModal,
    private geoRocService: GeorocService) { }

  ngOnInit(): void {
    this.spinnerOn = true;
    let s = this.geoRocService.getAuthorList().subscribe(
      (res: any) => {
        this.spinnerOn = false;
        console.log(res);
        if (typeof res === 'string') {
          let ref = this.modalService.open(AlertComponent, { centered: true });
          ref.componentInstance.params = { headerText: 'ERROR', bodyText: res };
          ref.componentInstance.emitter.subscribe(() => { ref.close(); this.goPrevious() });
        } else {
          this.authors = res;
        }
      }
    );
  }

  public getAuthors(): void {
    if (!!this.authors && this.authors.length > 0 && this.lastName.length > 3) {
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
}


