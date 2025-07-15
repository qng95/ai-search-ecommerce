import * as webllm from "@mlc-ai/web-llm";

class WebLLMService {
  constructor() {
    this.engine = null;
    this.isLoading = false;
    this.isLoaded = false;
  }

  initProgressCallback(progress) {
    console.log("Model loading progress:", progress);
  };

  async initializeEngine() {
    if (this.isLoaded || this.isLoading) return;
    
    this.isLoading = true;
    try {
      // Initialize WebLLM engine with a lightweight model
      this.engine = await webllm.CreateMLCEngine("Llama-3.2-1B-Instruct-q4f32_1-MLC", {initProgressCallback: this.initProgressCallback});
      this.isLoaded = true;
      console.log("WebLLM engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize WebLLM:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async analyzeSearchQuery(query, products) {
    if (!this.isLoaded) {
      await this.initializeEngine();
    }

    const systemPrompt = `You are an AI assistant specialized in filtering e-commerce products based on user queries. 
Your task is to analyze user input and return a JSON array of product IDs that match the query.

Available product data format:
{
  "id": number,
  "title": "string",
  "price": number,
  "description": "string", 
  "category": "string",
  "image": "string"
}

Available categories: "men's clothing", "women's clothing", "jewelery", "electronics"

Examples:
1. Query: "cheap electronics under $100"
   Response: [1, 5, 8] (IDs of electronics products under $100)

2. Query: "women's clothing for summer"
   Response: [3, 7, 12] (IDs of women's clothing items)

3. Query: "comfortable laptop for work"
   Response: [2, 9] (IDs of laptop/computer products)

4. Query: "jewelry for gifts"
   Response: [4, 6, 10] (IDs of jewelry items)

5. Query: "expensive luxury items"
   Response: [1, 3, 5] (IDs of high-priced items)

Instructions:
- Analyze the user query for intent, category, price range, and specific requirements
- Consider synonyms and related terms (e.g., "laptop" relates to electronics, "shirt" to clothing)
- For price queries, consider the actual prices of products
- Return ONLY a JSON array of matching product IDs
- If no products match, return an empty array []
- Do not include any explanation or additional text

User Query: "${query}"

Products to filter:
${JSON.stringify(products, null, 2)}`;

    try {
      const response = await this.engine.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: `Filter products based on: "${query}"`
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      });

      const content = response.choices[0].message.content.trim();
      console.log("AI response:", content);
      
      // Extract JSON array from response
      const jsonMatch = content.match(/\[[\d,\s]*\]/);
      if (jsonMatch) {
        const productIds = JSON.parse(jsonMatch[0]);
        return productIds.filter(id => products.find(p => p.id === id));
      }
      
      return [];
    } catch (error) {
      console.error("Error analyzing search query:", error);
      return [];
    }
  }

  async filterProducts(query, products) {
    if (!query || query.trim() === "") {
      return products;
    }

    // For simple keyword searches, use basic filtering
    const simpleKeywords = ['all', 'show', 'list', 'products'];
    if (simpleKeywords.some(keyword => query.toLowerCase().includes(keyword))) {
      return products;
    }

    try {
      const matchingIds = await this.analyzeSearchQuery(query, products);
      
      if (matchingIds.length === 0) {
        // Fallback to basic text search if AI doesn't find matches
        return products.filter(product =>
          product.title.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
      }

      return products.filter(product => matchingIds.includes(product.id));
    } catch (error) {
      console.error("Error filtering products:", error);
      // Fallback to basic search on error
      return products.filter(product =>
        product.title.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.category.toLowerCase().includes(query.toLowerCase())
      );
    }
  }

  getLoadingStatus() {
    return {
      isLoading: this.isLoading,
      isLoaded: this.isLoaded
    };
  }
}

const webllmService = new WebLLMService();
export default webllmService;
