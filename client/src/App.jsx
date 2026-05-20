import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HostApp from './host/HostApp'
import DisplayApp from './display/DisplayApp'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/host" element={<HostApp />} />
        <Route path="/game" element={<DisplayApp />} />
        <Route path="*" element={<Navigate to="/host" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
