import { MMSessionStorage } from 'lib/base';

const UserInfoStoreKey = 'MetaMailUserInfo';
const ShowNameKey = 'MetaMailShowName';
const RandomBitsKey = 'MetaMailRandomBits';

interface IUserInfo {
    publicKey?: string;
    ensName?: string;
    address?: string;
    privateKey?: string;
    salt?: string;
}

interface IAllUserInfo extends IUserInfo {
    showName?: string;
}

class MMUserSessionStorage extends MMSessionStorage {
    constructor() {
        super('user');
    }

    saveUserInfo(value: IUserInfo) {
        this.updateStorage(UserInfoStoreKey, {
            ...this.getStorage(UserInfoStoreKey),
            ...value,
        });

        const { ensName, address } = value;
        this.updateStorage(ShowNameKey, ensName ?? address);
    }

    getPublicKeyFromLocal(): string {
        return this.getStorage(UserInfoStoreKey, null)?.publicKey;
    }

    getPrivateKeyFromLocal(): string {
        return this.getStorage(UserInfoStoreKey, null)?.privateKey;
    }

    getSaltFromLocal(): string {
        return this.getStorage(UserInfoStoreKey, null)?.salt;
    }

    getWalletAddress(): string {
        return this.getStorage(UserInfoStoreKey, null)?.address;
    }

    getEnsName(): string {
        return this.getStorage(UserInfoStoreKey, null)?.ensName;
    }

    getUserInfo(): IAllUserInfo {
        const basic = this.getStorage(UserInfoStoreKey, null);
        return basic
            ? {
                  ...basic,
                  showName: this.getShowName(),
              }
            : {
                  showName: this.getShowName(),
              };
    }

    clearUserInfo() {
        this.deleteStorage(UserInfoStoreKey);
    }

    getShowName(): string {
        return this.getStorage(ShowNameKey);
    }

    saveShowName(name: string) {
        this.updateStorage(ShowNameKey, name);
    }

    getRandomBits(): string {
        return this.getStorage(RandomBitsKey);
    }

    setRandomBits(name?: string) {
        this.updateStorage(RandomBitsKey, name);
    }
}

export const userSessionStorage = new MMUserSessionStorage();
