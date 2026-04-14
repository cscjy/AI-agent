import { createContext, useState } from 'react';

// 定义Context的类型
type ContextType = {
  dataChange: boolean;
  setDataChange: React.Dispatch<React.SetStateAction<boolean>>;
};
export const Context = createContext<ContextType | undefined>(undefined);

type ContextProviderProps = {
  children: React.ReactNode;
};

const ContextProvider = (props: ContextProviderProps) => {
  const [dataChange, setDataChange] = useState(false);

  const contextValue = {
    dataChange,
    setDataChange,
  };
  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
};

export default ContextProvider;
