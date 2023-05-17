import useStore from 'storage/zustand';

interface IAlertProps {
  message: string;
  description: string;
}

export default function Alert(warnInfo: IAlertProps) {
  const isAlert = useStore((state: any) => state.isAlert);
  const setAlertClose = useStore((state: any) => state.setAlertClose);
  console.log(isAlert);
  return (
    <div
      className={
        isAlert
          ? 'transition-all duration-100 absolute top-25 right-50 alert alert-error shadow-lg w-350 h-70 p-8'
          : 'transition-all scale-0 duration-100 absolute top-25 right-50 alert alert-error shadow-lg w-350 h-70 p-8'
      }>
      <div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current flex-shrink-0 h-30 w-30"
          fill="none"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
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
              setAlertClose();
            }}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}
