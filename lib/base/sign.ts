import { ethers } from 'ethers';
import { getAccount } from '@wagmi/core';
import { ExternalProvider } from '@ethersproject/providers';
import { userLocalStorage } from 'lib/utils';

const getEthereum = () => window.ethereum as ExternalProvider;

export abstract class MMSign {
  private _address: string;
  private _signMethod = 'eth_signTypedData';
  private _domain = { name: 'MetaMail', version: '1.0.0' };

  get signMethod() {
    return this._signMethod;
  }

  get domain() {
    return this._domain;
  }

  get address() {
    if (!this._address) {
      this._address = userLocalStorage.getUserInfo()?.address || getAccount().address?.toLowerCase() || '';
    }
    return this._address;
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

    // console.log('this.domain: ', this.domain);
    // console.log('signTypes: ', signTypes);
    // console.log('signMessages: ', signMessages);

    const signature = await signer._signTypedData(this.domain, signTypes, signMessages);
    const expectedSignerAddress = this.address;
    const recoveredAddress = ethers.utils.verifyTypedData(this.domain, signTypes, signMessages, signature);
    const verified = recoveredAddress.toLowerCase() === expectedSignerAddress;
    if (!verified)
      throw new Error(`Signature verification failed.
                        recoveredAddress: ${recoveredAddress},
                        expectedSignerAddress: ${expectedSignerAddress}`);
    return signature;
  }
}
