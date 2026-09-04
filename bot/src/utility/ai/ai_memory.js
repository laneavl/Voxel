const getConnection = require('../../functions/database/connectDatabase');
const { GoogleGenAI } = require('@google/genai');
const config = require('../../config/config');

const gemini = new GoogleGenAI({
    apiKey: config.bot.geminiApiKey
});

// Get the user's global long-term memories
async function getMemories(guildId, userId) {
    const connection = await getConnection();
    try {
        const [memories] = await connection.query(
            `SELECT memory_key, memory
            FROM ai_memories
            WHERE user_id = ?
            ORDER BY updated_at DESC
            LIMIT 50`,
            [userId]
        );
        return memories;
    } finally {
        connection.release();
    }
}

// Save or update the user's global long-term memories.
// Memories are uniquely identified by:
//      user_id + memory_key
//
// This means a memory created in a DM
// can be used inside a server, and vice verse

async function saveMemories(
    guildId,
    guildname,
    userId,
    username,
    memories
) {
    if (!memories || memories.length === 0) {
        return;
    }

    const connection = await getConnection();

    try {
        for (const memory of memories) {
            if (!memory.key || !memory.memory) {
                continue;
            }

            await connection.query(
                `INSERT INTO ai_memories
                    (guild_id, guild_name, user_id, username, memory_key, memory)
                values (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    guild_id = VALUES(guild_id),
                    memory = VALUES (memory),
                    updated_at = CURRENT_TIMESTAMP`,
                [
                    guildId,
                    guildname,
                    userId,
                    username,
                    memory.key,
                    memory.memory
                ]
            );
        }
    } finally {
        connection.release();
    }
}

// Convert memories into context for Gemini
function formatMemoryContext(memories) {
    if (!memories || memories.length === 0) {
        return '';
    }

    return `
    KNOWN INFORMATION ABOUT THIS USER:
    
    ${memories.map(memory => `- ${memory.memory}`).join('\n')}
    `;
}

// Ask Gemini to determine whether anything from the conversation should be remembered.
async function extractMemories(
    prompt,
    responseText,
    existingMemories
) {
    try {
        const existingMemoryText =
            existingMemories.length > 0
                ? existingMemories
                    .map(memory =>
                        `- [${memory.memory_key}] ${memory.memory}`
                    )
                    .join('\n')
                : 'None';

        const memoryResponse =
            await gemini.models.generateContent({
                model: 'gemini-3.5-flash-lite',
                config: {
                    systemInstruction: `
                        You are Voxels's long-term memory manager.
                        Your job is to identify useful, persistent facts about the user.                       
                        Only remember information that is genuinely useful in future conversations.                       
                        
                        GOOD MEMORY:                        
                        - User preferences                       
                        - User interests                        
                        - User hobbies                       
                        - User goals                        
                        - User projects                       
                        - User occupation or area of work                       
                        - User technical experience
                        - User's relationship status                       
                        - Frequently used technologies                      
                        - Important personal preferences                       
                        - Names the user explicitly gives you                       
                        - Devices, vehicles, computers, servers, or other projects                      
                        - Long-term plans
                        
                        
                        DO NOT STORE:                        
                        - Temporary questions                       
                        - One-time requests                        
                        - Random facts                       
                        - Information about other people                       
                        - Secrets                       
                        - Passwords                       
                        - API keys                      
                        - Authentication credentials                      
                        - Sensitive financial information                      
                        - Medical information                     
                        - Anything inappropriate to retain                        
                        
                        EXISTING MEMORIES:                       
                        ${existingMemoryText}
                                               
                        MEMORY KEYS:                       
                        Each memory must have a short, stable key describing the concept.
                                               
                        Examples:                        
                        favorite_programming_language                       
                        discord_bot_name                       
                        occupation                      
                        favorite_color                       
                        primary_operating_system                      
                        current_project                       
                        vehicle                      
                        favorite_game
                        
                        
                        IMPORTANT:                       
                        If the user provides new information that changes an existing memory,                       
                        use the SAME memory key.
                        
                        Example:                       
                        Existing memory:                     
                        [discord_bot_name] User's Discord bot is named Pixel.
                        
                        User says:                       
                        "My Discord bot is actually called PixelBot now."
                        
                        Return:                       
                        [
                            {
                                "key": "discord_bot_name",
                                "memory": "User's Discord bot is named PixelBot."
                            }
                        ]
                        
                        
                        Do NOT create a new key for the same concept.                       
                        If the information is already contained in an existing memory,                       
                        return nothing for that fact.       
                        If the user says something that is genuinely new, create a new memory.
                                              
                        Return ONLY valid JSON.                        
                        Format:                        
                        [
                            {
                                "key": "memory_key",
                                "memory": "Information worth remembering."
                            }
                        ]
                        
                        If there is nothing worth remembering:                       
                        []
                    `
                },
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `USER MESSAGE: ${prompt}
                                AI RESPONSE: ${responseText}`
                            }
                        ]
                    }
                ]
            });

        const text = memoryResponse.text.trim();

        // Remove Markdown code fences if Gemini
        // happens to wrap the JSON in them.
        const cleaned = text
            .replace(/^```json\s*/i, '')
            .replace(/^```\s*/i, '')
            .replace(/\s*```$/i, '')
            .trim();

        const memories = JSON.parse(cleaned);

        if (!Array.isArray(memories)) {
            return [];
        }

        return memories.filter(memory =>
            memory &&
            typeof memory.key === 'string' &&
            typeof memory.memory === 'string' &&
            memory.key.trim().length > 0 &&
            memory.memory.trim().length > 0
        );
    } catch (error) {
        console.error(
            'MEMORY EXTRACTION ERROR:',
            error
        );

        return [];
    }
}

module.exports = {
    getMemories,
    saveMemories,
    formatMemoryContext,
    extractMemories
}