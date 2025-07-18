import { useEffect, useRef } from 'react';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const follower = followerRef.current;
    
    if (!cursor || !follower) return;

    let mouseX = 0;
    let mouseY = 0;
    let followerX = 0;
    let followerY = 0;

    const updateCursor = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursor.style.left = mouseX + 'px';
      cursor.style.top = mouseY + 'px';
    };

    const updateFollower = () => {
      const speed = 0.15;
      followerX += (mouseX - followerX) * speed;
      followerY += (mouseY - followerY) * speed;
      
      follower.style.left = followerX + 'px';
      follower.style.top = followerY + 'px';
      
      requestAnimationFrame(updateFollower);
    };

    const handleMouseEnter = () => {
      cursor.style.transform = 'scale(0.8)';
      follower.style.transform = 'scale(1.5)';
      follower.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
    };

    const handleMouseLeave = () => {
      cursor.style.transform = 'scale(1)';
      follower.style.transform = 'scale(1)';
      follower.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
    };

    document.addEventListener('mousemove', updateCursor);
    updateFollower();

    // Add hover effects to interactive elements
    const interactiveElements = document.querySelectorAll('button, a, [role="button"]');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', updateCursor);
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-[9999] mix-blend-difference transition-transform duration-100"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
      <div
        ref={followerRef}
        className="fixed top-0 left-0 w-8 h-8 border border-primary/30 rounded-full pointer-events-none z-[9998] transition-all duration-300"
        style={{ 
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(239, 68, 68, 0.05)'
        }}
      />
    </>
  );
};

export default CustomCursor;