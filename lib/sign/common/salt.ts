import { MMCommonSign } from './common';

class MMSaltSign extends MMCommonSign {
    getTitle() {
        return 'Sign this salt to generate encryption key';
    }
}

export const saltSignInstance = new MMSaltSign();
