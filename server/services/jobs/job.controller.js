import { ApiError, asyncHandler } from '../../utils/helper.utils.js'
import Job from './job.model.js';

export default {
    createJobRequirement: asyncHandler(async (req, res) => {
        const { title, technology, experienceRequired, openings, internship, active } = req.body;

        if (!title || !technology || !experienceRequired || !openings) {
            throw ApiError('All fields are required', 400);
        }

        const IsExist = await Job.findOne({ where: { title } })
        if (IsExist) throw ApiError(`Job already exists with title "${title}"`, 409)

        const response = await Job.create({
            id: Date.now().toString(),
            title,
            technology,
            experienceRequired,
            openings,
            internship,
            active,
            applicants: 0
        });

        if (!response) throw ApiError('Failed to create job', 400)

        return res.status(200).json({
            success: true,
            message: 'Job created successfully'
        });

    }, 'createJobRequirement'),

    getJobsRequirement: asyncHandler(async (req, res) => {
        const page = parseInt(req.query?.page) || 1;
        const limit = parseInt(req.query?.limit) || 20;
        const offset = (page - 1) * limit;

        const { count, rows: jobs } = await Job.findAndCountAll({
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            raw: true
        });

        return res.status(200).json({
            success: true,
            data: jobs,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                limit
            }
        });
    }, 'getJobRequirement'),

    getJobById: asyncHandler(async (req, res) => {
        const { id } = req.query;

        if (!id) throw ApiError('Job ID is required', 400);

        const job = await Job.findOne({ where: { id }, raw: true })
        if (!job) throw ApiError('Job not found', 404)

        return res.status(200).json({
            success: true,
            data: job
        });
    }, 'getJobById'),

    editJobRequirment: asyncHandler(async (req, res) => {
        const { id } = req.query;
        const { title, technology, experienceRequired, openings, internship, active } = req.body;

        if (!id) throw ApiError('Job ID is required', 400);

        const job = await Job.findOne({ where: { id } })
        if (!job) throw ApiError('Job not found', 404)

        const response = await job.update({
            title,
            technology,
            experienceRequired,
            openings,
            internship,
            active
        });

        if (!response) throw ApiError('Failed to update job', 400)

        return res.status(200).json({
            success: true,
            message: 'Job updated successfully'
        });

    }, 'editJobRequirment'),


    deleteJobRequirment: asyncHandler(async (req, res) => {
        const { id } = req.query;

        if (!id) throw ApiError('Job ID is required', 400);

        const job = await Job.findOne({ where: { id } })
        if (!job) throw ApiError('Job not found', 404)

        const response = await job.destroy();
        if (!response) throw ApiError('Failed to delete job', 400)

        return res.status(200).json({
            success: true,
            message: 'Job deleted successfully'
        });

    }, 'deleteJobRequirment'),

}