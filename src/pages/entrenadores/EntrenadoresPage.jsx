import { Routes, Route } from 'react-router-dom'
import EntrenadoresList from './EntrenadoresList'
import EntrenadorForm from './EntrenadorForm'

const EntrenadoresPage = () => {
  return (
    <Routes>
      <Route index element={<EntrenadoresList />} />
      <Route path="nuevo" element={<EntrenadorForm />} />
      <Route path=":id/editar" element={<EntrenadorForm />} />
    </Routes>
  )
}

export default EntrenadoresPage
