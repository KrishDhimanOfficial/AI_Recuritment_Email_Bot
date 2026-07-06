import { ai } from "../config/genai.config.js";

export async function analyzeCandidate(subject, body, resumeText, jobRequirements) {
    resumeText = resumeText.replace(/\n{2,}/g, "\n");
    body = body.replace(/\n{2,}/g, "\n");

    resumeText = resumeText.replace(/[ \t]{2,}/g, " ");
    body = body.replace(/[ \t]{2,}/g, " ");

    resumeText = resumeText.trim();
    body = body.trim();

    // Serialize only fields the AI needs — keeps the prompt lean
    const jobContext = JSON.stringify(
        jobRequirements
            .filter(job => job.active === 1)
            .map(({ title, technology, experienceRequired, internship }) => ({
                title,
                technology,
                experienceRequired,
                internship: Boolean(internship),
            }))
    );

    const prompt = `
You are a senior HR recruitment assistant. Analyze the candidate's resume against the open job requirements below and return structured data.

## Open Job Requirements
${jobContext}

## Candidate Email
Subject: ${subject}

Body:
${body}

## Candidate Resume
${resumeText}

---

## Instructions

### 1. Extract candidate info
- candidateName: Full name from resume or email
- appliedRole: The role the candidate is applying for (match to job titles above if possible)
- technology: List of technologies/frameworks extracted from resume
- skills: All skills mentioned (programming languages, tools, soft skills, etc.)
- experienceYears: Total years of professional experience (0 if fresher/student)
- internship: true if candidate is explicitly seeking/available for internship, else false

### 2. Match against job requirements and give a score (0-100)
- matchedJob: The title of the best-matching job from the list above (or null if no match)
- score: Integer 0-100 reflecting how well the candidate fits the matched job
  - 0-30  : Poor match (wrong skills, no relevant experience)
  - 31-60 : Partial match (some relevant skills but gaps)
  - 61-80 : Good match (most skills present, minor gaps)
  - 81-100: Excellent match (skills, experience, and role align perfectly)
- scoreBreakdown: Short explanation of why the score was given

### 3. Classify candidateType using these strict rules
Use EXACTLY one of: "fresher", "junior", "experienced", "intern", "trainie"

| Label        | Rule                                                                 |
|--------------|----------------------------------------------------------------------|
| "intern"     | experienceYears == 0 AND (internship == true OR job.internship == 1) |
| "trainie"    | experienceYears == 0 AND internship == false AND no degree yet       |
| "fresher"    | experienceYears == 0 AND has a completed degree, not seeking intern  |
| "junior"     | 0 < experienceYears <= 2                                             |
| "experienced"| experienceYears > 2                                                  |

---

Return ONLY this valid JSON, no markdown, no explanation:

{
  "candidateName": "",
  "appliedRole": "",
  "matchedJob": "",
  "technology": [],
  "skills": [],
  "experienceYears": 0,
  "candidateType": "",
  "internship": false,
  "score": 0,
  "scoreBreakdown": ""
}
`;

    const models = [
        "gemini-2.5-flash-lite",
        "gemini-2.5-flash",
        "gemini-2.5-pro",
    ];

    let lastError;

    for (const model of models) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                },
            });

            return response.text;
        } catch (error) {
            lastError = error;
            const status = error.status || error.code || error.response?.status;
            console.error(`${model} failed (${status})`);

            // Only try the next model for transient errors
            if ([429, 500, 503].includes(status)) {
                continue;
            }

            // Don't retry invalid requests, auth failures, etc.
            throw error;
        }
    }

    throw lastError;
}