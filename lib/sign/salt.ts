import { MMSign } from 'lib/base/sign';

class MMSaltSign extends MMSign {
    getSignTypes() {
        return {
            Sign_Salt: [
                { name: 'hint', type: 'string' },
                { name: 'salt', type: 'string' },
            ],
        };
    }
}

export const saltSignInstance = new MMSaltSign();
