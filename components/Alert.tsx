import { useAlertStore } from 'lib/zustand-store';

interface IAlertProps {
    message: string;
    description: string;
}

export default function Alert(warnInfo: IAlertProps) {
    const { isAlert, setIsAlert } = useAlertStore();

    return (
        <div
            className={`transition-all duration-100 absolute top-25 right-50 alert alert-error shadow-lg w-350 h-70 p-8 ${
                isAlert ? '' : 'scale-0'
            }`}>
            <div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current flex-shrink-0 h-30 w-30"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <div>
                    <h3 className="font-bold">{warnInfo.message}</h3>
                    <div className="text-xs">{warnInfo.description}</div>
                </div>
                <div className="flex-none">
                    <button
                        className="btn btn-xs"
                        onClick={() => {
                            setIsAlert(false);
                        }}>
                        close
                    </button>
                </div>
            </div>
        </div>
    );
}
