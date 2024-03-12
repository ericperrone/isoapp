import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Reservoir } from 'src/app/models/reservoir';
import { ReservoirService } from 'src/app/services/rest/reservoir.service';

@Component({
  selector: 'app-reservoir',
  templateUrl: './reservoir.component.html',
  styleUrls: ['./reservoir.component.scss']
})
export class ReservoirComponent implements OnInit {
  public cache = new Array<Reservoir>();
  public names = new Array<string>();
  public nameList = new Array<string>();
  public reservoirs = new Array<Reservoir>();
  public filter = '';
  public reservoirName = "";
  public showReservoir = false;

  constructor(private reservoirService: ReservoirService) { }

  ngOnInit(): void {
    this.initCache();
    this.initNames();
  }

  public selectNames(): void {
    this.nameList.length = 0;
    if (this.filter.length === 0) {
      this.nameList = [...this.names];
    }
    else {
      for (let name of this.names) {
        if (name.toLowerCase().startsWith(this.filter.toLowerCase())) {
          this.nameList.push(name);
        }
      }
    }
  }

  public select(sn: string) {
    this.reservoirName = sn;
    this.filter = sn;
    this.reservoirName = sn;
    this.reservoirs.length = 0;
    for (let item of this.cache) {
      if (item.name === this.reservoirName) {
        this.reservoirs.push(item);
      }
    }
    this.showReservoir = true;
  }

  private initCache(): void {
    this.cache = new Array<Reservoir>();
    this.reservoirService.getReservoirByName().subscribe(
      (res: any) => {
        for (let item of res)
          this.cache.push(item);
        // this.reservoirs = [...this.cache];
      }
    );
  }

  private initNames(): void {
    this.names = new Array<string>();
    this.reservoirService.getReservoirList().subscribe(
      (res: any) => {
        for (let item of res)
          this.names.push(item);
        this.nameList = [...this.names];
      }
    );
  }

}
