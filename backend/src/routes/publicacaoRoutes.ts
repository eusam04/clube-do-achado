import { Router } from 'express'
import { ObjectId } from 'mongodb'
import { getDatabase } from '../config/database.js'

const router = Router()

type Plataforma = 'pinterest' | 'shopee_videos'
type StatusPublicacao = 'rascunho' | 'publicada'

interface Publicacao {
    produtoId: ObjectId
    plataforma: Plataforma
    linkAfiliado: string
    linkPublicacao?: string
    dataPublicacao?: Date
    status: StatusPublicacao
    createdAt: Date
    updatedAt: Date
}

// GET: listar todas as publicações
router.get('/', async (_req, res) => {
    try {
        const database = getDatabase()

        const publicacoes = await database
            .collection<Publicacao>('publicacoes')
            .find({})
            .toArray()

        return res.json(publicacoes)
    } catch (error) {
        console.error('Erro ao consultar publicações:', error)

        return res.status(500).json({
            mensagem: 'Erro ao consultar as publicações.'
        })
    }
})

// POST: cadastrar uma nova publicação
router.post('/', async (req, res) => {
    try {
        const {
            produtoId,
            plataforma,
            linkAfiliado,
            linkPublicacao,
            dataPublicacao,
            status
        } = req.body

        // Validar campos obrigatórios
        if (
            !produtoId ||
            !plataforma ||
            !linkAfiliado?.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Preencha os campos obrigatórios.'
            })
        }

        // Validar o ID do produto
        if (!ObjectId.isValid(produtoId)) {
            return res.status(400).json({
                mensagem: 'ID do produto inválido.'
            })
        }

        // Validar a plataforma
        const plataformasPermitidas: Plataforma[] = [
            'pinterest',
            'shopee_videos'
        ]

        if (!plataformasPermitidas.includes(plataforma)) {
            return res.status(400).json({
                mensagem: 'Plataforma inválida.'
            })
        }

        // Validar o status
        const statusPermitidos: StatusPublicacao[] = [
            'rascunho',
            'publicada'
        ]

        if (status && !statusPermitidos.includes(status)) {
            return res.status(400).json({
                mensagem: 'Status inválido.'
            })
        }

        // Validar os links
        try {
            const urlAfiliado = new URL(linkAfiliado.trim())

            if (
                urlAfiliado.protocol !== 'http:' &&
                urlAfiliado.protocol !== 'https:'
            ) {
                throw new Error()
            }

            if (linkPublicacao?.trim()) {
                const urlPublicacao = new URL(linkPublicacao.trim())

                if (
                    urlPublicacao.protocol !== 'http:' &&
                    urlPublicacao.protocol !== 'https:'
                ) {
                    throw new Error()
                }
            }
        } catch {
            return res.status(400).json({
                mensagem: 'Informe links válidos.'
            })
        }

        // Validar a data, quando informada
        let dataFormatada: Date | undefined

        if (dataPublicacao) {
            dataFormatada = new Date(dataPublicacao)

            if (Number.isNaN(dataFormatada.getTime())) {
                return res.status(400).json({
                    mensagem: 'Informe uma data válida.'
                })
            }
        }

        const database = getDatabase()

        // Verificar se o produto existe
        const idConvertido = new ObjectId(produtoId)

        const produtoExiste = await database
            .collection('produtos')
            .findOne({ _id: idConvertido })

        if (!produtoExiste) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            })
        }

        // Montar a publicação
        const novaPublicacao: Publicacao = {
            produtoId: idConvertido,
            plataforma,
            linkAfiliado: linkAfiliado.trim(),
            ...(linkPublicacao?.trim() && {
                linkPublicacao: linkPublicacao.trim()
            }),
            ...(dataFormatada && {
                dataPublicacao: dataFormatada
            }),
            status: status || 'rascunho',
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Salvar no MongoDB
        const resultado = await database
            .collection<Publicacao>('publicacoes')
            .insertOne(novaPublicacao)

        return res.status(201).json({
            mensagem: 'Publicação cadastrada com sucesso!',
            publicacao: {
                ...novaPublicacao,
                _id: resultado.insertedId
            }
        })
    } catch (error) {
        console.error('Erro ao cadastrar publicação:', error)

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar a publicação.'
        })
    }
})

export default router
