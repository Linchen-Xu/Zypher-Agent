# Note Summarizer

An intelligent note analysis agent that reads your personal notes and thoughts, collects relevant evidence from the web, and provides comprehensive evaluations of your ideas.

## Features

- **Automatic Note Reading**: Automatically reads all text files from `./notes/docs/` directory
- **Evidence Collection**: Uses web search to gather supporting evidence, counterarguments, and real-world examples for your ideas
- **Idea Evaluation**: Provides comprehensive evaluation of your ideas including feasibility, strengths, weaknesses, and recommendations
- **Structured Analysis**: Generates well-organized analysis reports with clear sections and source citations

## Requirements

- **Deno**: Version 1.30.0 or higher
- **Anthropic API Key**: Required for Claude AI model access

## Installation

1. [**Install Deno**](https://docs.deno.com/runtime/getting_started/installation/)

2. **Clone or download this project**

3. **Install dependencies** (if needed):
   ```bash
   deno add jsr:@corespeed/zypher
   deno add npm:rxjs-for-await
   ```

## Configuration

1. **Get your Anthropic API Key**:
   - Sign up at https://console.anthropic.com/
   - Create an API key in the API Keys section

2. **Create a `.env` file** in the project root directory, and copy the key to your `.env` file:

   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

## Key Project Structure

```
.
├── note-summarizer.ts    # Main agent script
├── .env                  # Environment variables (create this)
└── notes/
    ├── docs/             # Input: Place your .txt note files here
    │   ├── note1.txt
    │   ├── note2.txt
    │   └── ...
    └── summary_YYYY_MM_DD.txt  # Output: Generated analysis reports
```

## Usage

1. **Prepare your notes**:
   - Place your text files (`.txt` format) in the `./notes/docs/` directory
   - The agent will automatically read all `.txt` files from this directory

2. **Run the agent**:
   ```bash
   deno run --A note-summarizer.ts
   ```

3. **View the results**:
   - The analysis report will be saved to `./notes/summary_YYYY_MM_DD.txt`
   - The report includes evidence collection, idea evaluation, and recommendations

## Output Report Structure

The generated analysis report includes:

1. **Executive Summary**: Overview of main themes and ideas
2. **Key Ideas and Considerations Identified**: Extracted ideas with context
3. **Evidence Collection and Research**: 
   - Supporting evidence with source links
   - Counterarguments and challenges
   - Real-world examples
   - Current trends and best practices
4. **Idea Evaluation**: 
   - Feasibility assessment
   - Strengths and weaknesses
   - Risk analysis
   - Recommendations
5. **Patterns and Connections**: Relationships between different ideas
6. **Action Items and Next Steps**: Validated action items based on evidence
7. **Questions and Open Topics**: Areas needing further investigation
8. **Overall Assessment**: Summary evaluation of all ideas
