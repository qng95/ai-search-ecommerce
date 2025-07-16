const { generateObject } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');

exports.filterProduct = async (req, res) => {
    const { searchTerm, data } = req.body;

    if (!searchTerm || !data) {
        return res
            .status(400)
            .json({ error: 'searchTerm and data is required' });
    }

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.0-flash-exp'),
            providerOptions: {
                google: {
                    structuredOutputs: true,
                },
            },
            schema: z.array(
                z.object({
                    id: z.number(),
                    title: z.string(),
                    price: z.number(),
                    description: z.string(),
                    category: z.string(),
                    image: z.string(),
                })
            ),
            system: `Your are a smart product filter.
                    You will be given a user search term and a list of products as json object array.
                    The user search term is a string that describes what the user is looking for.
                    Your job is to filter the products based on the search term and return a list of products that match the search term.
                    `,
            prompt: `
                    USER: ${searchTerm}
                    PRODUCT LIST: ${JSON.stringify(data)}
                    `,
        });

        res.status(200).json({ success: true, data: object });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
