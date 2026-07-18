import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { store } from './store'
import { AdminSocketProvider } from './socket/AdminSocketProvider'

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <AdminSocketProvider>
        {children}
      </AdminSocketProvider>
    </Provider>
  )
}
