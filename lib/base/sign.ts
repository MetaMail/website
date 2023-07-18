import { ethers } from 'ethers';
import { getAccount } from '@wagmi/core';
import { ExternalProvider } from '@ethersproject/providers';
import { userSessionStorage } from 'lib/utils';

import { MMObject } from './object';

const getEthereum = () => window.ethereum as ExternalProvider;

export abstract class MMSign extends MMObject {
    private _address: string;
    private _signMethod = 'eth_signTypedData';
    private _domain = { name: 'MetaMail', version: '1.0.0' };
    private _lastSignMessages: any;

    get signMethod() {
        return this._signMethod;
    }

    get domain() {
        return this._domain;
    }

    get address() {
        if (!this._address) {
            this._address = userSessionStorage.getUserInfo()?.address || getAccount().address?.toLowerCase() || '';
        }
        return this._address;
    }

    getLastSignData() {
        return {
            signMethod: this.signMethod,
            domain: this.domain,
            signTypes: this.getSignTypes(),
            signMessages: this._lastSignMessages,
        };
    }

    abstract getSignTypes(): Record<string, { name: string; type: string }[]>;

    async doSign(signMessages: any) {
        const ethereum = getEthereum();
        if (!ethereum) throw new Error('Your client does not support Ethereum');
        if (!this.address) throw new Error('No address provided');

        const signTypes = this.getSignTypes();

        if (this._signMethod !== this.signMethod) {
            throw new Error('Unsupported sign method');
        }

        const walletProvider = new ethers.providers.Web3Provider(ethereum);
        const signer = walletProvider.getSigner();

        const signature = await signer._signTypedData(this.domain, signTypes, signMessages);
        const expectedSignerAddress = this.address;
        const recoveredAddress = ethers.utils.verifyTypedData(this.domain, signTypes, signMessages, signature);
        const verified = recoveredAddress.toLowerCase() === expectedSignerAddress;
        if (!verified)
            throw new Error(`Signature verification failed.
                        recoveredAddress: ${recoveredAddress},
                        expectedSignerAddress: ${expectedSignerAddress}`);
        this._lastSignMessages = signMessages;
        return signature;
    }
}
