import express from 'express'
import gmailController from './gmail.controller.js'

const router = express.Router({ caseSensitive: true })

router.get("/resume/:messageId", gmailController.getAttachment);
router.patch('/send/specific/email', gmailController.sendSpecificEmail)

export default router