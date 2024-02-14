// const express = require('express')
// const bodyParser = require('body-parser')
// const app = express()
// const path = require('path')
// app.use(bodyParser.json())

// // main url
// app.get('/', function(request, response) {
//     // console.log(request)
//     // response.send('hello')
//     const data = {
//         "name" : "shri",
//         "role" : "trainer"
//     }
//     // response.json(data)
//     response.status(200).json(data)
// })

// app.get('/java', function(request, response) {
//     response.send('java')
// })

// // Sending html file as response
// app.get('/login', function(request, response) {
//     response.sendFile(path.join(__dirname, '/src/login.html'))
//     // console.log(__dirname)
// })

// // sending html file as response
// app.get('/signup', function(request, response) {
//     response.sendFile(path.join(__dirname, '/src/signup.html'))
// })

// app.post('/validate-user', function(request, response) {
//     // console.log(request.body)
//     if(request.body.username === 'shri' && request.body.password === '1234') {
//         response.json({
//             "validity" : "Valid user"
//         })
//     } else {
//         response.json({
//             "validity" : "Invalid user"
//         })
//     }
// })

// app.listen(8000)

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {ObjectId} = require('mongodb')
// Importing required functions from dbConnection.cjs
const {connectToDb, getDb} = require('./dbConnection.cjs')

const app = express()
app.use(cors())
app.use(bodyParser.json())

let db
connectToDb(function(error) {
    if(error) {
        console.log('Could not establish connection...')
        console.log(error)
    } else { // if no error in establishing connection
        //process.env.PORT : cloudservice
        // 8000 : local machine
        const port = process.env.PORT || 8000
        app.listen(port)
        db = getDb()
        console.log(`running in the port  ${8000}`)
    }
})

/**
 * Expense Tracker
 * Functionalities : adding entry, getting the summaries of previous entries, editing and deleting
 * Input fields : Category, Amount, Date
 * 
 * CRUD : Create, Read, Update and Delete
 * 
 * get-entries / get-data - GET
 * add-entry - POST
 * edit-entry - PATCH
 * delete-entry - DELETE
 */

app.post('/add-entry', function(request, response) {
    db.collection('ExpensesData').insertOne(request.body).then(function() {
        response.status(201).json({
            "status" : "Entry added successfully"
        })
    }).catch(function () {
        response.status(500).json({
            "status" : "Entry not added"
        })
    })
})

app.get('/get-entries', function(request, response) {
    // Declaring an empty array
    const entries = []
    db.collection('ExpensesData')
    .find()
    .forEach(entry => entries.push(entry))
    .then(function() {
        response.status(200).json(entries)
    }).catch(function() {
        response.status(500).json({
            "status" : "Could not fetch documents"
        })
    })
})

app.delete('/delete-entry', function(request, response) {
    if(ObjectId.isValid(request.query.id)) {
        db.collection('ExpensesData').deleteOne({
            _id : new ObjectId(request.query.id)
        }).then(function() {
            response.status(200).json({
                "status" : "Entry successfully deleted"
            })
        }).catch(function() {
            response.status(500).json({
                "status" : "Entry not deleted"
            })
        })
    } else {
        response.status(500).json({
            "status" : "ObjectId not valid"
        })
    }
})

app.patch('/update-entry/:id', function(request, response) {
    if(ObjectId.isValid(request.params.id)) {
        db.collection('ExpensesData').updateOne(
            { _id : new ObjectId(request.params.id) }, // identifier : selecting the document which we are going to update
            { $set : request.body } // The data to be updated
        ).then(function() {
            response.status(200).json({
                "status" : "Entry updated successfully"
            })
        }).catch(function() {
            response.status(500).json({
                "status" : "Unsuccessful on updating the entry"
            })
        })
    } else {
        response.status(500).json({
            "status" : "ObjectId not valid"
        })
    }
})
