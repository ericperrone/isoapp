import {  Observable, fromEvent, map, } from 'rxjs';

export const KEYUP = 'keyup';

export class KeyboardManager {
 
    constructor() { }

    public listen(eventName?: string): Observable<any> {
        return fromEvent(window, eventName ? eventName : KEYUP)
            .pipe(
                map((event: any) => { return event.key })
            );
    }
}