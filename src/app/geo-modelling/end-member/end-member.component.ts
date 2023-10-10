import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { EndMemberItem } from 'src/app/services/common/geo-model.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { Subscription } from 'rxjs';

export interface EndMember {
  name: string;
  member: Array<EndMemberItem>;
}

export const MULTIPLE_SELECTION_MODE = '_MULTIPLE_SELECTION_MODE_';
export const SECOND_SELECTION = '_SECOND_SELECTION_';

@Component({
  selector: 'app-end-member',
  templateUrl: './end-member.component.html',
  styleUrls: ['./end-member.component.scss']
})

export class EndMemberComponent implements OnInit, OnDestroy {
  @Input('members') members: Array<Array<EndMemberItem>> | undefined;
  @Output() outMember = new EventEmitter<any>();
  @Output() onSelect = new EventEmitter<any>();

  public endMembers = new Array<EndMember>();
  public multipleSelectionMode = true;
  public sub: Subscription | undefined;

  constructor(private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.analyzeMembers();
    this.sub = this.eventGeneratorService.on(MULTIPLE_SELECTION_MODE).subscribe(
      (event: any) => {
        this.multipleSelectionMode = event.content;
        // console.log(this.multipleSelectionMode);
      }
    )
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  private analyzeMembers() {
    if (!!this.members) {
      for (let i = 0; i < this.members?.length; i++) {
        let member = this.members[i];
        for (let m of member) {
          if (m.type === 'F') {
            let sname = m.name.toLowerCase();
            if (sname.indexOf('sample') >= 0) {
              let newMember = new Array<EndMemberItem>();
              for (let nm of member) {
                if (nm.type !== 'F') {
                  newMember.push(nm);
                }
              }
              this.endMembers.push({ name: m.value, member: newMember });
              break;
            }
          }
        }
      }
      this.outMember.emit(this.endMembers);
    }
  }

  public onClick(item: EndMemberItem, memberName: string): void {    
    // this.unSelectAll(item);
    true === item.selected ? item.selected = undefined : item.selected = true;
    this.onSelect.emit({ 'memberName': memberName, 'item': item });
  }

  private unSelectAll(item: EndMemberItem): void {
    if (this.multipleSelectionMode)
      return;
    for (let m of this.endMembers) {
      for (let mm of m.member) {
        if (mm !== item)
          mm.selected = false;
      }
    }
  }

}
