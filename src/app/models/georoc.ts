import { Author } from "./author";
import { Dataset } from "./dataset";
import { Sample, SampleElement, ChemComponent } from "./sample";
import { ChemElements, Isotopes, checkIsotope } from 'src/app/shared/const';

export interface GeorocFullData {
    authors?: Array<Author>;
    dataset?: Dataset;
    sample?: Sample;
}

export interface GeorocAuthor {
    personfirstname?: string;
    personlastname?: string;
    personid?: number;
}

export interface GeorocRef {
    doi?: string;
    journal?: string;
    pages?: string;
    ref_num?: number;
    title?: string;
    year: number;

}

export interface GeorocReference {
    samplingfeatureid: number;
    authors: Array<GeorocAuthor>;
    reference: GeorocRef;
}

export interface GeorocData {
    sampleNum: number;
    sampleName: string;
    uniqueID?: string;
    batches?: Array<number>;
    references?: Array<GeorocReference>;
    locationNames?: Array<string>;
    locationTypes?: Array<string>;
    elevationMin?: string;
    elevationMax?: string;
    landOrSea?: string;
    rockTypes?: Array<string>;
    rockClasses?: Array<string>;
    rockTextures?: Array<string>;
    materials?: Array<string>;
    minerals?: Array<string>;
    inclusionTypes?: Array<string>;
    locationNum?: number;
    latitude?: number;
    longitude?: number;
    latitudeMin?: string;
    latitudeMax?: string;
    longitudeMin?: string;
    longitudeMax?: string;
    tectonicSetting?: string;
    method?: Array<string>;
    comment?: Array<string>;
    institutions?: Array<string>;
    itemName?: Array<string>;
    itemGroup?: Array<string>;
    standardNames?: Array<string>;
    standardValues?: Array<number>;
    values?: Array<number>;
    units?: Array<string>;
}

export interface GeorocNative {
    numItems: number;
    data?: Array<GeorocData>;
}

export function toGeorocFullData(gData: GeorocNative): GeorocFullData {
    let fullData: GeorocFullData = {};
    if (!!gData.data && gData.data.length > 0) {
        fullData.authors = getAuthors(gData.data);
        fullData.dataset = getDataset(gData.data);
        fullData.sample = buildSample(gData.data);
    }
    return fullData;
}

function buildSample(data: GeorocData[]): Sample {
    let sample: Sample = { fields: new Array<SampleElement>, components: new Array<ChemComponent>() };
    let d = data[0];
    if (!!d && !!d.itemName && !!d.values && !!d.units) {
        for (let i = 0; i < d.itemName?.length; i++) {
            let cc: ChemComponent = {
                component: d.itemName[i] + (!!d.units[i] ? ' (' + d.units[i] + ')' : ''),
                value: '' + d.values[i],
                isIsotope: checkIsotope(d.itemName[i]),
                um: d.units[i]
            };
            sample.components.push(cc);
        }
        sample.fields.push({ field: 'SAMPLE NAME', value: d.sampleName });
        sample.fields.push({ field: 'LATITUDE', value: '' + d.latitude });
        sample.fields.push({ field: 'LONGITUDE', value: '' + d.longitude });
        sample.fields.push({ field: 'GEOROC_ID', value: '' + d.sampleNum });
        if (!!d.locationNames)
            for (let i = 0; i < d.locationNames.length; i++) {
                sample.fields.push({ field: 'LOCATION ' + (i + 1), value: d.locationNames[i] });
            }
    }
    return sample;
}

function getDataset(data: GeorocData[]): Dataset {
    let dataset: Dataset = { fileName: '_GEOROC_', metadata: '', ref: '', authors: '', year: 0, processed: true };
    let d = data[0];
    if (!!d.references) {
        for (let ref of d.references) {
            dataset.ref = ref.reference.doi ? ref.reference.doi : '';
            dataset.year = ref.reference.year;
            for (let a of ref.authors) {
                dataset.authors += a.personlastname + ',' + a.personfirstname + ';';
            }
            dataset.authors = dataset.authors.substring(0, dataset.authors.length - 1);
            let meta = ref.reference.title?.toUpperCase().split(' ');
            if (!!meta) {
                for (let m of meta) {
                    if (m !== 'THE' && m !== 'OF' && m !== 'A' && m !== 'AN' && m !== 'FROM' && m !== 'TO'
                        && m !== 'FOR' && m !== 'IN' && m !== 'ON') {
                        dataset.metadata += m + ' ';
                    }
                }
                dataset.metadata = dataset.metadata.trim();
            }

        }
    }
    return dataset;
}

function getAuthors(data: GeorocData[]): Array<Author> {
    let authors = new Array<Author>();
    let d = data[0];
    if (!!d.references) {
        for (let r of d.references) {
            for (let a of r.authors) {
                let author: Author = { surname: '', name: '' };
                author.surname = a.personlastname ? a.personlastname : '';
                author.name = a.personfirstname ? a.personfirstname : '';
                if (author.surname.length > 0 && author.name.length > 0) {
                    authors.push(author);
                }
            }
        }
    }

    return authors;
}