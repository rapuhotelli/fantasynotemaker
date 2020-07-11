export enum Events {
    SET_TEXT = 'SET_TEXT'
}

class InternalEvent {
    private callbacks;

    constructor(private name) {
        this.callbacks = [];
    }
    registerCallback = (callback) => {
        this.callbacks.push(callback);
    };
}

export interface IEventReactor {
    registerEvent: (string) => void;
    dispatchEvent: (string, args) => void;
    addEventListener: (string, callback) => void;
}

class EventReactor implements IEventReactor {
    constructor(private events = {}) {}

    registerEvent = (eventName) => {
        this.events[eventName] = new InternalEvent(eventName);
    };

    dispatchEvent = (eventName, eventArgs = undefined) => {
        console.log(`event "${eventName}" >`, eventArgs);
        this.events[eventName].callbacks.forEach(function (callback) {
            callback(eventArgs);
        });
    };

    addEventListener = (eventName, callback) => {
        this.events[eventName].registerCallback(callback);
    };
}

export const GlobalEvents = new EventReactor();
GlobalEvents.registerEvent(Events.SET_TEXT);
