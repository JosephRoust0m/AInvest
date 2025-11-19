import { Box, Typography, Link } from '@mui/material';
import { styled } from '@mui/material/styles';

const FooterContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'rgba(0, 0, 0, 0.3)',
  backdropFilter: 'blur(10px)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  padding: theme.spacing(2),
  zIndex: 1000,
}));

const FooterContent = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  gap: '8px',
});

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            textAlign: 'center'
          }}
        >
          © 2025 Financial. All rights reserved.
        </Typography>
      </FooterContent>
    </FooterContainer>
  );
};

export default Footer;