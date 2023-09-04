import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Input() public initialStatus: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;
  public slideLeft: boolean = false;
  public slideRight: boolean = false;
  public transition: 'sideOff' | 'sideOn' | 'transitionLeft' | 'transitionRight' | undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
    if (!!this.initialStatus) {
      this.transition = this.initialStatus;
    } else {
      this.transition = 'sideOff';
    }
  }

  public gotoDataProcessing() {
    this.router.navigate(['main-data-processing']);
  }

  public gotoDbQueries() {
    this.router.navigate(['main-db-querying']);
  }

  public gotoGeo() {
    this.router.navigate(['geo']);
  }

  public toggleSidebar(): void {
    if (this.transition === 'sideOff') {
      this.transition = 'transitionRight';
      setTimeout(() => {
        this.transition = 'sideOn';
      }, 1000);
    } else if (this.transition === 'sideOn') {
      this.transition = 'transitionLeft';
      setTimeout(() => {
        this.transition = 'sideOff';
      }, 1000);      
    }
  }
}




