import { Router } from 'express'
import { getDatabase } from '../config/database.js'

const router = Router()

interface Produto {
    nome: string
    categoria: string
    preco: number
    comissaoPercentual: number
    comissaoEstimada: number
    linkOriginal: string
    linkOriginalNormalizado: string
    linkAfiliado: string
    imagemUrl?: string
    descricao?: string
    createdAt: Date
    updatedAt: Date
}

// Normaliza o link para ajudar a identificar produtos repetidos.
function normalizarLink(link: string): string {
    const url = new URL(link.trim())

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new Error('O link precisa utilizar HTTP ou HTTPS.')
    }

    url.hash = ''
    url.search = ''
    url.hostname = url.hostname.toLowerCase()
    url.pathname = url.pathname.replace(/\/+$/, '')

    return url.toString().replace(/\/$/, '')
}

// GET: listar todos os produtos
router.get('/', async (_req, res) => {
    try {
        const database = getDatabase()

        const produtos = await database
            .collection<Produto>('produtos')
            .find({})
            .toArray()

        res.json(produtos)
    } catch (error) {
        console.error('Erro ao consultar produtos:', error)

        res.status(500).json({
            mensagem: 'Erro ao consultar os produtos.'
        })
    }
})

// POST: cadastrar um novo produto
router.post('/', async (req, res) => {
    try {
        const {
            nome,
            categoria,
            preco,
            comissaoPercentual,
            linkOriginal,
            linkAfiliado,
            imagemUrl,
            descricao
        } = req.body

        // Validação dos campos obrigatórios
        if (
            !nome?.trim() ||
            !categoria?.trim() ||
            !linkOriginal?.trim() ||
            !linkAfiliado?.trim()
        ) {
            return res.status(400).json({
                mensagem: 'Preencha todos os campos obrigatórios.'
            })
        }

        // Validação dos valores numéricos
        if (
            typeof preco !== 'number' ||
            !Number.isFinite(preco) ||
            preco <= 0
        ) {
            return res.status(400).json({
                mensagem: 'Informe um preço válido.'
            })
        }

        if (
            typeof comissaoPercentual !== 'number' ||
            !Number.isFinite(comissaoPercentual) ||
            comissaoPercentual < 0 ||
            comissaoPercentual > 100
        ) {
            return res.status(400).json({
                mensagem: 'Informe uma comissão entre 0 e 100%.'
            })
        }

        // Validar e normalizar os links
        let linkOriginalNormalizado: string

        try {
            linkOriginalNormalizado = normalizarLink(linkOriginal)

            const urlAfiliado = new URL(linkAfiliado.trim())

            if (
                urlAfiliado.protocol !== 'http:' &&
                urlAfiliado.protocol !== 'https:'
            ) {
                throw new Error('Link de afiliado inválido.')
            }
        } catch {
            return res.status(400).json({
                mensagem: 'Informe links válidos utilizando HTTP ou HTTPS.'
            })
        }

        const database = getDatabase()
        const colecao = database.collection<Produto>('produtos')

        // Verificar se o produto já existe
        const produtoExistente = await colecao.findOne({
            linkOriginalNormalizado
        })

        if (produtoExistente) {
            return res.status(409).json({
                mensagem: 'Este produto já está cadastrado.'
            })
        }

        // Calcular a comissão estimada
        const comissaoEstimada = Number(
            ((preco * comissaoPercentual) / 100).toFixed(2)
        )

        // Montar o objeto do produto
        const novoProduto: Produto = {
            nome: nome.trim(),
            categoria: categoria.trim(),
            preco,
            comissaoPercentual,
            comissaoEstimada,
            linkOriginal: linkOriginal.trim(),
            linkOriginalNormalizado,
            linkAfiliado: linkAfiliado.trim(),
            ...(imagemUrl?.trim() && { imagemUrl: imagemUrl.trim() }),
            ...(descricao?.trim() && { descricao: descricao.trim() }),
            createdAt: new Date(),
            updatedAt: new Date()
        }

        // Salvar no MongoDB
        const resultado = await colecao.insertOne(novoProduto)

        return res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso!',
            produto: {
                ...novoProduto,
                _id: resultado.insertedId
            }
        })
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error)

        return res.status(500).json({
            mensagem: 'Erro ao cadastrar o produto.'
        })
    }
})

export default router
