import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { EndMemberItem } from 'src/app/services/common/geo-model.service';

export interface Item {
  element: string;
  value: number;
  concentration?: string;
  cValue?: number;
}

export interface ManualEndmemberItem {
  sampleName: string;
  items: Array<Item>;
}

@Component({
  selector: 'app-end-members-modal',
  templateUrl: './end-members-modal.component.html',
  styleUrls: ['./end-members-modal.component.scss']
})
export class EndMembersModalComponent implements OnInit {
  @Output() emitter = new EventEmitter<any>();
  public endMembers: Array<ManualEndmemberItem> = [
    {sampleName: '', items: [{element: '', value: 0}, {element: '', value: 0, cValue: 0}]},
    {sampleName: '', items: [{element: '', value: 0}, {element: '', value: 0, cValue: 0}]},
    {sampleName: '', items: [{element: '', value: 0}, {element: '', value: 0, cValue: 0}]}
  ];
  public include = false;

  constructor() { }

  ngOnInit(): void {
  }

  public cancel(): void {
    this.emitter.emit();
  }

  public confirm(): void {
    this.emitter.emit();
  }

}
