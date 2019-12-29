require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const baseUrl = '/api/persons'
// let persons = [
//     {
//         "name": "Arto Hellas",
//         "number": "040-123456",
//         "id": 1
//     },
//     {
//         "name": "Ada Lovelace",
//         "number": "39-44-5323523",
//         "id": 2
//     },
//     {
//         "name": "Dan Abramov",
//         "number": "12-43-234345",
//         "id": 3
//     },
//     {
//         "name": "Mary Poppendieck",
//         "number": "39-23-6423122",
//         "id": 4
//     }
// ]

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('jsonBody', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :jsonBody'))

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get(baseUrl, (req, res, next) => {
    Person.find({}).then(persons => {
        res.json(persons)
    })
        .catch(error => next(error))
})

app.get(`${baseUrl}/:id`, (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            person
                ? res.json(person)
                : res.status(404).end()
        })
        .catch(error => next(error))
})

app.delete(`${baseUrl}/:id`, (req, res, next) => {
    Person.findByIdAndRemove(req.params.id)
        .then(person => {
            res.json(person)
        })
        .catch(error => next(error))
})

const isNameDuplicate = name => {
    return false
    // TODO: not working because request is async
    Person.find({ name: name })
        .then(person => {
            console.log(person)
            return true
        })
        .catch(error => {
            console.log(error)
            return false
        })
}
app.post(baseUrl, (req, res, next) => {
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

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save()
        .then(savedEntry => {
            res.json(savedEntry)
        })
        .catch(error => next(error))
})

app.put(`${baseUrl}/:id`, (req, res, next) => {
    const body = req.body

    const person = {
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson.toJSON())
        })
        .catch(error => next(error))
})

app.get('/info', (req, res, next) => {
    Person.find({})
        .then(persons => {
            const count = persons.length
            const datetime = (new Date()).toLocaleString()

            const info = `<p>There are ${count} registers in the phonebook</p><p>${datetime}</p>`
            res.send(info)
        })
        .catch(error => next(error))
})

const unknownEndpoint = (req, res) => {
    console.log('unknown endpoint')
    res.status(404).json({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
    console.log(error.message)

    if (error.name === 'CastError' && error.kind === 'ObjectId') {
        return res.status(400).send({ error: 'malformatted id' })
    }

    next(error)
}
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})