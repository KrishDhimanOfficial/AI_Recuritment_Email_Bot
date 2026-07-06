import { google } from "googleapis";
import { simpleParser } from "mailparser";
import { ApiError, asyncHandler, isResumeEmail, parsePdf } from "../../utils/helper.utils.js";
import config from "../../config/config.js";
import User from "../user/user.model.js";
import Job from "../jobs/job.model.js";
import { analyzeCandidate } from "../../ai/ai.js";
import Candidate from "../candidates/candidate.model.js";
import { sendEmail } from "../sendMail.service.js";

const oauth2Client = new google.auth.OAuth2(
  config.google_client_id,
  config.google_client_sceret,
);

/**
 * Syncs Gmail history to get new messages since last check
 */
async function getNewMessageRefs(gmail, currentUser) {
  let messageRefs = [];
  let newHistoryId = currentUser.historyId;

  try {
    if (currentUser.historyId) {
      const historyResponse = await gmail.users.history.list({
        userId: currentUser.email,
        startHistoryId: currentUser.historyId,
      });

      const historyRecords = historyResponse.data.history || [];
      const messageMap = new Map();

      historyRecords.forEach((record) => {
        record.messagesAdded?.forEach((msgAdded) => {
          messageMap.set(msgAdded.message.id, msgAdded.message);
        });
      });

      messageRefs = Array.from(messageMap.values());
      newHistoryId = historyResponse.data.historyId || currentUser.historyId;
    } else {
      const listResponse = await gmail.users.messages.list({
        userId: currentUser.email,
        maxResults: 50,
      });
      messageRefs = listResponse.data.messages || [];

      const profile = await gmail.users.getProfile({ userId: currentUser.email });
      newHistoryId = profile.data.historyId;
    }
  } catch (err) {
    console.warn("History sync error, falling back to full fetch:", err.message);
    const listResponse = await gmail.users.messages.list({
      userId: currentUser.email,
      maxResults: 50,
    });
    messageRefs = listResponse.data.messages || [];

    const profile = await gmail.users.getProfile({ userId: currentUser.email });
    newHistoryId = profile.data.historyId;
  }

  return { messageRefs, newHistoryId };
}

/**
 * Processes a single email message: parses text, PDF, and sends to AI
 */
async function processCandidateEmail(gmail, email, messageId, jobTitleRegex, jobRequirements) {
  const response = await gmail.users.messages.get({
    userId: email,
    id: messageId,
    format: "raw",
  });

  if (!response.data?.raw) return null;

  const buffer = Buffer.from(
    response.data.raw.replace(/-/g, "+").replace(/_/g, "/"),
    "base64",
  );

  const parsed = await simpleParser(buffer);
  if (!parsed.attachments?.length) return null;

  const { isResume } = isResumeEmail(parsed, jobTitleRegex);
  if (!isResume) return null;

  const pdft = await parsePdf(parsed.attachments[0].content);
  const aiResult = await analyzeCandidate(parsed.subject, parsed.text, pdft.text, jobRequirements);
  const analysis = JSON.parse(aiResult);

  return {
    messageId: response.data.id,
    email: parsed.from?.text?.match(/<([^>]+)>/)?.[1] || parsed.from?.text,
    name: analysis.candidateName,
    technology: analysis.technology?.join(','),
    experience: analysis.experienceYears,
    type: analysis.candidateType,
    appliedJob: analysis.appliedRole,
    matchedJob: analysis.matchedJob,
    intership: analysis.intership || false, // Fallback if AI skips it
    score: analysis.score,
    aiReason: analysis.scoreBreakdown,
    appliedDate: new Date(),
  };
}

export default {
  /**
   * Main cron job handler to fetch new emails and analyze candidates
   */
  getRecentMessages: async () => {
    try {
      const [users, jobRequirements] = await Promise.all([
        User.findAll({ attributes: ["refreshToken", "email", "historyId"], raw: true }),
        Job.findAll({ attributes: ["title", 'technology', 'openings', 'experienceRequired', 'active', 'internship'], raw: true }),
      ]);

      if (!users.length) {
        return console.log("Gmail access token is required");
      }

      const currentUser = users[0];
      oauth2Client.setCredentials({ refresh_token: currentUser.refreshToken });
      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      const { messageRefs, newHistoryId } = await getNewMessageRefs(gmail, currentUser);

      if (!messageRefs.length) {
        if (newHistoryId && String(newHistoryId) !== String(currentUser.historyId)) {
          await User.update({ historyId: String(newHistoryId) }, { where: { email: currentUser.email } });
        }
        return console.log("No new messages found");
      }

      const jobTitleRegex = jobRequirements.map((job) => job.title.toLowerCase()).join("|");

      // Process all fetched messages in parallel
      const processingPromises = messageRefs.map(({ id }) =>
        processCandidateEmail(gmail, currentUser.email, id, jobTitleRegex, jobRequirements)
      );

      const processedResults = await Promise.all(processingPromises);
      const candidatesToInsert = processedResults.filter(Boolean);

      if (!candidatesToInsert.length) {
        return console.log("No new valid resumes found in recent messages");
      }

      await Candidate.bulkCreate(candidatesToInsert);

      // Increment applicants count for each matched job
      const jobApplicantCounts = {};
      for (const candidate of candidatesToInsert) {
        if (candidate.matchedJob) {
          jobApplicantCounts[candidate.matchedJob] = (jobApplicantCounts[candidate.matchedJob] || 0) + 1;
        }
      }

      const incrementPromises = Object.entries(jobApplicantCounts).map(
        ([jobTitle, count]) => Job.increment('applicants', { by: count, where: { title: jobTitle } })
      );

      await Promise.all(incrementPromises);

      // Update historyId only after successfully parsing and saving candidates
      if (newHistoryId && String(newHistoryId) !== String(currentUser.historyId)) {
        await User.update({ historyId: String(newHistoryId) }, { where: { email: currentUser.email } });
      }

      console.log(`Successfully processed and saved ${candidatesToInsert.length} candidates.`);
    } catch (error) {
      console.error("getRecentMessages Error:", error);
    }
  },

  /**
   * Processes all candidates who haven't received an email yet
   */
  sendMails: async () => {
    try {
      const candidates = await Candidate.findAll({ where: { isEmailSent: false } });

      if (!candidates.length) {
        return console.log("No pending emails to send.");
      }

      const emailPromises = candidates.map(async (candidate) => {
        try {
          // Map candidate type to available templates (or 'default' for missed roles if needed)
          const emailType = (candidate.type === "intern" || candidate.type === "experienced")
            ? candidate.type
            : "fresher";

          await sendEmail(emailType, candidate.email, candidate.name);

          candidate.isEmailSent = true;
          await candidate.save();
          console.log(`Email sent successfully to ${candidate.email}`);
        } catch (err) {
          console.error(`Failed to send email to ${candidate.email}:`, err.message);
        }
      });

      await Promise.allSettled(emailPromises);
      console.log("Finished sending candidate emails.");
    } catch (error) {
      console.error("sendMails Error:", error);
    }
  },

    /**
   * Send speific Email
   */
  sendSpecificEmail: asyncHandler(async (req, res) => {
    const { id } = req.query;

    const response = await Candidate.findByPk(id)
    if (!response) throw new ApiError('Candidate not found', 404);

    await sendEmail(response.type, response.email, response.name);

    response.isEmailSent = true;
    await response.save();

    return res.status(200).json({
      message: 'Email sent successfully',
      statusCode: 200
    })
  }, 'sendSpecificEmail'),

  /**
   * Fetches and serves a PDF attachment from Gmail API
   */
  getAttachment: asyncHandler(async (req, res) => {
    const { messageId } = req.params;

    const users = await User.findAll({ attributes: ["refreshToken", "email"], raw: true });
    if (!users.length) throw new ApiError('User not found', 404);

    oauth2Client.setCredentials({ refresh_token: users[0].refreshToken });
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    const message = await gmail.users.messages.get({
      userId: users[0].email,
      id: messageId,
      format: "full",
    });

    const raw = message.data?.payload.parts.find((part) => part.mimeType === "application/pdf");
    if (!raw) throw new ApiError('No PDF attachment found', 404);

    const attachment = await gmail.users.messages.attachments.get({
      userId: users[0].email,
      messageId,
      id: raw.body.attachmentId,
    });

    const buffer = Buffer.from(
      attachment.data.data.replace(/-/g, "+").replace(/_/g, "/"),
      "base64"
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");

    return res.status(200).send(buffer);
  }, "getAttachment"),
}