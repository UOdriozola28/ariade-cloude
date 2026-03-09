import { createContext, useContext, useState } from "react";

interface Props {
  children: React.ReactNode
}

const ViewModeContext = createContext({
  viewMode: 'grid',
  handleChangeViewMode: () => { }
})

export const ViewModeProvider = ({ children }: Props) => {

  const [viewMode, setViewMode] = useState('grid')

  const handleChangeViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid')
  }

  return (
    <ViewModeContext.Provider value={{
      viewMode,
      handleChangeViewMode
    }}>
      {children}
    </ViewModeContext.Provider>
  )

}

export const useViewMode = () => useContext(ViewModeContext)