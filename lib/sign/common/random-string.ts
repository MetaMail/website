import { MMCommonSign } from './common';

class MMRandomStringSign extends MMCommonSign {
    getTitle() {
        return 'Sign this randomString to Login';
    }
}

export const randomStringSignInstance = new MMRandomStringSign();
