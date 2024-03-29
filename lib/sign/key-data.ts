import { MMSign } from 'lib/base/sign';

class MMKeyDataSign extends MMSign {
    getSignTypes() {
        return {
            Sign_KeyData: [
                { name: 'date', type: 'string' },
                { name: 'salt', type: 'string' },
                { name: 'keys_hash', type: 'string' },
                { name: 'keys_meta', type: 'string' },
            ],
        };
    }
}

export const keyDataSignInstance = new MMKeyDataSign();
