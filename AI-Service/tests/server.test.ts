import request from 'supertest';
import { app, enhanceFinancialQuery } from '../src/server';
import axios from 'axios';

// Mock axios for API calls
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Financial ChatBot API Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 1: Health Check Endpoint
    describe('GET /health', () => {
        it('should return health status with correct structure', async () => {
            const response = await request(app).get('/health');
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('status', 'OK');
            expect(response.body).toHaveProperty('timestamp');
            expect(response.body).toHaveProperty('service', 'Financial ChatBot API');
            expect(response.body).toHaveProperty('version', '1.0.0');
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });
    });


    // Test 2: Chatbot Message - Missing Message
    describe('POST /api/chat - Validation', () => {
        it('should return error when message is missing', async () => {
            const response = await request(app)
                .post('/api/chat')
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Message is required');
        });

        it('should return error when message is empty string', async () => {
            const response = await request(app)
                .post('/api/chat')
                .send({ message: '' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error', 'Message is required');
        });
    });

    // Test 3: Chatbot Message - Non-Financial Query
    describe('POST /api/chat - Non-Financial', () => {
        it('should reject non-financial queries', async () => {
            const mockResponse = {
                data: {
                    choices: [{
                        message: {
                            content: 'I can only assist with financial and investment-related topics. Please ask about stocks, investments, market analysis, or other financial matters.'
                        }
                    }]
                }
            };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/api/chat')
                .send({ message: 'What is the weather today?' });
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('error');
            expect(response.body.error).toContain('I can only assist with financial');
            expect(response.body).toHaveProperty('classification', 'non-financial');
            expect(response.body).toHaveProperty('suggestion');
        });
    });

    // Test 4: Chatbot Message - Financial Query Success
    describe('POST /api/chat - Financial Success', () => {
        it('should successfully process financial queries', async () => {
            const mockResponse = {
                data: {
                    choices: [{
                        message: {
                            content: 'Apple (AAPL) is currently trading at $150 with strong fundamentals. ⚠️ This is not personalized financial advice. Please consult a financial advisor for your specific situation.'
                        }
                    }]
                }
            };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/api/chat')
                .send({ message: 'What is Apple stock price?' });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('response');
            expect(response.body).toHaveProperty('classification', 'financial');
            expect(response.body).toHaveProperty('query_enhanced');
            expect(response.body).toHaveProperty('original_query', 'What is Apple stock price?');
            expect(typeof response.body.query_enhanced).toBe('boolean');
        });
    });

    // Test 5: Chatbot Message - API Error Handling
    describe('POST /api/chat - Error Handling', () => {
        it('should handle OpenAI API errors gracefully', async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error('API Error'));

            const response = await request(app)
                .post('/api/chat')
                .send({ message: 'Tell me about Tesla stock' });
            
            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error', 'Internal server error. Please try again.');
        });
    });

    // Test 6: Query Enhancement Function - Stock Queries
    describe('enhanceFinancialQuery Function', () => {
        it('should enhance stock-related queries', () => {
            const originalQuery = 'What is Tesla stock doing?';
            const enhanced = enhanceFinancialQuery(originalQuery);
            
            expect(enhanced).toContain(originalQuery);
            expect(enhanced).toContain('market analysis');
            expect(enhanced).toContain('financial metrics');
            expect(enhanced).toContain('recent performance');
        });

        it('should enhance investment-related queries', () => {
            const originalQuery = 'How should I invest my money?';
            const enhanced = enhanceFinancialQuery(originalQuery);
            
            expect(enhanced).toContain(originalQuery);
            expect(enhanced).toContain('risk assessment');
            expect(enhanced).toContain('diversification');
            expect(enhanced).toContain('current market conditions');
        });

        it('should enhance crypto-related queries', () => {
            const originalQuery = 'Should I buy Bitcoin?';
            const enhanced = enhanceFinancialQuery(originalQuery);
            
            expect(enhanced).toContain(originalQuery);
            expect(enhanced).toContain('volatility analysis');
            expect(enhanced).toContain('regulatory considerations');
            expect(enhanced).toContain('traditional assets');
        });
    });

    // Test 7: Integration Test - Complete Flow
    describe('Integration - Complete Financial Query Flow', () => {
        it('should complete full financial query processing with query enhancement', async () => {
            const mockResponse = {
                data: {
                    choices: [{
                        message: {
                            content: 'Microsoft (MSFT) shows strong performance with P/E ratio of 28.5 and revenue growth of 12%. The stock has gained 15% this quarter due to strong cloud computing demand. Key metrics include 52-week high of $420 and current price around $380. ⚠️ This is not personalized financial advice. Please consult a financial advisor for your specific situation.'
                        }
                    }]
                }
            };
            mockedAxios.post.mockResolvedValueOnce(mockResponse);

            const response = await request(app)
                .post('/api/chat')
                .send({ message: 'Analyze Microsoft stock' });
            
            expect(response.status).toBe(200);
            expect(response.body.response).toContain('Microsoft');
            expect(response.body.response).toContain('P/E ratio');
            expect(response.body.response).toContain('⚠️ This is not personalized financial advice');
            expect(response.body.classification).toBe('financial');
            expect(response.body.query_enhanced).toBe(true);
            expect(response.body.original_query).toBe('Analyze Microsoft stock');
            
            // Verify axios was called with correct parameters
            expect(mockedAxios.post).toHaveBeenCalledWith(
                expect.stringContaining('openai.com'),
                expect.objectContaining({
                    model: 'gpt-3.5-turbo',
                    messages: expect.arrayContaining([
                        expect.objectContaining({
                            role: 'system',
                            content: expect.stringContaining('Financial AI Assistant')
                        }),
                        expect.objectContaining({
                            role: 'user',
                            content: expect.stringContaining('market analysis')
                        })
                    ])
                }),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        'Authorization': expect.stringContaining('Bearer'),
                        'Content-Type': 'application/json'
                    })
                })
            );
        });
    });

});