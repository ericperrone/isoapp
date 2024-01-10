import { Component, OnInit, OnDestroy } from '@angular/core';
import { StoreService } from 'src/app/services/common/store.service';
import { EventGeneratorService } from 'src/app/services/common/event-generator.service';
import { SampleService } from 'src/app/services/rest/sample.service';
import { GridComponent, GridItem, EXPORT } from 'src/app/shared/components/grid/grid.component';
import { CLOSE_ALL_MODALS } from 'src/app/main/header/header.component';
import { Subscription } from 'rxjs';
import { OUT_RESULT } from 'src/app/geo-modelling/mixing/mixing.component';
import { AuthorService } from 'src/app/services/rest/author.service';
import { CACHE_AUTH, CACHE_LINKS } from 'src/app/shared/const';
import { DatasetService } from 'src/app/services/rest/dataset.service';

export const RESET_FILTER = '_RESET_FILTER_';
export const FILTER_KEY = '_FILTER_KEY_';

export interface GeoRegion {
  topLatitude: number;
  topLongitude: number;
  bottomLatitude: number;
  bottomLongitude: number;
}

export interface QueryFilter {
  ref: string;
  authors: string[];
  keywords: string[];
  geo?: GeoRegion;
}

@Component({
  selector: 'app-main-db-querying',
  templateUrl: './main-db-querying.component.html',
  styleUrls: ['./main-db-querying.component.scss']
})
export class MainDbQueryingComponent implements OnInit, OnDestroy {
  public queryDisabled = true;
  public spinnerOn = false;
  public filterOn = true;
  public jsonTable = [];
  public jsonHeader = [];
  public gridContent: Array<Array<string>> | undefined;
  private sub: Subscription | undefined;

  constructor(private storeService: StoreService,
    private authorService: AuthorService,
    private sampleService: SampleService,
    private datasetService: DatasetService,
    private eventGeneratorService: EventGeneratorService) { }

  ngOnInit(): void {
    this.storeService.push({ key: FILTER_KEY, data: { ref: '', authors: [], keywords: [] } });
    this.sub = this.eventGeneratorService.on(CLOSE_ALL_MODALS).subscribe(
      () => this.filterOn = true
    );

    this.storeService.clean(CACHE_AUTH);
    let s: any = this.authorService.getAuthors().subscribe(
      (res: any) => {
        // console.log(res);
        this.storeService.push({key: CACHE_AUTH, data: res});
        s.unsubscribe();
      }
    );
    let t: any = this.datasetService.getLinks().subscribe(
      res => t.unsubscribe()
    ); 
  }

  ngOnDestroy(): void {
    if (!!this.sub) {
      this.sub.unsubscribe();
    }
  }

  public resetFilters(): void {
    this.eventGeneratorService.emit({ key: RESET_FILTER });
    this.queryDisabled = true;
  }

  public submitQuery(): void {
    this.storeService.clean(OUT_RESULT);
    let filter: QueryFilter = this.storeService.get(FILTER_KEY);
    this.spinnerOn = true;
    this.sampleService.mainQueryTable(filter).subscribe(
      (res) => {
        console.log(res);
        // this.jsonHeader = res[0];
        // this.jsonTable = res.slice(1);
        this.gridContent = res;
        this.spinnerOn = false;
        this.filterOn = false;
      }
    );
  }

  public checkFilter(): void {
    let filter: QueryFilter = this.storeService.get(FILTER_KEY);
    console.log(filter);
    if (filter.authors.length > 0 || filter.keywords.length > 0 || filter.ref.length > 0 || !!filter.geo) {
      this.queryDisabled = false;
    } else {
      this.queryDisabled = true;
    }
  }

  public export(): void {
    this.eventGeneratorService.emit({ key: EXPORT });
  }
}
