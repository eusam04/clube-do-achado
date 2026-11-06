import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDatabase } from '../config/database.js'

const router = Router()

interface HistoricoDesempenho {
    publicacaoId: ObjectId
    visualizacoes: number
    cliques: number
    curtidas: number
    salvamentos: number
    vendas: number
    dataColeta: Date
    createdAt: Date
}

// GET: listar todos os históricos
router.get('/', async (_req, res) => {
    try {
        const database = getDatabase()

        const historicos = await database
            .collection<HistoricoDesempenho>('historicos_desempenho')
            .find({})
            .toArray()

        return res.json(historicos)
    } catch (error) {
        console.error('Erro ao consultar históricos:', error)

        return res.status(500).json({
            mensagem: 'Erro ao consultar os históricos de desempenho.'
        })
    }
})

// POST: cadastrar um novo histórico
router.post('/', async (req, res) => {
    try {
        const {
            publicacaoId,
            visualizacoes = 0,
            cliques = 0,
            curtidas = 0,
            salvamentos = 0,
            vendas = 0,
            dataColeta
        } = req.body

        // Validar o ID da publicação
        if (!publicacaoId || !ObjectId.isValid(publicacaoId)) {
            return res.status(400).json({
                mensagem: 'Informe um ID de publicação válido.'
            })
        }

        // Validar as métricas
        const metricas = {
            visualizacoes,
            cliques,
            curtidas,
            salvamentos,
            vendas
        }

        for (const [campo, valor] of Object.entries(metricas)) {
            if (
                typeof valor !== 'number' ||
                !Number.isInteger(valor) ||
                valor < 0
            ) {
                return res.status(400).json({
                    mensagem: `O campo ${campo} deve ser um número inteiro não negativo.`
                })
            }
        }

        // Validar a data da coleta, quando informada
        const dataFormatada = dataColeta
            ? new Date(dataColeta)
            : new Date()

        if (Number.isNaN(dataFormatada.getTime())) {
            return res.status(400).json({
                mensagem: 'Informe uma data de coleta válida.'
            })
        }

        const database = getDatabase()

        // Verificar se a publicação existe
        const idConvertido = new ObjectId(publicacaoId)

        const publicacaoExiste = await database
            .collection('publicacoes')
            .findOne({ _id: idConvertido })

        if (!publicacaoExiste) {
            return res.status(404).json({
                mensagem: 'Publicação não encontrada.'
            })
        }

        // Montar o histórico
        const novoHistorico: HistoricoDesempenho = {
            publicacaoId: idConvertido,
            ...metricas,
            dataColeta: dataFormatada,
            createdAt: new Date()
        }

        // Salvar no MongoDB
        const resultado = await database
            .collection<HistoricoDesempenho>('historicos_desempenho')
            .insertOne(novoHistorico)

        return res.status(201).json({
            mensagem: 'Histórico de desempenho cadastrado com sucesso!',
            historico: {
                ...novoHistorico,
                _id: resultado.insertedId
            }
        })
    } catch (error) {
        console.error('Erro ao cadastrar histórico:', error)

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar o histórico de desempenho.'
        })
    }
})

export default router
