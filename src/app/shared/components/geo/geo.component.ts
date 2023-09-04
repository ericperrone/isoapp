import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter, Output } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import { OverviewMap, defaults as defaultControls } from 'ol/control.js';
import { Draw } from 'ol/interaction';
import VectorSource from 'ol/source/Vector';
import { createBox } from 'ol/interaction/Draw';
import { CANCEL } from '../../modals/modal-params';
import { Collection, Feature } from 'ol';
import { Geometry } from 'ol/geom';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-geo',
  templateUrl: './geo.component.html',
  styleUrls: ['./geo.component.scss']
})
export class GeoComponent implements OnInit, AfterViewInit {
  public map: Map | undefined;
  public coordinates = new Array<Array<number>>();
  public topLat = '';
  public topLong = '';
  public bottomLat = '';
  public bottomLong = '';
  private sourceOSM = new OSM();
  private sourceVector = new VectorSource({ wrapX: false });
  private draw = new Draw({ type: 'Circle' });
  private collection = new Collection<Feature<Geometry>>();
  @ViewChild('extent') extent: any;
  @Output() emitter: EventEmitter<any> = new EventEmitter();

  constructor(private decimalPipe: DecimalPipe) { }

  ngOnInit(): void {
    const overviewMapControl = new OverviewMap({
      layers: [
        new TileLayer({
          source: this.sourceOSM,
        }),
      ],
    });

    this.map = new Map({
      controls: defaultControls().extend([overviewMapControl]),
      view: new View({
        center: [0, 0],
        zoom: 0,
        // projection: 'EPSG:3857',
        projection: 'EPSG:4326',
      }),
      layers: [
        new TileLayer({
          source: this.sourceOSM,
        }),
        new VectorLayer({
          source: this.sourceVector,        
        })
      ],
      target: 'ol-map'
    });

  }

  ngAfterViewInit(): void {
    this.draw = new Draw(
      {
        source: this.sourceVector,
        type: 'Circle',
        geometryFunction: createBox(),
        features: this.collection
      }
    );

    this.draw.on('drawstart', (e: any) => {
      this.collection.getLength;
      let feature = this.collection.item(this.collection.getLength() - 1);
      this.sourceVector.removeFeature(feature);
      this.collection.pop();
    });

    this.draw.addEventListener('drawend', (event) => {
      // console.log(event);
      console.log(event.target.sketchCoords_);
      this.coordinates = event.target.sketchCoords_;
      this.remapCoordinates();
      // this.map?.removeInteraction(this.draw);
    });

    this.map?.addInteraction(this.draw);
  }

  private remapCoordinates() {
    let fractionDigits = 4;
    const digitsInfo = `1.${fractionDigits}-${fractionDigits}`;
    this.topLat = '' + this.decimalPipe.transform(this.coordinates[0][1], digitsInfo);
    this.topLong = '' + this.decimalPipe.transform(this.coordinates[0][0], digitsInfo);
    this.bottomLat = '' + this.decimalPipe.transform(this.coordinates[1][1], digitsInfo);
    this.bottomLong = '' + this.decimalPipe.transform(this.coordinates[1][0], digitsInfo);
  }

  public cancel() {
    this.emitter.emit(CANCEL);
  }

  public confirm() {

  }
}

