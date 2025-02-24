const express = require("express")
const cors = require("cors")
const morgan = require("morgan");
const app = express()

app.use(cors());

app.use((req,res,next) => {
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZoneName: 'longGeneric' 
});
    req.requestTime = formattedDate;
    next()
})

app.use(express.json())

morgan.token('data', (req) => JSON.stringify(req.body))
app.use(morgan(':method :url :status  :res[content-length] - :response-time ms :data'))

let  persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
        "id": "4",
        "name": "Mary Poppendieck", 
        "number": "39-23-6423122"
      }
]

app.get('/api/persons', (request,response) => {
    response.json(persons);
})

app.get('/info',(request,response) => {
    response.send(`<p>PhoneBook has info for ${persons.length} people</p>
                   <p>${request.requestTime}</p>                                                     `)
})

app.get('/api/persons/:id', (request,response) => {
    const id  = request.params.id;
    const person = persons.find((person) => person.id === id)
    if (person){
        response.json(person)
    }
    else{
        response.status(404).end()
    }
})

app.delete('/api/persons/:id',(request,response) => {
    const id = request.params.id;
    const person = persons.find((person) => person.id === id)
    if (person){
        persons = persons.filter((person) => person.id !== id)
    }
    response.status(204).end();
})

app.post('/api/persons',(request,response) => {
    let person = request.body;
    let name = person.name;
    if (!person.name || !person.number){
        let emptyField = !person.name ? "name" : "number";
        return response.status(400).json({error: `${emptyField} is missing!`})
    }
    let alreadyExists = persons.find((person) => person.name.toLowerCase() === name.toLowerCase())
    if (alreadyExists){
        return response.status(400).json({error: `name must be unique!`})
    }
    let id = Math.floor(Math.random() * 10000);
    person.id = String(id);
    persons = persons.concat(person)
    response.json(person);
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})