import express from 'express'
import candidateController from './candidate.controller.js';

const router = express.Router({ caseSensitive: true })

router.get("/candiates", candidateController.getAllCandiatesDetails);

export default router