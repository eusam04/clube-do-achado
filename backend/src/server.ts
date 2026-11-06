import express from 'express'
import 'dotenv/config'
import { connectToDatabase } from './config/database.js'
import produtoRoutes from './routes/produtoRoutes.js'

const app = express()

app.use(express.json())
app.use('/api/produtos', produtoRoutes)
app.get('/api', (req, res) => {
  res.json({
    mensagem: 'API do Clube do Achado funcionando!'
  })
})

async function startServer() {
  try {
    await connectToDatabase()

    const PORT = Number(process.env.PORT) || 3000

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error)
    process.exit(1)
  }
}

startServer()
