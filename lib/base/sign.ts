import { ethers } from 'ethers';
import { getAccount } from '@wagmi/core';
import { ExternalProvider } from '@ethersproject/providers';
import { userSessionStorage } from 'lib/session-storage';

import { MMObject } from './object';

const getEthereum = () => window.ethereum as ExternalProvider;

export abstract class MMSign extends MMObject {
    private _address: string;

    get address() {
        if (!this._address) {
            // Relying on methods of other subclasses is unwilling, but no better choice yet
            this._address = getAccount().address?.toLowerCase() || userSessionStorage.getUserInfo()?.address || '';
        }
        return this._address;
    }

    abstract getSignTypes(): { Message: { name: string; type: string }[] };

    abstract getSignMessage(data: any): Record<string, any>;

    async doSign(source: any) {
        const ethereum = getEthereum();
        if (!ethereum) throw new Error('Your client does not support Ethereum');
        if (!this.address) throw new Error('No address provided');

        const metamaskProvider = new ethers.providers.Web3Provider(ethereum);
        const signer = metamaskProvider.getSigner();

        const domain = { name: 'MetaMail', version: '1' };
        const types = this.getSignTypes();
        const message = this.getSignMessage(source);
        const signature = await signer._signTypedData(domain, types, message);
        const expectedSignerAddress = this.address;
        const recoveredAddress = ethers.utils.verifyTypedData(domain, types, message, signature);
        const verified = recoveredAddress.toLowerCase() === expectedSignerAddress.toLowerCase();
        if (!verified) throw new Error('Signature verification failed');

        return signature;
    }
}
