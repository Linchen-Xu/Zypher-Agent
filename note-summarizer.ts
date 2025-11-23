import {
  ZypherAgent,
  createZypherContext,
  AnthropicModelProvider,
} from '@corespeed/zypher';
import { eachValueFrom } from 'rxjs-for-await';
import "jsr:@std/dotenv/load";

// Load environment variables
const getRequiredEnv = (key: string): string => {
  const value = Deno.env.get(key);
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

// Read all text files from a directory
async function readTextFilesFromDirectory(directoryPath: string): Promise<Map<string, string>> {
  const fileContents = new Map<string, string>();
  
  try {
    // Ensure the directory exists
    try {
      const dirInfo = await Deno.stat(directoryPath);
      if (!dirInfo.isDirectory) {
        throw new Error(`${directoryPath} is not a directory`);
      }
    } catch (error) {
      if (error instanceof Deno.errors.NotFound) {
        throw new Error(`Directory not found: ${directoryPath}`);
      }
      throw error;
    }
    
    // Read all files in the directory
    for await (const dirEntry of Deno.readDir(directoryPath)) {
      if (dirEntry.isFile && dirEntry.name.endsWith('.txt')) {
        const filePath = `${directoryPath}/${dirEntry.name}`;
        try {
          const content = await Deno.readTextFile(filePath);
          fileContents.set(dirEntry.name, content);
          console.log(`📄 Loaded file: ${dirEntry.name} (${content.length} characters)`);
        } catch (error) {
          console.error(`❌ Failed to read file ${filePath}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error(`❌ Failed to read directory ${directoryPath}: ${error}`);
    throw error;
  }
  
  return fileContents;
}

// Format file contents for the prompt
function formatFilesForPrompt(fileContents: Map<string, string>): string {
  let formatted = "## Your Notes and Thoughts\n\n";
  
  for (const [fileName, content] of fileContents.entries()) {
    formatted += `### ${fileName}\n\n`;
    formatted += "```\n";
    formatted += content;
    formatted += "\n```\n\n";
  }
  
  return formatted;
}

// Main function
async function main() {
  // Read all text files from ./notes/docs directory
  const inputDirectory = "./notes/docs";
  
  console.log("📝 Note Summarizer Agent\n");
  console.log(`📁 Reading notes from: ${inputDirectory}\n`);
  
  // Read all text files from the directory
  const fileContents = await readTextFilesFromDirectory(inputDirectory);
  
  if (fileContents.size === 0) {
    console.error("❌ No files were successfully loaded.");
    Deno.exit(1);
  }
  
  // Create the agent
  const agent = new ZypherAgent(
    await createZypherContext(Deno.cwd()),
    new AnthropicModelProvider({
      apiKey: getRequiredEnv("ANTHROPIC_API_KEY"),
    })
  );
  

  // Format files for the prompt
  const notesSection = formatFilesForPrompt(fileContents);
  
  // Create analysis task prompt
  const taskPrompt = `${notesSection}

## Analysis Task

You are analyzing personal notes and thoughts. Your task is to:
1. Identify key ideas, considerations, and decisions mentioned in the notes
2. Collect relevant evidence from the web to support or evaluate these ideas
3. Provide a comprehensive evaluation of the ideas based on the evidence collected

IMPORTANT: Use your web search capabilities to gather evidence and information related to the ideas, considerations, and topics mentioned in the notes. Search for:
- Supporting research, data, or case studies
- Alternative perspectives or counterarguments
- Real-world examples or implementations
- Current trends, best practices, or expert opinions
- Potential risks, challenges, or limitations

Your report should be structured as follows:

### 1. Executive Summary
Provide a concise overview of the main themes, topics, ideas, and considerations present in the notes.

### 2. Key Ideas and Considerations Identified
Extract and list the main ideas, considerations, decisions, or plans mentioned in the notes. For each idea, briefly describe:
- What the idea is about
- The context or reasoning behind it
- Any concerns or questions raised

### 3. Evidence Collection and Research
For each key idea or consideration identified, use web search to collect relevant evidence. For each idea, provide:
- **Supporting Evidence**: Research, data, case studies, or examples that support the idea
- **Counterarguments or Challenges**: Alternative perspectives, potential issues, or limitations
- **Real-world Examples**: Similar implementations, success stories, or relevant cases
- **Current Context**: Latest trends, best practices, or expert opinions related to the idea
- **Source Links**: Include links to the sources you found (must be valid, accessible URLs)

### 4. Idea Evaluation
Evaluate each key idea based on the evidence collected. For each idea, assess:
- **Feasibility**: How realistic and achievable is this idea?
- **Strengths**: What are the advantages and positive aspects?
- **Weaknesses or Risks**: What are the potential challenges, limitations, or risks?
- **Viability**: Is this idea well-founded? What evidence supports or challenges it?
- **Recommendations**: Based on the evidence, what are your recommendations for this idea?

### 5. Patterns and Connections
Analyze patterns, recurring themes, or connections between different ideas in the notes. Highlight how different ideas relate to each other and how evidence from one area might inform another.

### 6. Action Items and Next Steps
Based on your evaluation, identify:
- Validated action items that are well-supported by evidence
- Areas that need further research or consideration
- Recommended next steps with priorities

### 7. Questions and Open Topics
Identify any questions raised, uncertainties mentioned, or topics that need further investigation. Suggest specific research directions or information gaps that should be addressed.

### 8. Overall Assessment
Provide a summary assessment of:
- The overall quality and coherence of the ideas presented
- The strength of evidence supporting the main considerations
- Key insights from your research that might inform future thinking

Format your response as a well-structured analysis report with clear sections, headings, and bullet points. Include source links in markdown format: [Link Text](URL). Use a professional yet personal tone that reflects the nature of analyzing personal notes while providing evidence-based evaluation.`;

  // Run the analysis task
  const events = agent.runTask(
    taskPrompt,
    "claude-sonnet-4-20250514",
  );
  
  // Process the results with detailed logging
  console.log("🚀 Starting note analysis...\n");
  
  const collectedContent: string[] = [];
  
  for await (const event of eachValueFrom(events)) {
    switch (event.type) {
      case 'text':
        console.log('💬 Agent response:');
        console.log(event.content);
        console.log('');
        collectedContent.push(event.content);
        break;
        
      case 'tool_use':
        console.log(`🔧 Using tool: ${event.content.name}`);
        if (event.content.input) {
          console.log('   Input:', JSON.stringify(event.content.input, null, 2));
        }
        break;
        
      case 'tool_result':
        console.log('📊 Tool result received');
        break;
        
      default:
        console.log(`📦 Event: ${event.type}`);
    }
  }
  
  // Save analysis results to file
  const outputContent = collectedContent.join("");
  
  // Format date as YYYY_MM_DD
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateString = `${year}_${month}_${day}`;
  
  // Ensure output directory exists
  const outputDirectory = "./notes";
  try {
    await Deno.mkdir(outputDirectory, { recursive: true });
  } catch (error) {
    // Directory might already exist, ignore the error
    if (!(error instanceof Deno.errors.AlreadyExists)) {
      console.error(`⚠️  Warning: Could not create output directory: ${error}`);
    }
  }
  
  const outputPath = `${outputDirectory}/summary_${dateString}.txt`;
  
  try {
    await Deno.writeTextFile(outputPath, outputContent);
    console.log(`\n✅ Note analysis completed! Report saved to: ${outputPath}`);
  } catch (error) {
    console.error(`\n❌ Failed to write output file: ${error}`);
    throw error;
  }
}

// Run the main function
if (import.meta.main) {
  main().catch((error) => {
    console.error("Fatal error:", error);
    Deno.exit(1);
  });
}

