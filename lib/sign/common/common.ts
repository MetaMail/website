import { MMSign } from 'lib/base/sign';

export abstract class MMCommonSign extends MMSign {
    getSignTypes() {
        return {
            Message: [
                { name: 'title', type: 'string' },
                { name: 'content', type: 'string' },
            ],
        };
    }

    abstract getTitle(): string;

    getSignMessage(pureMessage: string) {
        return {
            title: this.getTitle(),
            content: pureMessage,
        };
    }
}
