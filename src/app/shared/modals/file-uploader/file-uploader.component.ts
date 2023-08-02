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
  public actionUrl = '';

  constructor() { 
    this.actionUrl = environment.be.protocol + '://' + environment.be.server + '/' + environment.be.basedir;
  }

  ngOnInit(): void {
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    console.log(this.uploader);
    this.uploader.nativeElement.submit();
    this.emitter.emit(CONFIRM);
  }
  
}
