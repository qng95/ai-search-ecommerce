# NLP product filter (AI/LLM Search)

This work is based on the original project located at this Bitbucket repository.

```bash
git clone https://ecommerce-assignment-admin@bitbucket.org/ecommerce-assignment/ecommerce.git
```

## Observation

I noticed that in the original project mock products is being fetched from `https://fakestoreapi.com/products/`.

That API return a list of products as JSON with the following schema.

```json
[
  _ {
    "id": 0,
    "title": "string",
    "price": 0.1,
    "description": "string",
    "category": "string",
    "image": "http://example.com"
  }
]
```

The first simple idea is to use an LLM API like OpenAI or Google Gemini, then filter the JSON products list based what AI understand about user's need.

For example if user say `I want to find some birthday gift for my tech-nerd friend.`, then AI should understand and filter only tech products. Same idea apply to price.

## What tech was chosen

To quickly prototype this feature, I chose to use Vercel AI SDK and Google Gemini API.

Why Vercel AI SDK ?

-   It is one of few AI SDK for JavaScript / TypeScript that support both AI App development on Backend and Frontend. Therefore further extension on more use cases is possible.
-   It is AI API and UI Framework agnostic. This means we doesn't have to tied to a single provider like OpenAI AI SDK or to stick with React or NextJS.
-   Vercel AI SDK provide comprehensive tools for exploiting every AI capabilities, especially in our case we need JSON schema formated output as we will give it JSON and asking it to filter and sendout JSON again.

Why Google Gemini API?

-   Simple Gemini model is quite strong and they provide generous free-tier limits.

## Implementation Explaination

> In the implementation, I tried to follow the current pattern of the project. Because, we work in team.

> Was I vibe-coded ? Yes, but in a controlled manner. VSCode, Copilot Agent Mode and Claude 4 was used. This help to scope the access and changes of AI to specific files and contexts.

> All file listed below should also have comments explains the code.

-   api/routes/llmRoute.js:
    -> This defined a POST endpoint `/ai/filter`. This endpoint receive request for filtering data based on user prompt from client side.
-   api/controllers/llmController.js:
    -> This implement a function which will be called when endpoint `/ai/filter` is requested.
-   src/components/Products.jsx:
    -> This implement the search bar to get user search term as the prompt, some indicating modal, and spinner for users because AI search feature may have high latency.
-   api/app.js:
    -> Here we add llm route to the Express app.
-   api/.env:
    -> Here added `GOOGLE_GENERATIVE_AI_API_KEY` configuration key for Google AI Studio Gemini API Key. This will be automatically used by Vercel AI Studio for connecting to Google Gemini API.

How does this works ?

1.  User enter search term in the search bar. E.g. `Find something prestigious for my wife`
    ![](/api/data/images/Screenshot_2025-07-17_at_15.32.52.png)

2.  Submit the full dataset, searchTerm to backend for AI filtering.
    ![Showing indicator modal while waiting](/api/data/images/Screenshot_2025-07-17_at_15.32.58.png)

    a. The request is send out from `handleAISearch` callback in `src/components/Products.jsx`.

    b. This request will be handled by `filterProduct` function in `api/controllers/llmController.js`.
    It will drafting a prompt and send it to LLM for processing. Then the output will be parsed to an object and send back to frontend side. Vercel AI SDK is very good at handling structured output from LLM, if LLm output something doesn't match then Vercel will retry until the output match with the `schema`.

    ```javascript
    const { object } = await generateObject({
        model: google('models/gemini-2.0-flash-exp'), // here we use this model because it supports structured outputs and free
        providerOptions: {
            google: {
                structuredOutputs: true, // this is to turn on structured outputs capability of the model
            },
        },
        // This is to enfore the output to be an array of objects with the specified schema.
        // Here the schema should match with what client side code expected.
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
    ```

3.  Client side code receive the result data and display.
    ![](/api/data/images/Screenshot_2025-07-17_at_15.33.17.png)

## Extending AI search ideas

This was just a simple implementation to show the idea of how AI can help to optimize user experience and creating a simple but smarter product search.

However there are still idea on how to extend this further.

1. Instead of filtering on final dataset which is not realistic in realife with huge data and pagination or infinite scrolling. We can use AI to customize data query against database based on user search term.

2. The GUI can simply be changes from conventional e-commerce webapp to Chat-like-UI. Where user chat to find the products fit their needs and products list will be dynamically generated to show on the Chat UI. This is something call In-Chat-Shopping, which can also be done using Vercel AI SDK. Utilizing this approach, we can gain deeper user insight and analyze trends easily.

https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces
https://openai.com/chatgpt/search-product-discovery/

![](/api/data/images/Screenshot_2025-07-17_at_15.54.27.png)

3. Ulitize VLM for product similarity search. Imagine user take a picture of a sample product and asking to find something similar with cheaper price.

4. Utilize Text-to-speech or Speech-to-text to enhance user experience or approach customer with limited capabilities.

## Comment on the othee 2 options from the challenge

🧠 Option B – Dynamic Pricing Engine

-> Utilizing LLM and Graph database to analyzing sentiment and trends. We can easily finding out current hottest product and do dynamic pricing.

🧠 Option C – Recommendation System
-> Switch to In-Chat-Shopping and utlize LLM for analyzing customer inputs and search. We could easily run a preriodic product filtering for smart recommendation system.

## Bonus (Optional)

> Write 2–3 sentences describing how this AI could be integrated with blockchain features (e.g., token-gated pricing, on-chain user preferences, loyalty smart contracts).

AI features can be integrated into blockchain systems via Oracle networks and hybrid smart contracts. While smart contracts are deterministic and limited to on-chain data, oracles allow them to securely access off-chain information. This enables the use of AI models running on conventional systems to provide real-time inputs to smart contracts.

For example, an AI model can analyze market trends, user behavior, or contextual signals and then send predictions—such as price forecasts, risk scores, or personalized preferences—back to the blockchain through a decentralized oracle network. These dynamic values can then influence smart contract logic, such as adaptive pricing, automated trading strategies, or tailored rewards in loyalty programs.

This architecture combines blockchain’s transparency and security with AI’s adaptability and intelligence, making decentralized applications far more responsive and user-aware.

---

## Run Locally

Clone the project

```bash
  git clone https://github.com/qng95/ai-search-ecommerce
```

Go to the project directory

```bash
  cd ai-search-ecommerce
```

Install dependencies

```bash
  npm install

  or

  npm install react-material-ui-carousel --save --legacy-peer-deps
```

Start the server

```bash
  npm run start
```

The server should now be running. You can access the application by opening a web browser and entering the following URL:

```bash
  http://localhost:3000
```

The API server should be running at

```bash
  http://localhost:4000
```
