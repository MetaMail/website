import ReactGA from 'react-ga';
declare global {
  interface Window {
    GA_INITIALIZED: boolean;
  }
}

export const initGA = () => {
    ReactGA.initialize('G-QMHT4QP6TP'); // 替换为您的跟踪 ID
};

export const logPageView = () => {
    ReactGA.set({ page: window.location.pathname });
    ReactGA.pageview(window.location.pathname);
};
