const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGO_URL

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDb')
  })
  .catch(error => {
    console.log('Error on MongoDb Connection', error.message)

  })

const PersonSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minLength: 3
    },
    number: {
      type : String,
      minLength: 8,
      validate: {
        validator: function (value){
          return /\d{2,3}-\d{6,}/.test(value)
        },
        message: (props) => {
          return `${props.value} is not a valid Phone number`
        },
      },
    }
  }
)

PersonSchema.set('toJSON', {
  transform : (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v

  }
})

module.exports = mongoose.model('Person',PersonSchema)