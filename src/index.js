const { response } = require("express");
const express = require("express");
const { get } = require("express/lib/response");
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

// função de obter o saldo
function getBalance(statement){
    const balance = statement.reduce( (acc, operation) => {
        if(operation.type === 'deposit'){
            return acc + operation.amount
        }else {
            return acc - operation.amount;
        }
    }, 0)
    return balance
}

//app.use(verifyIfExistsCPF) -> serve para aplicar esse middleware em todas as rotas

//rota para criar conta e verificar se cliente já existe ou não
app.post("/account", (req, res) => {
    const {cpf, name, email} = req.body
    // The some() method checks if any array elements pass a test (provided as a function).
    const customerAlreadyExists = customers.some( customer => customer.cpf === cpf)
    if(customerAlreadyExists){
        return res.status(400).json({error: "Customer already exists!"})
    }

    customers.push({
        cpf,
        name,
        email,
        id: uuidv4(),
        statement: [],
    })
    //console.log(customers)
    return res.status(201).send()
})

//rota para buscar o extrato bancário do cliente
app.get("/statement",verifyIfExistsCPF, (req, res) => {
    // recuperando o costumer do middleware
    const { customer } = req;
    return res.json(customer.statement)
})

//rota para realizar um depósito
app.post("/deposit", verifyIfExistsCPF, (req, res) => {
    const {description, amount} = req.body;
    const {customer} = req

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "deposit",
    }
    customer.statement.push(statementOperation)
    return res.status(201).send()
})

app.post("/withdraw", verifyIfExistsCPF, (req, res) => {
    const {amount} = req.body
    const {customer} = req

    const balance = getBalance(customer.statement);

    if(amount > balance){
        return res.status(400).json({error: 'Insufficient funds!'})
    }
    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "withdraw",
    }
    customer.statement.push(statementOperation)
    return res.status(201).send()

})

app.get("/statement/date", verifyIfExistsCPF, (req, res) => {
    const { customer } = req
    const { date } = req.query

    //por estar apenas interessado na data e não na hora tudo está sendo normalizado para 00:00
    const dateFormat = new Date(date + " 00:00")

    const statement = customer.statement.filter( statement => 
    statement.created_at.toDateString() === 
    dateFormat.toDateString()
    )
    return res.json(statement)
})
// método para atualizar o e-mail do usuário
app.put("/account", verifyIfExistsCPF,(req, res) => {
    const {email} = req.body
    const {customer} = req

    customer.email = email
    return res.status(201).send()
})

app.get("/account", verifyIfExistsCPF, (req, res) => {
    const {customer} = req
    return res.json(customer)
})

app.delete("/account", verifyIfExistsCPF, (req, res) => {
    const {customer} = req
    //  usando splice para deletar um customer da lista de customers
    customers.splice(customer, 1)

    return res.status(200).json(customers)
})

app.get("/balance", verifyIfExistsCPF, (req, res) => {
    const {customer} = req
    const balance = getBalance(customer.statement)
    return res.json(balance)
})

app.listen(80, () => {
    console.log('Servidor rodando na porta 80')
})