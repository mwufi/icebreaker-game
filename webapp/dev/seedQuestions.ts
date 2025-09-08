
import { init, tx, id } from '@instantdb/admin';

// Initialize InstantDB admin client
const db = init({
    appId: 'c9101835-8d47-43cd-bb30-ff27dda49da7',
    adminToken: process.env.INSTANT_APP_ADMIN_TOKEN!,
});

// Define all questions, grouped by day
const questionBatches = [
    {
        day: 1,
        label: "Personal life",
        questions: [
            {
                text: "What is your favorite book and why do you like it?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "If you had three extra hours on a Sunday to do something other than work, what would you be doing?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "What's something you wish people would ask or talk to you about?",
                isCreatedbySystem: true,
                isActive: false,
            },
        ],
    },
    {
        day: 2,
        label: "Dreaming big",
        questions: [
            {
                text: "If resources weren't a constraint, what would you build tomorrow?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "What future trend are you most excited or worried about?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "If you could collaborate with anyone in history (living or dead), who would it be and why?",
                isCreatedbySystem: true,
                isActive: false,
            },
        ],
    },
    {
        day: 3,
        label: "Company values",
        questions: [
            {
                text: "Why do you want to build a company?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "What values (integrity, speed, collaboration, etc.) would you want to cultivate in your company or team?",
                isCreatedbySystem: true,
                isActive: false,
            },
            {
                text: "Are you about 996 or WLB?",
                isCreatedbySystem: true,
                isActive: false,
            },
        ],
    },
];

async function seedQuestions() {
    console.log('Starting to seed questions...');

    // First, get all existing questions
    const data = await db.query({
        activityQuestions: {}
    });

    const existingQuestions = data.activityQuestions || [];
    const existingQuestionTexts = new Set(existingQuestions.map(q => q.questionText));

    // Prepare all questions to be added
    const questionsToAdd: any[] = [];
    const questionsToUpdate: any[] = [];

    // Get the active day from command line argument or default to 1
    const activeDay = process.argv[2] ? parseInt(process.argv[2]) : 1;
    console.log(`Setting questions active for day ${activeDay}`);

    for (const batch of questionBatches) {
        for (const question of batch.questions) {
            const shouldBeActive = batch.day === activeDay;
            
            if (!existingQuestionTexts.has(question.text)) {
                // New question to add
                questionsToAdd.push(tx.activityQuestions[id()].update({
                    questionText: question.text,
                    isCreatedbySystem: question.isCreatedbySystem,
                    isActive: shouldBeActive,
                    tags: batch.label,
                }));
            } else {
                // Existing question - update active status
                const existingQuestion = existingQuestions.find(q => q.questionText === question.text);
                if (existingQuestion) {
                    questionsToUpdate.push(tx.activityQuestions[existingQuestion.id].update({
                        isActive: shouldBeActive,
                        tags: batch.label,
                    }));
                }
            }
        }
    }

    // Set all other questions to inactive
    for (const existingQuestion of existingQuestions) {
        const isInCurrentBatch = questionBatches.some(batch => 
            batch.questions.some(q => q.text === existingQuestion.questionText)
        );
        
        if (!isInCurrentBatch) {
            questionsToUpdate.push(tx.activityQuestions[existingQuestion.id].update({
                isActive: false,
            }));
        }
    }

    // Execute all transactions
    if (questionsToAdd.length > 0) {
        console.log(`Adding ${questionsToAdd.length} new questions...`);
        await db.transact(questionsToAdd);
    }

    if (questionsToUpdate.length > 0) {
        console.log(`Updating ${questionsToUpdate.length} existing questions...`);
        await db.transact(questionsToUpdate);
    }

    console.log('Questions seeded successfully!');
    console.log(`Active questions are from day ${activeDay}: ${questionBatches.find(b => b.day === activeDay)?.label}`);

    // Verify the results
    const finalData = await db.query({
        activityQuestions: {
            $: {
                where: {
                    isActive: true
                }
            }
        }
    });

    console.log(`\nActive questions (${finalData.activityQuestions?.length || 0}):`);
    finalData.activityQuestions?.forEach(q => {
        console.log(`- ${q.questionText} (tags: ${q.tags})`);
    });

    process.exit(0);
}

// Run the seeding script
seedQuestions().catch(console.error);