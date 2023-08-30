const PurePrivateKey = 'MM_PurePrivateKey';

function getStorage(key: string) {
    return window.sessionStorage.getItem(key);
}

function setStorage(key: string, value: string) {
    window.sessionStorage.setItem(key, value);
}

function deleteStorage(key: string) {
    window.sessionStorage.removeItem(key);
}

function clearStorage() {
    window.sessionStorage.clear();
}

function doParse(data: any) {
    if (data === null || data === undefined || data === '') {
        return {};
    }
    return JSON.parse(data);
}

function doStringify(data: any) {
    if (data === null || data === undefined || data === '') {
        return '';
    }
    return JSON.stringify(data);
}

export const userSessionStorage = {
    setPurePrivateKey: (value: string) => {
        setStorage(PurePrivateKey, value);
    },

    getPurePrivateKey: (): string => {
        return getStorage(PurePrivateKey);
    },

    clearPurePrivateKey: () => {
        deleteStorage(PurePrivateKey);
    },

    clearAll: () => {
        clearStorage();
    },
};
