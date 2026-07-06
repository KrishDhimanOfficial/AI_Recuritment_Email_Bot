import express from 'express'
import jobController from './job.controller.js'
const router = express.Router({ caseSensitive: true })

router.post(
    '/create/job/requirments',
    jobController.createJobRequirement
)

router.get(
    '/get/all/jobs/requirment',
    jobController.getJobsRequirement
)

router.get(
    '/get/job/requirment',
    jobController.getJobById
)

router.put(
    '/edit/job/requirment',
    jobController.editJobRequirment
)

router.delete(
    '/delete/job/requirment',
    jobController.deleteJobRequirment
)

export default router