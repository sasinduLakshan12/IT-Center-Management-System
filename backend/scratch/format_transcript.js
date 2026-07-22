const fs = require('fs');
const path = require('path');
const readline = require('readline');

const appDataDir = 'C:\\Users\\2021ICTS86\\.gemini\\antigravity';
const conversationId = '02271ee2-bfc5-4ac4-b936-402b9b2e115a';
const transcriptPath = path.join(appDataDir, 'brain', conversationId, '.system_generated', 'logs', 'transcript_full.jsonl');
const outputPath = 'C:\\Users\\2021ICTS86\\Projects\\IT-Center-Management-System\\conversation_chat_history.md';
const outputOneDrivePath = 'C:\\Users\\2021ICTS86\\OneDrive\\Projects\\IT-Center-Management-System\\conversation_chat_history.md';

const run = async () => {
    try {
        if (!fs.existsSync(transcriptPath)) {
            console.error('Transcript file not found at:', transcriptPath);
            return;
        }

        const fileStream = fs.createReadStream(transcriptPath);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });

        let mdContent = `# IT Center Management System - Chat History\n`;
        mdContent += `*Conversation ID: ${conversationId}*\n\n`;
        mdContent += `---\n\n`;

        for await (const line of rl) {
            if (!line.trim()) continue;
            try {
                const step = JSON.parse(line);
                if (step.type === 'USER_INPUT') {
                    mdContent += `### 👤 User\n`;
                    mdContent += `> ${step.content.replace(/\n/g, '\n> ')}\n\n`;
                } else if (step.type === 'PLANNER_RESPONSE') {
                    // Extract the text response part of the agent output
                    let replyText = '';
                    if (step.content) {
                        replyText = step.content;
                    }
                    if (replyText.trim()) {
                        mdContent += `### 🤖 Antigravity (AI)\n`;
                        mdContent += `${replyText}\n\n`;
                        mdContent += `---\n\n`;
                    }
                }
            } catch (err) {
                // Ignore parse errors on truncated lines if any
            }
        }

        fs.writeFileSync(outputPath, mdContent, 'utf8');
        fs.writeFileSync(outputOneDrivePath, mdContent, 'utf8');
        console.log('Conversation exported successfully to:', outputPath);
    } catch (e) {
        console.error(e);
    }
};

run();
