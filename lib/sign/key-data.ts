import { MMSign } from 'lib/base/sign';

class MMKeyDataSign extends MMSign {
    getSignTypes() {
        return {
            Sign_KeyData: [
                { name: 'date', type: 'string' },
                { name: 'salt', type: 'string' },
                { name: 'public_key_hash', type: 'string' },
            ],
        };
    }
}

export const keyDataSignInstance = new MMKeyDataSign();
