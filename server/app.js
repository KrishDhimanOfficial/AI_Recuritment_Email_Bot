import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import { globalErrorHandler } from './utils/helper.utils.js'
import compression from 'compression'
import helmet from 'helmet'
import cors from 'cors'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import config from './config/config.js'
import jobrequirmentsRoutes from './services/jobs/job.routes.js'
import userRoutes from './services/user/user.route.js'
import emailRoutes from './services/gmail/gmail.routes.js'
import candidateRoutes from './services/candidates/candidate.routes.js'
import { csrfMiddleware } from './middleware/csrf.middleware.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

app.use(cors({
  origin: config.client_origin,
  allowedHeaders: ["Content-Type", "Authorization", "x-xsrf-token", "x-csrf-token"],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
}))
app.use(helmet({}))
app.use(logger('dev'))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression(
  {
    level: 4, // compression level
    threshold: 0, // Compress all
    memLevel: 9, // memory usuage
    filter: (req, res) => compression.filter(req, res)
  }
))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(csrfMiddleware)

app.use('/api', jobrequirmentsRoutes)
app.use('/api', userRoutes)
app.use('/api/candidate', candidateRoutes)
app.use('/gmail', emailRoutes)

// error handler
app.use(globalErrorHandler)

export default app
