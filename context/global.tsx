import { createContext } from 'react';
import { CreateToastFnReturn } from '@chakra-ui/react';

interface IGlobalContext {
    toast?: CreateToastFnReturn;
}
export const GlobalContext = createContext<IGlobalContext>({});
