import { ApiError, asyncHandler } from "../../utils/helper.utils.js";
import Candidate from "../candidates/candidate.model.js";
import User from "./user.model.js";
import Job from "../jobs/job.model.js";

export default {
  saveToken: asyncHandler(async (req, res) => {
    const { email, refreshToken } = req.body;

    const accessToken = req.headers.authorization.split(" ")[1];
    const user = await User.findOne({ where: { email }, raw: true });

    if (!user) {
      const newUser = await User.create({ email, accessToken, refreshToken });
      return res.status(200).json({
        success: true,
        message: "Token saved successfully",
        data: newUser,
      });
    }

    await User.update({ accessToken, refreshToken }, { where: { email } });

    return res.status(200).json({
      success: true,
      message: "Token updated successfully",
      data: user,
    })
  }, "saveToken"),

  getDashboardAnalytics: asyncHandler(async (req, res) => {
    const [allCandidates, allJobs] = await Promise.all([
      Candidate.findAll({ raw: true, order: [['appliedDate', 'DESC']] }),
      Job.findAll({ raw: true })
    ]);

    const total = allCandidates.length;

    // ── 1. Overview Cards ────────────────────────────────────────────
    const emailsSent = allCandidates.filter(c => c.isEmailSent).length;
    const pendingReview = allCandidates.filter(c => !c.isEmailSent).length;
    const shortlisted = allCandidates.filter(c => c.score >= 60).length;
    const rejected = allCandidates.filter(c => c.score < 30).length;
    const activeJobs = allJobs.filter(j => j.active).length;

    const overview = {
      totalApplications: total,
      shortlisted,
      rejected,
      pendingReview,
      emailsSent,
      activeJobs,
    };

    // ── 2. Candidate Classification ──────────────────────────────────
    const types = ['fresher', 'junior', 'experienced', 'intern', 'trainie'];
    const candidateClassification = types.map(t => {
      const count = allCandidates.filter(c => c.type === t).length;
      return {
        type: t,
        label: t.charAt(0).toUpperCase() + t.slice(1),
        count,
        percentage: total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0,
      };
    });

    // ── 3. Job Analytics ─────────────────────────────────────────────
    const jobAnalytics = allJobs.map(job => {
      const applicants = allCandidates.filter(c =>
        c.matchedJob?.toLowerCase() === job.title?.toLowerCase() ||
        c.appliedJob?.toLowerCase() === job.title?.toLowerCase()
      );
      const scores = applicants.map(a => a.score);
      const jobShortlisted = applicants.filter(a => a.score >= 60).length;
      const jobRejected = applicants.filter(a => a.score < 30).length;
      return {
        title: job.title,
        totalApplicants: applicants.length,
        shortlisted: jobShortlisted,
        rejected: jobRejected,
        averageScore: scores.length > 0 ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0,
        hiringRate: applicants.length > 0 ? parseFloat(((jobShortlisted / applicants.length) * 100).toFixed(1)) : 0,
        active: job.active,
      };
    });

    // ── 4. AI Match Analytics ────────────────────────────────────────
    const scores = allCandidates.map(c => c.score).sort((a, b) => a - b);
    const avgScore = scores.length > 0 ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) : 0;
    const medianScore = scores.length > 0
      ? scores.length % 2 === 0
        ? (scores[scores.length / 2 - 1] + scores[scores.length / 2]) / 2
        : scores[Math.floor(scores.length / 2)]
      : 0;

    const scoreDistribution = [
      { range: '0-25', count: scores.filter(s => s >= 0 && s <= 25).length },
      { range: '26-50', count: scores.filter(s => s >= 26 && s <= 50).length },
      { range: '51-75', count: scores.filter(s => s >= 51 && s <= 75).length },
      { range: '76-100', count: scores.filter(s => s >= 76 && s <= 100).length },
    ];

    const aiMatchAnalytics = {
      averageScore: avgScore,
      highestScore: scores.length > 0 ? scores[scores.length - 1] : 0,
      lowestScore: scores.length > 0 ? scores[0] : 0,
      medianScore,
      scoreDistribution,
    };

    // ── 5. Technology Analytics ──────────────────────────────────────
    const techMap = {};
    allCandidates.forEach(c => {
      if (c.technology) {
        c.technology.split(',').forEach(t => {
          const tech = t.trim();
          if (tech) techMap[tech] = (techMap[tech] || 0) + 1;
        });
      }
    });
    const technologyAnalytics = Object.entries(techMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));

    // ── 6. Experience Analytics ──────────────────────────────────────
    const experiences = allCandidates.map(c => c.experience || 0);
    const avgExp = experiences.length > 0 ? parseFloat((experiences.reduce((a, b) => a + b, 0) / experiences.length).toFixed(1)) : 0;

    const experienceAnalytics = {
      average: avgExp,
      max: experiences.length > 0 ? Math.max(...experiences) : 0,
      min: experiences.length > 0 ? Math.min(...experiences) : 0,
      distribution: [
        { range: '0 Years', count: experiences.filter(e => e === 0).length },
        { range: '1-2 Years', count: experiences.filter(e => e >= 1 && e <= 2).length },
        { range: '3-5 Years', count: experiences.filter(e => e >= 3 && e <= 5).length },
        { range: '5+ Years', count: experiences.filter(e => e > 5).length },
      ],
    };

    // ── 7. Application Trend ─────────────────────────────────────────
    const dailyMap = {};
    allCandidates.forEach(c => {
      const day = new Date(c.appliedDate).toISOString().split('T')[0];
      dailyMap[day] = (dailyMap[day] || 0) + 1;
    });
    const dailyTrend = Object.entries(dailyMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Weekly growth
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekCount = allCandidates.filter(c => new Date(c.appliedDate) >= thisWeekStart).length;
    const lastWeekCount = allCandidates.filter(c => {
      const d = new Date(c.appliedDate);
      return d >= lastWeekStart && d < thisWeekStart;
    }).length;
    const weeklyGrowth = lastWeekCount > 0
      ? parseFloat((((thisWeekCount - lastWeekCount) / lastWeekCount) * 100).toFixed(2))
      : thisWeekCount > 0 ? 100 : 0;

    const applicationTrend = { daily: dailyTrend, weeklyGrowth };

    // ── 8. Hiring Funnel ─────────────────────────────────────────────
    const aiQualified = allCandidates.filter(c => c.score >= 50).length;
    const funnelShortlisted = allCandidates.filter(c => c.score >= 70).length;
    const funnelEmailSent = allCandidates.filter(c => c.isEmailSent).length;

    const hiringFunnel = [
      { stage: 'Applications', count: total, conversion: 100 },
      { stage: 'AI Qualified (≥50)', count: aiQualified, conversion: total > 0 ? parseFloat(((aiQualified / total) * 100).toFixed(1)) : 0 },
      { stage: 'Shortlisted (≥70)', count: funnelShortlisted, conversion: total > 0 ? parseFloat(((funnelShortlisted / total) * 100).toFixed(1)) : 0 },
      { stage: 'Email Sent', count: funnelEmailSent, conversion: total > 0 ? parseFloat(((funnelEmailSent / total) * 100).toFixed(1)) : 0 },
    ];

    // ── 9. Email Analytics ───────────────────────────────────────────
    const emailAnalytics = {
      sent: emailsSent,
      sendRate: total > 0 ? parseFloat(((emailsSent / total) * 100).toFixed(1)) : 0,
    };

    // ── 10. Performance Metrics ──────────────────────────────────────
    const shortlistingRate = total > 0 ? parseFloat(((shortlisted / total) * 100).toFixed(1)) : 0;
    const emailSuccessRate = total > 0 ? parseFloat(((emailsSent / total) * 100).toFixed(1)) : 0;

    const performanceMetrics = {
      shortlistingRate,
      emailSuccessRate,
      averageResumeMatch: avgScore,
    };

    // ── 11. Health Indicator ─────────────────────────────────────────
    let recruitmentHealth = 'Poor';
    let healthReason = 'Shortlisting rate and average scores need improvement.';

    if (shortlistingRate > 20 && avgScore > 80) {
      recruitmentHealth = 'Excellent';
      healthReason = `Strong pipeline with ${shortlistingRate}% shortlisting rate and ${avgScore} avg AI score.`;
    } else if (shortlistingRate > 15) {
      recruitmentHealth = 'Good';
      healthReason = `Healthy pipeline with ${shortlistingRate}% shortlisting rate.`;
    } else if (shortlistingRate > 8) {
      recruitmentHealth = 'Average';
      healthReason = `Pipeline needs attention. Shortlisting rate is ${shortlistingRate}%.`;
    }

    // ── 12. Insights ─────────────────────────────────────────────────
    const insights = [];

    // Type distribution insight
    const topType = candidateClassification.sort((a, b) => b.count - a.count)[0];
    if (topType && topType.count > 0) {
      insights.push(`${topType.percentage}% of applicants are ${topType.label}s.`);
    }

    // Top technology insight
    if (technologyAnalytics.length > 0) {
      insights.push(`${technologyAnalytics[0].name} is the most in-demand technology (${technologyAnalytics[0].count} candidates).`);
    }

    // Top job insight
    const topJob = jobAnalytics.sort((a, b) => b.totalApplicants - a.totalApplicants)[0];
    if (topJob && topJob.totalApplicants > 0) {
      insights.push(`${topJob.title} has the highest application count (${topJob.totalApplicants}).`);
    }

    // Score insight
    insights.push(`Average AI match score across all candidates is ${avgScore}/100.`);

    // Email insight
    insights.push(`Email send rate is ${emailAnalytics.sendRate}% — ${pendingReview} candidates still pending.`);

    // ── 13. Chart Data ───────────────────────────────────────────────
    const charts = {
      applicationsOverTime: dailyTrend,
      candidatesByType: candidateClassification.map(c => ({ name: c.label, value: c.count })),
      technologyDemand: technologyAnalytics,
      scoreDistribution,
      jobWiseApplications: jobAnalytics.map(j => ({ name: j.title, applicants: j.totalApplicants, avgScore: j.averageScore })),
      hiringFunnel: hiringFunnel.map(f => ({ name: f.stage, value: f.count })),
    };

    return res.status(200).json({
      success: true,
      overview,
      candidateClassification,
      jobAnalytics,
      aiMatchAnalytics,
      technologyAnalytics,
      experienceAnalytics,
      applicationTrend,
      hiringFunnel,
      emailAnalytics,
      performanceMetrics,
      healthIndicator: { recruitmentHealth, reason: healthReason },
      insights,
      charts,
    });
  }, 'getDashboardAnalytics'),

  removeUser: asyncHandler(async (req, res) => {
    await User.destroy({
      where: {},
      force: true,
    });

    return res.status(200).json({
      success: true,
      message: 'User removed successfully',
    });
  }, 'removeUser')
};
