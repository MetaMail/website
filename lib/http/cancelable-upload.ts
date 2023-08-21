import axios, { AxiosProgressEvent, CancelTokenSource } from 'axios';
import { MMHttp } from '../base';

let beginId = 0;

export class MMCancelableUpload extends MMHttp {
    private _cancelTokenSource: CancelTokenSource;
    private _id: number;
    private _waitCompletePromise: Promise<any>;
    onUploadProgressChange: (progressEvent: AxiosProgressEvent) => void;

    set onUploadProgressChangeHandler(handler: (progressEvent: AxiosProgressEvent) => void) {
        this.onUploadProgressChange = handler;
    }

    get id() {
        if (!this._id) {
            this._id = ++beginId;
        }
        return this._id;
    }

    upload<T>(url: string, data: FormData) {
        this._cancelTokenSource = axios.CancelToken.source();
        this._waitCompletePromise = this.post<FormData, T>(url, data, {
            timeout: 60000,
            onUploadProgress: this.onUploadProgressChange,
            cancelToken: this._cancelTokenSource.token,
        }).catch(error => {
            if (axios.isCancel(error)) {
                console.error('Request canceled', error.message);
            } else {
                throw error;
            }
        });
    }

    cancel() {
        this._cancelTokenSource.cancel('canceled by user');
    }

    waitComplete<T>(): Promise<T> {
        return this._waitCompletePromise;
    }
}
