interface HeaderProps {
  titulo: string
}

function Header({ titulo }: HeaderProps) {
  return (
    <header>
      <h1>{titulo}</h1>
    </header>
  )
}

export default Header