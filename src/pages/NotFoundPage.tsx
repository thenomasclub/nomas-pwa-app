import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => (
  <Layout>
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center animate-fade-in">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-muted-foreground text-lg">The page you are looking for could not be found.</p>
      <Button asChild>
        <Link to="/">Go to Home</Link>
      </Button>
    </div>
  </Layout>
);

export default NotFoundPage; 