require('dotenv').config()
const Person = require('./models/person')
const express = require("express")
const cors = require("cors")
const morgan = require("morgan");
const app = express()

app.use(cors());
app.use(express.static('dist'))
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
    Person.find({}).then((persons) => {
        response.json(persons)
    })
})

app.get('/info',(request,response,next) => {
    Person.countDocuments({}).then((length) => {
        response.send(`<p>PhoneBook has info for ${length} people</p>
            <p>${request.requestTime}</p> `)
    })
    .catch((error) => next(error))
})

app.get('/api/persons/:id', (request,response,next) => {
    const id  = request.params.id;
    Person.findById(id).then(person => {
        response.json(person)
    })
    .catch((error) => {
        next(error)
    }) 
    // const person = persons.find((person) => person.id === id)
    // if (person){
    //     response.json(person)
    // }
    // else{
    //     response.status(404).end()
    // }
})

app.delete('/api/persons/:id',(request,response) => {
    const id = request.params.id;
    Person.findByIdAndDelete(id).then(
        (result) => {
            response.status(204).end()
        }
    ) 
    .catch((error) => {
        next(error)
    }) 
    // const person = persons.find((person) => person.id === id)
    // if (person){
    //     persons = persons.filter((person) => person.id !== id)
    // }
})

app.post('/api/persons',(request,response,next) => {
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
    // let id = Math.floor(Math.random() * 10000);
    // person.id = String(id);
    // persons = persons.concat(person)
    const personObj = new Person({
        name: person.name,
        number: person.number
    })
    personObj.save().then(result => {
        response.json(result);
    })
    .catch((error) => next(error))
})


app.put('/api/persons/:id',(request,response,next) => {
    const id = request.params.id;
    const newPerson = {
        name: request.body.name,
        number: request.body.number
    }

    Person.findByIdAndUpdate(id, newPerson, {new : true,runValidators : true, context : 'query'}).then((updatedPerson) => {
        response.json(updatedPerson)
    })
    .catch((error) => {
        next(error)
    })
})
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
 app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name ==  'CastError'){
        return response.status(400).send({error: 'Malformatted id'})        
    }
    else if (error.name == 'ValidationError'){
        return response.status(400).json({error: error.message})
    }
    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})