import express from 'express'
import userController from './user.controller.js'

const router = express.Router({ caseSensitive: true })

router.post('/save/token', userController.saveToken)
router.get('/dashboard/analytics', userController.getDashboardAnalytics)
router.delete('/delete/user', userController.removeUser)

export default router