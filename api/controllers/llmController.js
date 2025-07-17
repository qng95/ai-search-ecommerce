const { generateObject } = require('ai');
const { google } = require('@ai-sdk/google');
const { z } = require('zod');

exports.filterProduct = async (req, res) => {
    const { searchTerm, data } = req.body; // split searchTerm and data from request body

    if (!searchTerm || !data) {
        // check if searchTerm and data are provided
        return res
            .status(400)
            .json({ error: 'searchTerm and data is required' });
    }

    try {
        const { object } = await generateObject({
            model: google('models/gemini-2.0-flash-exp'), // here we use this model because it supports structured outputs and free
            providerOptions: {
                google: {
                    structuredOutputs: true, // this is to turn on structured outputs capability of the model
                },
            },
            // This is to enfore the output to be an array of objects with the specified schema
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
            // This is the system prompt to tell the model what to do
            system: `Your are a smart product filter.
                    You will be given a user search term and a list of products as json object array.
                    The user search term is a string that describes what the user is looking for.
                    Your job is to filter the products based on the search term and return a list of products that match the search term.
                    `,
            // This is the user prompt to give information to the model
            // The searchTerm is the user input and data is the list of products
            // USER: is the user input and PRODUCT LIST: is the list of products in json format
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
