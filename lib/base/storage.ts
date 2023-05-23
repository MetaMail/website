import { MMObject } from './object';

export abstract class MMSessionStorage extends MMObject {
    private _sessionStorage: Storage;
    private _name: string;

    constructor(name: string) {
        super();
        this._name = name;
    }

    get sessionStorage() {
        if (!this._sessionStorage) {
            this._sessionStorage = window.sessionStorage;
        }
        return this._sessionStorage;
    }

    get name() {
        return this._name;
    }

    getStorage(key: string, defaultValue: any = null) {
        const value = this.sessionStorage.getItem(key);
        return value ? JSON.parse(value) : defaultValue;
    }

    updateStorage(key: string, value: any) {
        if (value === undefined) return;
        this.sessionStorage.setItem(key, JSON.stringify(value));
    }

    deleteStorage(key: string) {
        this.sessionStorage.removeItem(key);
    }

    clearStorage() {
        this.sessionStorage.clear();
    }
}
