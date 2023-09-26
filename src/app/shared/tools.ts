export function distinct(vector: Array<string>): Array<string> {
    let nVector = new Array<string>;
    let index = new Map<string, string>();

    for (let v of vector) {
        let w = v.toLowerCase();
        if (!index.get(w)) {
            index.set(w, v);
            nVector.push(v);
        }
    }

    return nVector;
}

export function deleteByValue(vector: Array<string>, value: string): Array<string> {
    let nVector = new Array<string>;
    let toBeDeleted = value.toLowerCase();
    for (let v of vector) {
        if (v.toLowerCase() !== toBeDeleted) {
            nVector.push(v);
        }
    }

    return nVector;
}

export interface GeoGoordinates {
    latitude: number;
    longitude: number;
}

export function epsg3857to4326(lat3857: number, long3857: number): GeoGoordinates {
    const e_value = 2.7182818284;
    const X = 20037508.34;
    
    const long4326 = (long3857 * 180) / X;
    
    let lat4326 = lat3857 / (X / 180);
    const exponent = (Math.PI / 180) * lat4326;
    
    lat4326 = Math.atan(Math.pow(e_value, exponent));
    lat4326 = lat4326 / (Math.PI / 360);
    lat4326 = lat4326 - 90;

    return { latitude: lat4326, longitude: long4326 };
}

export function saveCsvFile(csv: string): void {
    const universalBOM = "\uFEFF";
    window.open("data:text/csv;charset=utf-16," + encodeURIComponent(universalBOM + csv));
}