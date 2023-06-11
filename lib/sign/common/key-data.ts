import { MMCommonSign } from './common';

class MMKeyDataSign extends MMCommonSign {
    getTitle() {
        return 'Sign this message to confirm your encryption key';
    }
}

export const keyDataSignInstance = new MMKeyDataSign();
