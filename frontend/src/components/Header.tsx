import { useLocation } from 'react-router-dom'

function Header() {
  const location = useLocation()

  const titulos: Record<string, string> = {
    '/': 'Dashboard',
    '/produtos': 'Produtos',
    '/analisar': 'Analisar Produto',
    '/ranking': 'Ranking',
    '/desempenho': 'Desempenho',
  }

  const titulo = titulos[location.pathname]

  return (
    <header>
      <h1>{titulo}</h1>
    </header>
  )
}

export default Header