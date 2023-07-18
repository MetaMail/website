import { MMSign } from 'lib/base/sign';

class MMKeyDataSign extends MMSign {
    getSignTypes() {
        return {
            Sign_KeyData: [
                { name: 'date', type: 'string' },
                { name: 'salt', type: 'string' },
                { name: 'encryption_private_key', type: 'string' },
                { name: 'encryption_public_key', type: 'string' },
            ],
        };
    }
}

export const keyDataSignInstance = new MMKeyDataSign();
