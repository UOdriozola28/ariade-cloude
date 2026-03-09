import { createContext, useContext, useState } from "react";

interface Props { children: React.ReactNode }

const SidebarContext = createContext({
  sidebarOpen: false,
  handleChangeSidebarOpen: (value: boolean) => { }
})

export const SidebarProvider = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleChangeSidebarOpen = (value: boolean) => {
    setSidebarOpen(value)
  }

  return (
    <SidebarContext.Provider value={{
      sidebarOpen,
      handleChangeSidebarOpen
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)

