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