const http = require('http');
const express = require('express');
const press = express();
const morgan = require('morgan');

morgan(function (tokens, request, response) {
    return [
        tokens.method(request, response), 
        tokens.url(request, response), 
        tokens.status(request, response), 
        tokens.res(request, response, 'content-length'), '-', 
        tokens['response-time'](request, response), 'ms'
    ].join(' ')
})
//I couldn't get the res[content-length] to show up.
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];

const app = http.createServer((request, response) => {  
    response.writeHead(200, { 'Content-Type': 'application/json' });  
    response.end(JSON.stringify(persons, null, "  "));
});

press.use(express.json());
press.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

press.set('json spaces', 40);

press.get('/', (request, response) => {
    response.send();
  })

press.get('/api/persons', (request, response) => {
    response.json(persons);
})

press.get('/info', (request, response) => {
    let date = new Date();
    response.json(`Phonebook has info for 4 people ` +  `${date}`);
})

press.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    const data = persons.find(data =>data.id === id);
    if (data) { response.json(data) } else { response.status(404).end()  }
  })

press.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(data => data.id !== id);

    response.status(204).end()
})

const generateId = () => {
    const maxId = persons.length > 0
      ? Math.max(...persons.map(p => p.id))
      : 0
    return maxId + 1
  }
  
  press.post('/api/persons', (request, response) => {
    let body = request.body
  
    if (!body.name) {
      return response.status(400).json({ 
        error: "Name missing" 
      })
    }
    if (!body.number) {
        return response.status(400).json({
            error: "Number missing"
        })
    }
    if (persons.some((person) => person.name === body.name)) {
        return response.status(400).json({
            error: "Name must be unique"
        })
    }
  
    const person = {
      id: generateId(),
      name: body.name,
      number: body.number,
    }
  
    persons = persons.concat(person)
  
    response.json(person)

    console.log(JSON.stringify(morgan('tiny')));
  })

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

press.use(unknownEndpoint)

const PORT = 3001
press.listen(PORT)
console.log(`Server running on port ${PORT}`);