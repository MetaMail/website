import { createContext } from 'react';

interface IGlobalContext {}
export const GlobalContext = createContext<IGlobalContext>({});
