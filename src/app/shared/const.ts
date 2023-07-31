export const ChemElements = [
    'Ac',
    'Ag',
    'Al',
    'Am',
    'Ar',
    'As',
    'At',
    'Au',
    'B',
    'Ba',
    'Be',
    'Bh',
    'Bi',
    'Bk',
    'Br',
    'C',
    'Ca',
    'Cd',
    'Ce',
    'Cf',
    'Cl',
    'Cm',
    'Co',
    'Cr',
    'Cs',
    'Cu',
    'Db',
    'Ds',
    'Dy',
    'Er',
    'Es',
    'Eu',
    'F',
    'Fe',
    'Fm',
    'Fr',
    'Ga',
    'Gd',
    'Ge',
    'H',
    'He',
    'Hf',
    'Hg',
    'Ho',
    'Hs',
    'I',
    'In',
    'Ir',
    'K',
    'Kr',
    'La',
    'Li',
    'Lr',
    'Lu',
    'Md',
    'Mg',
    'Mn',
    'Mo',
    'Mt',
    'N',
    'Na',
    'Nb',
    'Nd',
    'Ne',
    'Ni',
    'No',
    'Np',
    'O',
    'Os',
    'P',
    'Pa',
    'Pb',
    'Pd',
    'Pm',
    'Po',
    'Pr',
    'Pt',
    'Pu',
    'Ra',
    'Rb',
    'Re',
    'Rf',
    'Rg',
    'Rh',
    'Rn',
    'Ru',
    'S',
    'Sb',
    'Sc',
    'Se',
    'Sg',
    'Si',
    'Sm',
    'Sn',
    'Sr',
    'Ta',
    'Tb',
    'Tc',
    'Te',
    'Th',
    'Ti',
    'Tl',
    'Tm',
    'U',
    'Cn',
    'Lv',
    'Og',
    'Mc',
    'Fl',
    'Ts',
    'Nh',
    'V',
    'W',
    'Xe',
    'Y',
    'Yb',
    'Zn',
    'Zr'
];

export function checkChemElement(element: string): boolean {
    let ele = element;
    if (ele.indexOf('(') > 0) {
        ele = ele.split('(')[0].trim();
    }
    for (let e of ChemElements) {
        if (e.toLowerCase() === ele.toLowerCase()) 
            return true;
    }
    return false;
}

export const FIELDS = [
    'rock', 'sampl', 'age', 'loca', 'latitude', 'longitude', 'material', 'mineral', 'ref', 'tect', 'type', 'name', 'serie',
    'alter', 'drill', 'geol', 'erupt', 'year', 'elevation'
];

export function checkField(field: string) {
    let f = field.toLowerCase();
    for (let e of FIELDS) {
        if (f.indexOf(e) >= 0) {
            return true;
        }
    }
    return false;
}

export function checkIsotope(element: string): boolean {
    return false;
}