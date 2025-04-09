import { Skeleton, CircularProgress, Box } from '@mui/material';

export const LoadingScreen = ({ type = 'circular' }) => (
  <Box display="flex" justifyContent="center" mt={10}>
    {type === 'skeleton' ? (
      <Skeleton variant="rectangular" width={300} height={400} />
    ) : (
      <CircularProgress size={80} thickness={4} />
    )}
  </Box>
);
