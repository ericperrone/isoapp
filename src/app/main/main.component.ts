import { Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  // @Input() public initialStatus: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;
  // public slideLeft: boolean = false;
  // public slideRight: boolean = false;
  // public transition: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;

  // constructor(private router: Router) { }

  ngOnInit(): void {
    // this.transition = 'sideOff';
  }

  // public gotoDataProcessing() {
  //   this.router.navigate(['file-list']);
  // }

  // public toggleSidebar(): void {
  //   if (this.transition === 'sideOff') {
  //     this.transition = 'transitionRight';
  //     setTimeout(() => {
  //       this.transition = 'sideOn';
  //     }, 1000);
  //   } else if (this.transition === 'sideOn') {
  //     this.transition = 'transitionLeft';
  //     setTimeout(() => {
  //       this.transition = 'sideOff';
  //     }, 1000);      
  //   }
  // }
}
