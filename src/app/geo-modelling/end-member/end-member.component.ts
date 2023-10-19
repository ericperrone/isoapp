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
export const RESET_SELECTION = '_RESET_SELECTION_';
export const END_MEMBER = '_END_MEMBER_';

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
  public multipleSelectionMode = false;
  public subReset: Subscription | undefined;
  public subMember: Subscription | undefined;
  public subMultiSelect: Subscription | undefined;
  public activeMember = '';

  constructor(private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.subReset = this.eventGeneratorService.on(RESET_SELECTION).subscribe(
      (event: any) => {
        this.unSelectAll();
      }
    );
    this.subMember = this.eventGeneratorService.on(END_MEMBER).subscribe(
      (event: any) => {
        this.activeMember = event.content;
      }
    )
    this.subMultiSelect = this.eventGeneratorService.on(MULTIPLE_SELECTION_MODE).subscribe(
      (event: any) => {
        this.multipleSelectionMode = event.content;
      }
    )
    this.analyzeMembers();
  }

  ngOnDestroy(): void {
    if (!!this.subReset) {
      this.subReset.unsubscribe();
    }
    if (!!this.subMember) {
      this.subMember.unsubscribe();
    }
    if (!!this.subMultiSelect) {
      this.subMultiSelect.unsubscribe();
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
    if (memberName === this.activeMember) {
      if (!this.multipleSelectionMode) {
        this.unSelectByMember(memberName);
      }
      true === item.selected ? item.selected = undefined : item.selected = true;
      if (!item.selected) {
        item.selected = false;
      }
      this.onSelect.emit({ 'memberName': memberName, 'item': item });
    }
  }

  private unSelectByMember(memberName: string) {
    if (!!this.endMembers) {
      for (let em of this.endMembers) {
        if (em.name === memberName) {
          for (let m of em.member) {
            m.selected = false;
          }
          break;
        }
      }
    }
  }

  private unSelectAll(): void {
    if (!!this.endMembers) {
      for (let em of this.endMembers) {
        for (let m of em.member) {
          m.selected = false;
        }
      }
    }
  }

}
