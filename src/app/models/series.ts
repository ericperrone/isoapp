export interface Series {
    xAxis: string;
    yAxis: string;
    series: Array<DataSeries>;
}

export interface DataSeries {
    selected: boolean;
    data: Array<DataSeriesSet>;
    shape: DataSeriesShape;
    name: string;
}

export interface DataSeriesSet {
    x: Array<number>;
    y: Array<number>;
}

export interface DataSeriesShape {
    color: string;
    shape: string;
}

export const DATA_SERIES = '_DATA_SERIES_';