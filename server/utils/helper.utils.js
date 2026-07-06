import { deleteFile } from './removeFile.utils.js'
import pdf from "pdf-parse-new";

export const ApiError = (message, statusCode) => {
    const error = new Error(message)
    error.statusCode = statusCode
    error.success = false
    return error
}

export const asyncHandler = (fn, name = 'UnknownController') => {

    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error(`🔥 Error in ${name} : ${err.message}`)
            if (req.file?.filename) deleteFile(req.file?.path)
            if (req.files && req.files?.length > 0) req.files?.forEach(file => deleteFile(file.path))
            next(err)
        })
    }
}

export const globalErrorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    // For API requests (JSON response)
    return res.status(statusCode).json(
        {
            success: false,
            message: err.message || 'Something went wrong',
        }
    )
}

export function isResumeEmail(parsed, jobTitleRegex) {
  const SUBJECT_REGEX = new RegExp(
    `\\b(resume|cv|application|job application|${jobTitleRegex}|candidate|apply|applying|developer|engineer|intern|frontend|backend|mern|react|node|full[\\s-]?stack)\\b`,
    "i",
  );

  const BODY_REGEX = new RegExp(
    `\\b(resume|cv|attached|attachment|please find|job application|application|candidate|experience|skills|${jobTitleRegex})\\b`,
    "i",
  );

  const FILE_REGEX = /\b(resume|cv|curriculum|biodata|profile)\b/i;
  let score = 0;

  // Subject
  if (SUBJECT_REGEX.test(parsed.subject || "")) {
    score += 20;
  }

  // Body
  if (BODY_REGEX.test(parsed.text || "")) {
    score += 15;
  }

  // Attachments
  for (const file of parsed.attachments) {
    // PDF/DOCX
    if (
      [
        "application/pdf",
        // "application/msword",
        // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(file.contentType)
    ) {
      score += 30;
    }

    // Filename
    if (FILE_REGEX.test(file.filename || "")) {
      score += 20;
    }
  }

  return {
    isResume: score >= 40,
    score,
  };
}

// Isolated helper — muting console here doesn't bleed into concurrent calls
export async function parsePdf(content) {
  const _log = console.log;
  const _warn = console.warn;
  const _error = console.error;
  console.log = () => { };
  console.warn = () => { };
  console.error = () => { };
  try {
    return await pdf(content);
  } finally {
    console.log = _log;
    console.warn = _warn;
    console.error = _error;
  }
}