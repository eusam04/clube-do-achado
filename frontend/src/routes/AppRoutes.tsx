import { Routes, Route } from 'react-router-dom'

import Dashboard from '../pages/Dashboard'
import Produtos from '../pages/Produtos'
import AnalisarProduto from '../pages/AnalisarProduto'
import Ranking from '../pages/Ranking'
import Desempenho from '../pages/Desempenho'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/produtos" element={<Produtos />} />
      <Route path="/analisar" element={<AnalisarProduto />} />
      <Route path="/ranking" element={<Ranking />} />
      <Route path="/desempenho" element={<Desempenho />} />
    </Routes>
  )
}

export default AppRoutes