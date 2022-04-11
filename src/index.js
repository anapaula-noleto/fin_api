const express = require("express")
const {v4: uuidv4} = require("uuid")

const app = express();

//middleware
app.use(express.json())


//criar um array que vai ser o banco de dados por hora
const customers = []

/* 
cpf: string
name: string
id: uuid
statement []
*/
app.post("/account", (req, res) => {
    const {cpf, name} = req.body
    // The some() method checks if any array elements pass a test (provided as a function).
    const customerAlreadyExists = customers.some( customer => customer.cpf === cpf)
    if(customerAlreadyExists){
        return res.status(400).json({error: "Customer already exists!"})
    }

    const customer = {
        cpf,
        name,
        id: uuidv4(),
        statement: []
    }

    customers.push(customer)
    return res.status(201).send(customer)
})

app.listen(80, () => {
    console.log('Servidor rodando na porta 80')
})