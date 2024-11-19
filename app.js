import express from "express"
import session from 'express-session'
import path from "path"
import dotenv from 'dotenv'
import bodyParser from "body-parser"
import { fileURLToPath } from "url"
import authRoutes from './routes/auth.js'
import announceRoutes from './routes/announcment.js'
import categoryRoutes from './routes/category.js'
import userRouter from './routes/user.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({
    path: path.join(__dirname, '.env')
})

const app = express()
const PORT = process.env.EXPRESS_PORT
const SECRET_KEY = process.env.SECRET_KEY

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(session({
    secret: SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 600000 } // Сессия на 10 минут
}))

app.use(express.static(path.join(__dirname, 'static')));

app.use('/', authRoutes)
app.use('/', announceRoutes)
app.use('/', categoryRoutes)
app.use('/', userRouter)

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`)
})
