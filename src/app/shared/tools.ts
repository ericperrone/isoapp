export function distinct(vector: Array<string>): Array<string> {
    let nVector = new Array<string>;
    let index = new Map<string, string>();

    for (let v of vector) {
        if (!index.get(v)) {
            index.set(v, v);
            nVector.push(v);
        }
    }

    return nVector;
}