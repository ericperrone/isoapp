import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CONFIRM, CANCEL } from '../modal-params';

@Component({
  selector: 'app-file-uploader',
  templateUrl: './file-uploader.component.html',
  styleUrls: ['./file-uploader.component.scss']
})
export class FileUploaderComponent implements OnInit {
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {
    this.emitter.emit(CONFIRM);
  }
  
}
