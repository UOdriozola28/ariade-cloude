import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { SearchProvider } from './cloud/context/SearchContext'
import { SidebarProvider } from './cloud/context/SidebarContext'
import { ViewModeProvider } from './cloud/context/ViewModeContext'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!)
  .render(
    <React.StrictMode>
      <SidebarProvider>
        <ViewModeProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </ViewModeProvider>
      </SidebarProvider>
    </React.StrictMode>
  )
