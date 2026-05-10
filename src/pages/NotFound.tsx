import { Link } from 'react-router-dom';
import { FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <FileQuestion size={64} className="text-brand-mid-grey mb-6" />
      <h1 className="font-serif text-5xl md:text-6xl text-brand-black mb-4">404</h1>
      <h2 className="font-sans font-semibold text-2xl text-brand-black mb-4">Page Not Found</h2>
      <p className="font-sans text-brand-mid-grey max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
