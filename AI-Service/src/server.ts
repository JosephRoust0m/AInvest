import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from "body-parser";
import axios from 'axios';
import { promises as fs } from 'fs';

dotenv.config();

interface OpenAIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

const app: express.Application = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Reject requests that don't come from the API gateway
app.use((req, res, next) => {
    if (req.path === '/health') return next();
    const secret = req.headers['x-gateway-secret'];
    if (!secret || secret !== process.env.GATEWAY_SECRET) {
        return res.status(403).json({ error: 'Access denied: requests must originate from the API gateway' });
    }
    next();
});

const PORT = process.env.PORT || 3000;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_API_KEY = process.env.API_KEY;
const API_URL = "https://api.polygon.io";
const config = {
    headers: {
        'Authorization': `Bearer ` + process.env.POLYGON_API_KEY
    }
};
const STOCK_PREDICTOR_URL = process.env.STOCK_PREDICTOR_URL;

const FINANCIAL_SYSTEM_PROMPT = `You are a specialized Financial AI Assistant focused on finance, investing, and market-related topics.

INSTRUCTIONS:
1. Interpret questions precisely - if there's ANY connection to finance, markets, economy, business, or investing, answer the question
2. For clearly finance-related questions: provide detailed, helpful responses
3. For general market questions (like "how does the market look today", "what's happening in the economy"): treat these as financial topics and provide market analysis
4. For business or economic news questions: answer them as they relate to financial markets
5. ONLY reject questions that are completely unrelated to finance, business, economics, or markets (like personal relationships, cooking, sports results, etc.)
6. If rejecting, respond EXACTLY with: "I can only assist with financial and investment-related topics. Please ask about stocks, investments, market analysis, or other financial matters."

Finance-related topics include (interpret precisely without being too long):
- Stocks, bonds, securities, investments
- Financial markets and trading  
- Personal finance and financial planning
- Economic indicators and market analysis
- Cryptocurrency and digital assets
- Corporate finance and business valuation
- Banking, loans, and credit
- Insurance and financial products
- Economic policy and monetary policy
- General market conditions and trends
- Business news and corporate earnings
- Economic events and their market impact

When answering financial questions:
- Provide accurate information with current market context.
- Answer in 10-15 lines maximum and in a paragraphed format.
- Include relevant financial metrics and ratios when applicable
- Explain financial concepts clearly

Remember: Be flexible and interpret questions generously - if there's any business, economic, or market angle, treat it as finance-related.`;

// Function to validate stock symbol format
async function isValidStockSymbol(symbol: string): Promise<boolean> {
    if (!symbol || typeof symbol !== 'string') {
        return false;
    }
        
        const cleanSymbol = symbol.trim().toUpperCase();
    try {
        const response = await axios.get(`${API_URL}/v3/reference/tickers`, {
            params: {
                ticker: cleanSymbol,
                active: true,
                limit: 1
            },
            headers: {
                'Authorization': `Bearer ${process.env.POLYGON_API_KEY}`
            }
        });

        return response.data && response.data.results && response.data.results.length > 0;
    } catch (error) {
        console.error('Error validating stock symbol:', error);
        return false;
    }
}

// Function to enhance financial queries for better results
function enhanceFinancialQuery(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Add context for stock-related queries
    if (lowerMessage.includes('stock') || lowerMessage.includes('share')) {
        return `${message}\n\nPlease provide current market analysis including key financial metrics, recent performance, and relevant market context.`;
    }
    
    // Add context for investment queries
    if (lowerMessage.includes('invest') || lowerMessage.includes('portfolio')) {
        return `${message}\n\nPlease include risk assessment, diversification considerations, and current market conditions in your response.`;
    }
    
    // Add context for market queries
    if (lowerMessage.includes('market') || lowerMessage.includes('economy')) {
        return `${message}\n\nPlease provide comprehensive market analysis with recent trends, key indicators, and potential implications.`;
    }
    
    // Add context for crypto queries
    if (lowerMessage.includes('crypto') || lowerMessage.includes('bitcoin') || lowerMessage.includes('ethereum')) {
        return `${message}\n\nPlease include volatility analysis, regulatory considerations, and compare with traditional assets.`;
    }
    
    return `${message}\n\nPlease provide detailed financial analysis with relevant metrics and current market context.`;
}

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Financial ChatBot API',
        version: '1.0.0'
    });
});

app.post('/api/chat', async (req: Request, res: Response) => {
    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        // Enhanced query for better financial context
        const enhancedMessage = enhanceFinancialQuery(message);
        
        // Single call - AI decides if finance-related and responds accordingly
        const messageToOpenAI: OpenAIMessage[] = [
            {
                role: 'system',
                content: FINANCIAL_SYSTEM_PROMPT,
            },
            {
                role: 'user',
                content: enhancedMessage,
            },
        ];

        const response = await generateAIResponse(messageToOpenAI);

        const isRejected = response.includes("I can only assist with financial and investment-related topics");
        
        if (isRejected) {
            return res.status(400).json({ 
                error: response,
                suggestion: 'Try asking about: stock analysis, investment strategies, market trends, portfolio management, or economic indicators.',
                classification: 'non-financial'
            });
        }
        
        res.json({ 
            response,
            query_enhanced: enhancedMessage !== message,
            original_query: message,
            classification: 'financial'
        });
    } catch (err) {
        console.error('Chatbot error:', err);
        res.status(500).json({ error: 'Internal server error. Please try again.' });
    }
});


async function generateAIResponse(message: OpenAIMessage[]): Promise<string> {
    try {
        const response = await axios.post(
          OPENAI_API_URL,
          {
            model: "gpt-3.5-turbo",
            messages: message,
          },
          {
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
    
        return response.data.choices[0].message.content;
      } catch (error: any) {
        console.error('Error calling OpenAI API:', error.message);
        throw new Error('Failed to fetch response from OpenAI');
      }
}

// This will be tested in real interaction

app.post("/api/predict", async (req: Request, res: Response) => {
    const stock = req.body.stock;
    const timeframe = req.body.timeframe;
    
    // Validate required fields
    if (!stock || !timeframe) {
        return res.status(400).json({ 
            error: 'Both stock symbol and timeframe are required',
            details: 'Please provide both stock and timeframe in the request body'
        });
    }
    
    // Validate stock symbol format
    if (!isValidStockSymbol(stock)) {
        return res.status(400).json({ 
            error: 'Invalid stock symbol format',
            details: 'Stock symbol must be 1-5 uppercase letters (e.g., AAPL, MSFT, BRK.A)',
            provided: stock
        });
    }
    
    // Validate timeframe
    const validTimeframes = ["10", "50", "365", 10, 50, 365];
    if (!validTimeframes.includes(timeframe)) {
        return res.status(400).json({ 
            error: 'Invalid timeframe',
            details: 'Timeframe must be 10, 50, or 365 days',
            validOptions: ["10", "50", "365"],
            provided: timeframe
        });
    }
     
    try {
        let adviceResult = await advice(stock.toUpperCase(), timeframe);
        let finalScore = typeof adviceResult === 'object' ? adviceResult.action : adviceResult;
        const averagePrice =  adviceResult.average_price_predictiion;
        const advices = [];
        if (timeframe === "10") {
            
            advices.push(finalScore);

            // Fine tuning the model
            for (let i = 0; i < 7; i++) {
                const adviceData = await advice(stock.toUpperCase(), timeframe);
                const score = typeof adviceData === 'object' ? adviceData.action : adviceData;
                advices.push(score);
            }
            
        } else if (timeframe === "50") {
            
            advices.push(finalScore);

            // Fine tuning the model
            for (let i = 0; i < 4; i++) {
                const adviceData = await advice(stock.toUpperCase(), timeframe);
                const score = typeof adviceData === 'object' ? adviceData.action : adviceData;
                advices.push(score);
            }
        }
            const mean = advices.reduce((sum, num) => sum + num, 0) / advices.length;
            finalScore = mean;
        
        let action = "";
        
        
        if (finalScore > 0.5) {
            action = "Buy";
        } else if (finalScore < -0.5) {
            action = "Sell";
        } else {
            action = "Hold";
        }

        res.json({
            average_price_prediction: averagePrice,
            action: action,
            stock_symbol: stock.toUpperCase()
        });
    } catch (error: any) {
        console.error('Error processing stock prediction:', error);
        res.status(500).json({
            error: 'Failed to process stock prediction',
            details: 'An error occurred while analyzing the stock. Please try again.',
            stock_symbol: stock
        });
    }
});

async function advice(stockname: string, period: string | number) {
    const periodNum = typeof period === 'string' ? parseInt(period) : period;

    const prices: number[] = [];
    const news: number[] = [];
    let averageScore :number = 0;
    const date = new Date();
    const start = new Date();
    let averageNews :number = 0;

    start.setDate(date.getDate() - periodNum);
  
    const day1 = start.getDate();
    let month1 = start.getMonth();
    month1++;
    const year1 = start.getFullYear();
  
    const day = date.getDate();
    let month = date.getMonth();
    month++;
    const year = date.getFullYear();

    let finalPeriod = periodNum;

    const dayStr = day < 10 ? "0" + day : day.toString();
    const day1Str = day1 < 10 ? "0" + day1 : day1.toString();
    const monthStr = month < 10 ? "0" + month : month.toString();
    const month1Str = month1 < 10 ? "0" + month1 : month1.toString();

    try {
        const response = await axios.get(API_URL + `/v2/aggs/ticker/${stockname}/range/1/day/${year1}-${month1Str}-${day1Str}/${year}-${monthStr}-${dayStr}?adjusted=true&sort=asc`, config);
        const response2 = await axios.get(API_URL + `/v2/reference/news?ticker=${stockname}&order=desc&limit=100`, config);
        const data = response.data["results"];
        const data2 = response2.data["results"];


        // Extract the closing prices from the data
        for (let i = 0; i < data.length; i++) {
            const price = parseFloat(data[i]["c"]);
            prices.push(price);
        }

        const ML_score = await axios.post(STOCK_PREDICTOR_URL + '/analyze', {
            information: prices,
        },
        {
            headers: {
            'Content-Type': 'application/json',
            'X-Gateway-Secret': process.env.GATEWAY_SECRET || '',
            }
        });
        console.log("News price scores:", ML_score.data.score_prediction);
          
        const averageML = ML_score.data.score_prediction;
        const averageMLChange = ML_score.data.rate_of_change;
        // Sentiment analysis of the news articles
        if (finalPeriod !== 0) {
            for (let i = 0; i < finalPeriod; i++) {
                try {
                    if (typeof(data2[i]["insights"]) === "object") {
                        const insights = data2[i]["insights"];
                        
                        for (let j = 0; j < insights.length; j++) {
                            if (insights[j]["ticker"] === stockname) {
                                const sentiment = insights[j]["sentiment"];
                                
                                if (sentiment === "bearish") {
                                    news.push(-2);
                                } else if (sentiment === "bullish") {
                                    news.push(2);
                                } else if (sentiment === "negative") {
                                    news.push(-1);
                                } else if (sentiment === "positive") {
                                    news.push(1);
                                } else {
                                    news.push(0.1);
                                }
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error processing news insights:", err);
                }
            }
            
            const ML_news_score = await axios.post(STOCK_PREDICTOR_URL + '/analyze', {
                information: news
            },
            {   
                headers: {
                'Content-Type': 'application/json',
                'X-Gateway-Secret': process.env.GATEWAY_SECRET || '',
                },
            });
            
            console.log("News sentiment scores:", ML_news_score.data.score_prediction);
            averageNews = (ML_news_score.data.score_prediction) / 100;
        }
        
        averageScore = averageMLChange + averageNews / 2;

        return {
            "average_price_predictiion": averageML as number,
            "action": averageScore as number
        };

    } catch (error: any) {
        console.error('Error in advice function:', error.message);
        return error.message;
    }
}


// Export app for testing
export { app, enhanceFinancialQuery, isValidStockSymbol };

// Only start server if this file is run directly (not imported for testing)
if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}