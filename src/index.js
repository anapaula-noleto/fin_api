const { response } = require("express");
const express = require("express")
const {v4: uuidv4} = require("uuid")

const app = express();

//middleware
app.use(express.json())


//criar um array que vai ser o banco de dados por hora
const customers = []

//Middleware: uma função que fica entre o request e o response
    // usado para fazer a validação de um token
    // autenticação e validações
function verifyIfExistsCPF(req, res, next){
    // se o next não acontecer significa que não passou nas condições do middleware
    const { cpf } = req.headers;
    const customer = customers.find(client => client.cpf == cpf)
    if(!customer){
        res.status(400).json({error: "Customer not found"})
    }

    //passando a constante customer para que as rotas possam usá-la
    req.customer = customer;
    return next();
}

//app.use(verifyIfExistsCPF) -> serve para aplicar esse middleware em todas as rotas

//criar conta e verificar se cliente já existe ou não
app.post("/account", (req, res) => {
    const {cpf, name} = req.body
    // The some() method checks if any array elements pass a test (provided as a function).
    const customerAlreadyExists = customers.some( customer => customer.cpf === cpf)
    if(customerAlreadyExists){
        return res.status(400).json({error: "Customer already exists!"})
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    })
    //console.log(customers)
    return res.status(201).send()
})

//buscar o extrato bancário do cliente
app.get("/statement",verifyIfExistsCPF, (req, res) => {
    // recuperando o costumer do middleware
    console.log(req)
    const { customer } = req;
    return res.json(customer.statement)
})


app.listen(80, () => {
    console.log('Servidor rodando na porta 80')
})