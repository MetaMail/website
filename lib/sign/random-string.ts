import { MMSign } from 'lib/base/sign';
import { IGetRandomStrToSignResponse } from 'lib/http/user';

class MMRandomStringSign extends MMSign {
    private _signData: IGetRandomStrToSignResponse;

    set signData(signData: IGetRandomStrToSignResponse) {
        this._signData = signData;
    }

    getSignTypes() {
        if (!this._signData) {
            throw new Error('No sign data provided');
        }
        return this._signData.signTypes;
    }

    get signMethod() {
        if (!this._signData) {
            throw new Error('No sign data provided');
        }
        return this._signData.signMethod;
    }

    get domain() {
        if (!this._signData) {
            throw new Error('No sign data provided');
        }
        return this._signData.domain;
    }
}

export const randomStringSignInstance = new MMRandomStringSign();
