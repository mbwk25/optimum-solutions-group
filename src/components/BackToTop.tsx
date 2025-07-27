// Safe back to top without hooks
import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BackToTop = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-50 rounded-full p-3 shadow-lg"
      size="sm"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  );
};

export default BackToTop;