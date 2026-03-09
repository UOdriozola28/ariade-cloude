import { useContext } from "react";
import { createContext, useState } from "react";

interface Props {
  children: React.ReactNode
}

const SearchContext = createContext({
  searchQuery: '',
  handleChangeSearchQuery: (value: string) => { }
})

export const SearchProvider = ({ children }: Props) => {
  const [searchQuery, setSearchQuery] = useState('')

  const handleChangeSearchQuery = (value: string) => {
    setSearchQuery(value)
  }

  return (
    <SearchContext.Provider value={{
      searchQuery,
      handleChangeSearchQuery
    }}>
      {children}
    </SearchContext.Provider>
  )

}

export const useSearch = () => useContext(SearchContext)