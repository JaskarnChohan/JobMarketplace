const { GoogleGenerativeAI } = require("@google/generative-ai");
const Profile = require("../models/profile");
const JobListing = require("../models/jobListing");
const Experience = require("../models/experience");
const Education = require("../models/education");
const Skill = require("../models/skill");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI Improvement function
exports.improveAnswer = async (req, res) => {
  const { question, answer } = req.body;
  const userId = req.user.id;

  // Validate input
  if (!question || !answer) {
    console.log("Validation failed: Missing question or answer.");
    return res
      .status(400)
      .json({ msg: "Both question and answer are required." });
  }

  // Check if API key is set
  if (!process.env.GOOGLE_AI_API_KEY) {
    return res.status(500).json({ msg: "This feature requires AI setup." });
  }

  try {
    // Fetch user profile
    const profile = await Profile.findOne({ user: userId });

    // Initialise userInfo string
    let userInfo = "";

    // If the profile exists, fetch user information
    if (profile) {
      // Fetch experience, education, and skills separately using profileId
      const experience = await Experience.find({ profile: profile._id });
      const education = await Education.find({ profile: profile._id });
      const skills = await Skill.find({ profile: profile._id });

      // Construct the context using the profile data
      userInfo = `
        First Name: ${profile.firstName || "N/A"}
        Last Name: ${profile.lastName || "N/A"}
        Location: ${profile.location || "N/A"}
        Bio: ${profile.bio || "N/A"}
        Preferred Work Category: ${profile.preferredClassification || "N/A"}
        Experience: ${
          experience
            .map(
              (exp) =>
                `${exp.title} at ${exp.company} (${exp.startMonth} ${
                  exp.startYear
                } - ${
                  exp.endMonth ? exp.endMonth + " " + exp.endYear : "Present"
                })<br>Description: ${exp.description || "N/A"}`
            )
            .join(", ") || "N/A"
        }
        Education: ${
          education
            .map(
              (edu) =>
                `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (
                  ${edu.startMonth} ${edu.startYear} - ${
                  edu.endMonth ? edu.endMonth + " " + edu.endYear : "Present"
                })<br>Description: ${edu.description || "N/A"}`
            )
            .join(", ") || "N/A"
        }
        Skills: ${
          skills
            .map(
              (skill) =>
                `${skill.name} (Level: ${skill.level}, Description: ${skill.description})`
            )
            .join(", ") || "N/A"
        }
      `;
    }

    // Create the prompt for the AI
    const prompt = `You are an expert in helping individuals articulate their responses more effectively. As part of a tool on a job marketplace website, your role is to assist job seekers in enhancing their answers to interview questions.

    Your response should:
    1. Use user information to provide more personalized and relevant suggestions.
    2. Be formatted in HTML to maintain a clean and user-friendly UI. Use <strong> for emphasis instead of * and <em> for italics. Ensure that your exact response is in HTML format.
    3. Include spaces between paragraphs for better readability.
    4. Provide feedback on the original answer.
    5. Suggest points for improvement before presenting the improved answer.
    6. Improve the following answer by making it more detailed and engaging while preserving the essence of the original content.
    7. Avoid generating irrelevant or AI-like content that may detract from the user's experience.

    ${userInfo ? `**User Info:** ${userInfo}` : ""}
    
    **Question:** ${question} 
    
    **Answer:** ${answer} 
    
    **Response Format:**
    <response>
      <h3>Feedback</h3>
      <p className="sub-headings"><!-- Your feedback here --></p>
      <br>
      <h3>Points for Improvement</h3>
      <p><!-- Your points for improvement here --></p>
      <br>
      <h3>Improved Answer</h3>
      <p className="sub-headings"><!-- Your improved answer here --></p>
    </response>
    `;

    // Generate improved content using the Gemini API
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000, // Maximum number of tokens to generate
        temperature: 0.7,
      },
    });

    // Check the candidates array
    if (result?.response?.candidates && result.response.candidates.length > 0) {
      const improvedText = result.response.candidates[0].content.parts[0].text;

      // If no improved text is returned
      if (!improvedText) {
        console.log("AI response did not contain improved text.");
        return res
          .status(500)
          .json({ msg: "Failed to retrieve improved text from the AI." });
      }

      // Send the improved text in response
      return res.json({ improvedText });
    } else {
      console.log("No candidates found in AI response.");
      return res
        .status(500)
        .json({ msg: "No candidates found in AI response." });
    }
  } catch (err) {
    console.error("Error during AI request:", err.message);
    res
      .status(500)
      .json({ msg: "Error improving question/answer", error: err.message });
  }
};
// AI Evaluation function
exports.evaluateApplication = async (application) => {
  const { userId, jobId, questions } = application;

  // Skip evaluation if there are no questions
  if (!questions || questions.length === 0) {
    return {
      score: "N/A",
      evaluation: "No questions provided for evaluation.",
      recommendedOutcome: "N/A",
    };
  }

  // Fetch job details using jobId
  const jobDetails = await JobListing.findById(jobId);
  if (!jobDetails) {
    throw new Error("Job not found");
  }

  // Fetch user profile
  const profile = await Profile.findOne({ user: userId });
  let userInfo = "";

  // If the profile exists, fetch user information
  if (profile) {
    // Fetch experience, education, and skills separately using profileId
    const experience = await Experience.find({ profile: profile._id });
    const education = await Education.find({ profile: profile._id });
    const skills = await Skill.find({ profile: profile._id });

    // Construct the context using the profile data
    userInfo = `
        First Name: ${profile.firstName || "N/A"}
        Last Name: ${profile.lastName || "N/A"}
        Location: ${profile.location || "N/A"}
        Bio: ${profile.bio || "N/A"}
        Preferred Work Category: ${profile.preferredClassification || "N/A"}
        Experience: ${
          experience
            .map(
              (exp) =>
                `${exp.title} at ${exp.company} (${exp.startMonth} ${
                  exp.startYear
                } - ${
                  exp.endMonth ? exp.endMonth + " " + exp.endYear : "Present"
                })\nDescription: ${exp.description || "N/A"}`
            )
            .join(", ") || "N/A"
        }
        Education: ${
          education
            .map(
              (edu) =>
                `${edu.degree} in ${edu.fieldOfStudy} from ${edu.school} (${
                  edu.startMonth
                } ${edu.startYear} - ${
                  edu.endMonth ? edu.endMonth + " " + edu.endYear : "Present"
                })\nDescription: ${edu.description || "N/A"}`
            )
            .join(", ") || "N/A"
        }
        Skills: ${
          skills
            .map(
              (skill) =>
                `${skill.name} (Level: ${skill.level}, Description: ${skill.description})`
            )
            .join(", ") || "N/A"
        }
      `;
  }

  // Create the prompt for the AI
  const prompt = `You are an expert in evaluating job applications based on job descriptions and applicant answers. Your task is to assess whether the applicant is a good fit for the job.
      
      Your response should:
      1. Use job details and user information to provide a personalized evaluation.
      2. Be formatted as plain text, with no HTML or special formatting.
      3. Provide feedback on all the applicant's answers.
      4. Evaluate all the answers and provide a score out of 100.
      5. Recommend outcomes based on the evaluation.
  
      **Job Details:**
      Title: ${jobDetails.title}
      Description: ${jobDetails.description}
      Requirements: ${jobDetails.requirements.join(", ") || "N/A"}
      Benefits: ${jobDetails.benefits.join(", ") || "N/A"}
      Salary Range: ${jobDetails.salaryRange}
      Employment Type: ${jobDetails.employmentType}
      Location: ${jobDetails.location}
  
      ${userInfo ? `**User Info:** ${userInfo}` : ""}
  
      **Questions and Answers:**
      ${questions
        .map((q) => `Question: ${q.question}\nAnswer: ${q.userAnswer}\n`)
        .join("")}
  
      **Response Format:**
      <response>
        Score: <score>/100 <!-- Ensure you do the score out of 100. -->
        Feedback: <!-- Your feedback here -->
        Recommended Outcome: Accepted | Rejected | Interview | Wait<!-- Ensure the response matches these values -->
      </response>
      `;

  // Generate evaluation content using the AI model
  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 1000, // Maximum number of tokens to generate
      temperature: 0.7,
    },
  });

  // Check the candidates array
  if (result?.response?.candidates && result.response.candidates.length > 0) {
    const evaluationText = result.response.candidates[0].content.parts[0].text;

    // If no evaluation text is returned
    if (!evaluationText) {
      throw new Error("AI response did not contain evaluation text.");
    }

    // Split evaluation text to extract score, feedback, and recommended outcome
    const responseRegex =
      /Score:\s*(\d+)\/100\s*Feedback:\s*(.*?)\s*Recommended Outcome:\s*(Accepted|Rejected|Interview|Wait)/s;
    const matches = evaluationText.match(responseRegex);

    if (!matches) {
      throw new Error("AI response did not match expected format.");
    }

    const score = matches[1]; // Extract score
    const feedback = matches[2]; // Extract feedback
    const recommendedOutcome = matches[3]; // Extract recommended outcome

    return {
      score: `${score}/100`,
      evaluation: feedback,
      recommendedOutcome,
    };
  } else {
    throw new Error("No candidates found in AI response.");
  }
};
