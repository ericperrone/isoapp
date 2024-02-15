import { StoreService } from "../services/common/store.service";
import { GridItem } from "../shared/components/grid/grid.component";

export const DATA_GRID = '_DATA_GRID_';
export const ITINERIS_ID = 'ITINERIS_ID';

export class DataGrid {
    private grid: Array<Array<GridItem>> | undefined;
    private headers: Array<GridItem> | undefined;
    private originalHeaders: Array<GridItem> | undefined;
    private rows: Array<Array<GridItem>> | undefined;

    constructor(private storeService: StoreService) { }

    public init() {
        this.load();
        if (!this.grid) {
            this.grid = new Array<Array<GridItem>>();
        }
    }

    public persist(): void {
        this.storeService.push({ key: DATA_GRID, data: this.grid });
    }

    public reset(): void {
        this.grid = undefined;
        this.headers = undefined;
        this.originalHeaders = undefined;
        this.rows = undefined;
        this.storeService.clean(DATA_GRID);
    }

    public getElementList(): Array<string> {
        let list = new Array<string>();
        if (!!this.grid) {
            this.headers = this.grid[0];
            for (let h of this.headers) {
                if (h.content != ITINERIS_ID) {
                    list.push(h.content);
                }
            }
        }
        return list;
    }

    public load(): void {
        this.grid = this.storeService.get(DATA_GRID);
        if (!!this.grid) {
            this.headers = this.grid[0];
            this.rows = this.grid.slice(1);
        }
    }

    public add(headers: Array<GridItem>, dataSet: Array<Array<GridItem>>) {
        this.originalHeaders = headers;
        if (!this.grid) {
            this.init();
        }
        for (let h of headers) {
            this.buildHeader(h);
        }
        this.buildRows(dataSet);
        console.log(this.headers);
        console.log(this.rows);
    }

    private buildHeader(header: GridItem): void {
        if (header.type === 'F' && header.content !== ITINERIS_ID) {
            return;
        }
        if (!!this.grid) {
            if (!this.headers) {
                let h = new Array<GridItem>();
                let nheader = { ...header };
                nheader.col = 0;                
                h.push(nheader)
                this.grid.push(h);
                this.headers = this.grid[0];
            } else {
                for (let h of this.headers) {
                    if (h.content === header.content)
                        return;
                }
                let nheader = { ...header };
                nheader.col = this.headers.length;
                this.headers.push(nheader);
            }
        }
    }

    private buildRows(dataSet: Array<Array<GridItem>>): void {
        this.adjustExistingRowws();
        if (!!this.grid && !!this.headers) {
            for (let i = 0; i < dataSet.length; i++) {
                let row = new Array<GridItem>();
                for (let j = 0; j < this.headers.length; j++) {
                    let item = { header: false, visible: false, selected: false, row: i, col: this.headers[j].col, content: '', check: false, type: this.headers[j].type };
                    row.push(item);
                }
                this.fillRow(dataSet[i], row);
                this.grid.push(row);
            }

            this.rows = this.grid.slice(1);
        }
    }

    private adjustExistingRowws(): void {
        if (!!this.grid && !!this.headers) {
            // let rows = this.grid.slice(1);
            for (let i = 1; i < this.grid.length; i++) {
                let row = this.grid[i];
                for (let j = 0; j < this.headers.length; j++) {
                    if (!row[j]) {
                        row.push({ header: false, visible: false, selected: false, row: i, col: this.headers[j].col, content: '', check: false, type: this.headers[j].type });
                    }
                }    
            }
        }
    }

    private fillRow(src: Array<GridItem>, tgt: Array<GridItem>): void {
        if (!!this.originalHeaders && !!this.headers) {
            for (let s of src) {
                let content = '' + this.originalHeaders[s.col].content;
                for (let c = 0; c < this.headers.length; c++) {
                    if (('' + this.headers[c].content) === content) {
                        tgt[c].content = s.content;
                        break;
                    }
                }
            }
        }
    }
}