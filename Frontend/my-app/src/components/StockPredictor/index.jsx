import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChatAPI from '../../api/ChatAPI';

const PredictorContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(3),
  flex: 1,
}));

const InputContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(255, 255, 255, 0.1)',
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: theme.spacing(1),
    '& fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.7)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(156, 39, 176, 0.9)',
    },
  },
  '& .MuiSelect-icon': {
    color: 'rgba(156, 39, 176, 0.7)',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  '& .MuiOutlinedInput-root': {
    color: 'white',
    borderRadius: theme.spacing(1),
    '& fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.5)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(156, 39, 176, 0.7)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
    '&.Mui-focused': {
      color: 'rgba(156, 39, 176, 0.9)',
    },
  },
}));

const PredictButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #2a1428 0%, #1a1a1a 100%)',
  color: 'white',
  border: '1px solid rgba(156, 39, 176, 0.3)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1.5, 3),
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    background: 'linear-gradient(135deg, #3a1a38 0%, #2a2a2a 100%)',
    borderColor: 'rgba(156, 39, 176, 0.5)',
    transform: 'translateY(-1px)',
  },
  '&:disabled': {
    background: 'rgba(0, 0, 0, 0.3)',
    color: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
}));

const ResultContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(10px)',
  borderRadius: theme.spacing(2),
  border: '1px solid rgba(156, 39, 176, 0.2)',
  minHeight: '200px',
}));

const StockPredictor = () => {
  const [stockName, setStockName] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const timeframeOptions = [
    { value: '10', label: '10 Days' },
    { value: '50', label: '50 Days' },
    { value: '365', label: '365 Days (1 Year)' }
  ];

  const handlePredict = async () => {
    if (!stockName.trim() || !timeframe) return;

    setLoading(true);
    try {
      const result = await ChatAPI.predictStock(stockName, timeframe);

      if (result.success && result?.prediction?.average_price_prediction) {
        setPrediction(result);
      } else {
        setPrediction({
          error: "No data available for the given stock symbol and timeframe."
        });
      }
    } catch (error) {
      setPrediction({
        error: "An unexpected error occurred while predicting stock price."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PredictorContainer>
      <InputContainer elevation={0}>
        <Typography variant="h6" sx={{ color: 'white', marginBottom: 2 }}>
          Stock Price Prediction
        </Typography>
        
        <StyledTextField
          fullWidth
          label="Stock Symbol (e.g., AAPL, GOOGL, TSLA)"
          value={stockName}
          onChange={(e) => setStockName(e.target.value)}
          placeholder="Enter stock symbol"
        />
        
        <StyledFormControl fullWidth>
          <InputLabel>Analysis Period</InputLabel>
          <Select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            label="Analysis Period"
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: 'rgba(26, 26, 26, 0.95)',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  '& .MuiMenuItem-root': {
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(156, 39, 176, 0.2)',
                      '&:hover': {
                        backgroundColor: 'rgba(156, 39, 176, 0.3)',
                      },
                    },
                  },
                },
              },
            }}
          >
            {timeframeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </StyledFormControl>
        
        <PredictButton
          fullWidth
          onClick={handlePredict}
          disabled={!stockName.trim() || !timeframe || loading}
        >
          {loading ? 'Analyzing...' : 'Predict Stock Price'}
        </PredictButton>
      </InputContainer>

      {(prediction || loading) && (
        <ResultContainer>
          <Typography variant="h6" sx={{ color: 'white', marginBottom: 2 }}>
            Prediction Results
          </Typography>
          
          {loading ? (
            <Typography sx={{ color: 'rgba(156, 39, 176, 0.8)' }}>
              Analyzing market data and trends for {stockName.toUpperCase()}...
            </Typography>
          ) : prediction?.error ? (
            <Typography sx={{ color: 'rgba(220, 53, 69, 0.8)' }}>
              {prediction.error}
            </Typography>
          ) : (
            <Box>
              <Typography variant="body1" sx={{ color: 'white', marginBottom: 1 }}>
                <strong>Stock:</strong> {prediction?.prediction?.stock_symbol || stockName.toUpperCase()}
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', marginBottom: 1 }}>
                <strong>Timeframe:</strong> {timeframeOptions.find(opt => opt.value === timeframe)?.label || `${timeframe} days`}
              </Typography>
              
              {prediction?.prediction?.average_price_prediction && (
                <Typography variant="body1" sx={{ color: 'white', marginBottom: 2 }}>
                  <strong>Predicted Price in {timeframe} days :</strong> ${prediction.prediction.average_price_prediction.toFixed(2)}
                </Typography>
              )}
              
              {prediction?.prediction?.action && (
                <Box sx={{ 
                  padding: 2, 
                  background: prediction.prediction.action === 'Buy' 
                    ? 'rgba(76, 175, 80, 0.1)' 
                    : prediction.prediction.action === 'Sell' 
                    ? 'rgba(244, 67, 54, 0.1)' 
                    : 'rgba(156, 39, 176, 0.1)', 
                  borderRadius: 1,
                  border: prediction.prediction.action === 'Buy' 
                    ? '1px solid rgba(76, 175, 80, 0.3)' 
                    : prediction.prediction.action === 'Sell' 
                    ? '1px solid rgba(244, 67, 54, 0.3)' 
                    : '1px solid rgba(156, 39, 176, 0.3)',
                  marginTop: 2
                }}>
                  <Typography variant="h6" sx={{ 
                    color: prediction.prediction.action === 'Buy' 
                      ? 'rgba(76, 175, 80, 0.9)' 
                      : prediction.prediction.action === 'Sell' 
                      ? 'rgba(244, 67, 54, 0.9)' 
                      : 'rgba(156, 39, 176, 0.9)', 
                    marginBottom: 1,
                    textAlign: 'center',
                    fontWeight: 'bold'
                  }}>
                    Recommendation: {prediction.prediction.action}
                  </Typography>
                  
                  <Typography variant="body2" sx={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    textAlign: 'center',
                    fontStyle: 'italic'
                  }}>
                    {prediction.prediction.action === 'Buy' && 'Consider buying - positive outlook'}
                    {prediction.prediction.action === 'Sell' && 'Consider selling - negative outlook'}
                    {prediction.prediction.action === 'Hold' && 'Hold current position - neutral outlook'}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </ResultContainer>
      )}
    </PredictorContainer>
  );
};

export default StockPredictor;