export const ChartShapes = [
    'circle',
    'cross',
    'square',
    'triangle'
];

export interface Series {
    xAxis: string;
    yAxis: string;
    width: number;
    height: number;
    series: Array<DataSeries>;
}

export interface DataSeries {
    selected: boolean;
    data: Array<DataSeriesPoint>;
    shape: DataSeriesShape;
    name: string;
}

export interface DataSeriesPoint {
    x: number;
    y: number;
}

export interface DataSeriesShape {
    color: string;
    shape: string;
}

export const DATA_SERIES = '_DATA_SERIES_';