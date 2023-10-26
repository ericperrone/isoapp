import { Component, Input, OnInit } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { StoreService } from '../services/common/store.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
  ngOnInit(): void {
  }
}
