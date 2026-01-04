import { Routes, Route } from 'react-router-dom'
import EntrenadoresList from './EntrenadoresList'

const EntrenadoresPage = () => {
  return (
    <Routes>
      <Route index element={<EntrenadoresList />} />
    </Routes>
  )
}

export default EntrenadoresPage
