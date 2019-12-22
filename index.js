const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')

const baseUrl = '/api/persons'
let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    }
]

app.use(bodyParser.json())

morgan.token('jsonBody', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :jsonBody'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get(baseUrl, (req, res) => {
    res.json(persons)
})

app.get(baseUrl + '/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(item => item.id === id)
    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.delete(baseUrl + '/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(item => item.id !== id)
    res.status(204).end()
})

const isNameDuplicate = name => {
    const person = persons.find(item => item.name.toLowerCase() == name.toLowerCase())
    if (person === undefined) {
        return false
    }
    return true
}
const generateId = () => {
    const max = 9999
    return Math.floor(Math.random() * Math.floor(max))
}
app.post(baseUrl, (req, res) => {
    const body = req.body
    if (!body.name) {
        return res.status(400).json({ error: 'name missing' })
    }
    if (!body.number) {
        return res.status(400).json({ error: 'number missing' })
    }
    if (isNameDuplicate(body.name)) {
        return res.status(400).json({ error: `${body.name} is already added to the phonebook` })
    }

    const item = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }
    persons = persons.concat(item)

    res.json(item)
})

app.get('/info', (req, res) => {
    const count = persons.length
    const datetime = (new Date()).toLocaleString()

    const info = `<p>There are ${count} registers in the phonebook</p><p>${datetime}</p>`
    res.send(info)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})