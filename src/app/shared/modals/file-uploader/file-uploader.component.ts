import { Component, OnInit, AfterViewInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { EventManager } from '@angular/platform-browser';
import { CONFIRM, CANCEL } from '../modal-params';
import { DatasetService } from 'src/app/services/rest/dataset.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit, AfterViewInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('uploader') uploader: any;
  @ViewChild('hiddeninput') hiddenInput: any;
  public actionUrl = '';
  public dataSetRef = '';
  public authors = '';
  public uploadedFile = '';

  constructor(private datasetService: DatasetService, private eventManager: EventManager) {
    this.actionUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;
    // this.eventManager.addEventListener(document.body, 'click', () => console.log('click')); // funziona !!!
  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    // this.eventManager.addEventListener(this.uploader.nativeElement, 'submit', this.onFormSubmit);
    // this.eventManager.addEventListener(this.uploader.nativeElement, 'submit', () => console.log('submit'));

  }

  public cancel(): void {
    console.log(this.authors);
    console.log(this.uploadedFile);
    this.emitter.emit(CANCEL);
  }

  public setFile(event: any): void {
    // console.log(event);
    this.uploadedFile = event.target.files[0].name;
  }

  public confirm(): void {
    if (this.uploadedFile.length > 0) {
      // this.uploader.nativeElement.addEventListener('submit', (event: any) => this.onFormSubmit(event));
      this.datasetService.insertDataset({ ref: this.dataSetRef, authors: this.authors, file: this.uploadedFile }).subscribe(
        (res) => {
          console.log(res);
          this.uploader.nativeElement.submit();
          this.emitter.emit(CONFIRM);
        }
      );
    }
  }

  public fireClick(): void {
    this.hiddenInput.nativeElement.click();
  }

  public onFormSubmit() {
    this.emitter.emit(CONFIRM);
  }

}
