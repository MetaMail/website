import { ethers } from 'ethers';
import { getAccount } from '@wagmi/core';
import { ExternalProvider } from '@ethersproject/providers';
import { userSessionStorage } from 'lib/utils';

import { MMObject } from './object';

const getEthereum = () => window.ethereum as ExternalProvider;

export abstract class MMSign extends MMObject {
    private _address: string;

    get address() {
        if (!this._address) {
            this._address = getAccount().address?.toLowerCase() || userSessionStorage.getUserInfo()?.address || '';
        }
        return this._address;
    }

    abstract getSignTypes(): { Message: { name: string; type: string }[] };

    abstract getSignMessage(data: any): Record<string, any>;

    async doSign(signData: any) {
        const ethereum = getEthereum();
        if (!ethereum) throw new Error('Your client does not support Ethereum');
        if (!this.address) throw new Error('No address provided');

        if (signData.signMethod !== 'eth_signTypedData') {
            throw new Error('Unsupported sign method');
        }

        const walletProvider = new ethers.providers.Web3Provider(ethereum);
        const signer = walletProvider.getSigner();

        console.log('Sign Method:', signData.signMethod);
        console.log('Domain:', signData.domain);
        console.log('Sign Types:', signData.signTypes);
        console.log('Sign Messages:', signData.signMessages);

        const signature = await signer._signTypedData(signData.domain, signData.signTypes, signData.signMessages);
        const expectedSignerAddress = this.address;
        const recoveredAddress = ethers.utils.verifyTypedData(
            signData.domain,
            signData.signTypes,
            signData.signMessages,
            signature
        );
        const verified = recoveredAddress.toLowerCase() === expectedSignerAddress;
        if (!verified)
            throw new Error(`Signature verification failed.
                        recoveredAddress: ${recoveredAddress},
                        expectedSignerAddress: ${expectedSignerAddress}`);

        return signature;
    }
}
