import { Link } from 'react-router-dom'

function Sidebar() {
  return (
    <aside>
      <h2>Clube do Achado</h2>

      <nav>
        <Link to="/">Dashboard</Link>
        <Link to="/produtos">Produtos</Link>
        <Link to="/analisar">Analisar Produto</Link>
        <Link to="/ranking">Ranking</Link>
        <Link to="/desempenho">Desempenho</Link>
      </nav>
    </aside>
  )
}

export default Sidebar