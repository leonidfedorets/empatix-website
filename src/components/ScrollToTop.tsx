import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { IconButton } from "@/components/ds";

const MotionIconButton = motion.create(IconButton);

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 480);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <MotionIconButton
          key="scroll-top"
          size="lg"
          variant="brand"
          type="button"
          aria-label="Scroll to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          className="fixed bottom-6 right-6 z-50 backdrop-blur md:bottom-8 md:right-8"
        >
          <ArrowUp className="h-5 w-5" />
        </MotionIconButton>
      )}
    </AnimatePresence>
  );
}

