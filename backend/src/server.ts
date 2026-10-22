
import express from 'express'

const app = express()

app.use(express.json())

app.get('/api', (req, res) => {
  res.json({
    mensagem: 'API do Clube do Achado funcionando!'
  })
})

const PORT = 3000

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})


