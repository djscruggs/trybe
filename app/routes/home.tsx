import Typography from '@mui/material/Typography';
export default function Home({ children }: { children: React.ReactNode }) {
  return  (
            <>
               <Typography variant="h4" component="h1" gutterBottom>
                  I am Home
               </Typography>
            </>
          )
  }