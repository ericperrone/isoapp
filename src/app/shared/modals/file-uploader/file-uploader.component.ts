import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CONFIRM, CANCEL } from '../modal-params';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();
  @ViewChild('uploader') uploader: any;
  @ViewChild('hiddeninput') hiddenInput: any;
  public actionUrl = '';
  public dataSetRef = '';
  public authors = '';
  public uploadedFile = '';

  constructor() { 
    this.actionUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;
  }

  ngOnInit(): void {
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
      this.uploader.nativeElement.submit();
      this.emitter.emit(CONFIRM);
    }
  }

  public fireClick(): void {
    this.hiddenInput.nativeElement.click();
  }
  
}
