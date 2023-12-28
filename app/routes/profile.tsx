import Typography from '@mui/material/Typography';
export default function Profile({ children }: { children: React.ReactNode }) {
  return  (
            <>
              <Typography variant="h4" component="h1" gutterBottom>
                I am Profile
              </Typography>
            </>
          )
  }