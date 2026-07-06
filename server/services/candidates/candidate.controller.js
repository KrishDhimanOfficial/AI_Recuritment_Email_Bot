import { asyncHandler } from "../../utils/helper.utils.js";
import Candidate from "./candidate.model.js";
import Job from "../jobs/job.model.js";
import { Op } from "sequelize";

export default {
    getAllCandiatesDetails: asyncHandler(async (req, res) => {
        const { page, limit, technology, type, status, fromDate, toDate } = req.query;
        const page_no = Number(page) || 1;
        const limit_no = Number(limit) || 10;
        const offset = (page_no - 1) * limit_no;

        const where = {};
        if (technology) {
            where.technology = { [Op.like]: `%${technology}%` };
        }
        if (type) {
            where.type = type;
        }
        if (status !== undefined && status !== '') {
            where.isEmailSent = status === 'true';
        }
        if (fromDate || toDate) {
            where.appliedDate = {};
            if (fromDate) {
                where.appliedDate[Op.gte] = new Date(fromDate);
            }
            if (toDate) {
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                where.appliedDate[Op.lte] = to;
            }
        }

        const response = await Candidate.findAndCountAll({
            where,
            limit: limit_no,
            offset: offset,
            order: [['appliedDate', 'DESC']]
        });

        return res.status(200).json({
            success: true,
            data: response.rows,
            total: response.count,
            page: page_no,
            limit: limit_no,
            totalPages: Math.ceil(response.count / limit_no)
        });
    }, 'getAllCandiatesDetails'),
}
