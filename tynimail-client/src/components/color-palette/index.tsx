// import { useTemplates } from "@/hooks/use-templates";

import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerEyeDropper,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerSelection,
} from "@/components/ui/shadcn-io/color-picker";
import { useState, useEffect, useRef } from "react";

interface ColorPaletteProps {
  triggerRef: React.RefObject<HTMLDivElement | null>;
  onClose?: () => void;
  color: any;
  handleColorChange: any;
}

const ColorPalette = ({
  triggerRef,
  onClose,
  color,
  handleColorChange,
}: ColorPaletteProps) => {
  const paletteRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const pickerKeyRef = useRef(Date.now());

  // Reset the ColorPicker key when component mounts (when palette opens)
  // This ensures it starts with the correct color
  useEffect(() => {
    pickerKeyRef.current = Date.now();
  }, []);

  // useEffect(() => {
  //   if (initialColor && initialColor !== color) {
  //     setColor(initialColor);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [initialColor]);

  useEffect(() => {
    const calculatePosition = () => {
      if (!triggerRef.current) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = 20;

      const estimatedWidth = 300;
      const estimatedHeight = 400;

      let top = triggerRect.bottom + offset;
      let left = triggerRect.left + 30;

      if (top + estimatedHeight > viewportHeight) {
        top = triggerRect.top - estimatedHeight - offset;
        if (top < 0) {
          top = Math.max(offset, viewportHeight - estimatedHeight - offset);
        }
      }

      if (left + estimatedWidth > viewportWidth) {
        left = viewportWidth - estimatedWidth - offset;
      }
      if (left < offset) {
        left = offset;
      }

      setPosition({ top, left });
    };

    calculatePosition();
    const rafId = requestAnimationFrame(() => {
      if (paletteRef.current && triggerRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const paletteRect = paletteRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const offset = 20;

        let top = triggerRect.bottom + offset;
        let left = triggerRect.left + 30;

        if (top + paletteRect.height > viewportHeight) {
          top = triggerRect.top - paletteRect.height - offset;
          if (top < 0) {
            top = Math.max(
              offset,
              viewportHeight - paletteRect.height - offset
            );
          }
        }

        if (left + paletteRect.width > viewportWidth) {
          left = viewportWidth - paletteRect.width - offset;
        }
        if (left < offset) {
          left = offset;
        }

        setPosition({ top, left });
      }
    });

    window.addEventListener("resize", calculatePosition);
    window.addEventListener("scroll", calculatePosition, true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", calculatePosition);
      window.removeEventListener("scroll", calculatePosition, true);
    };
  }, []);

  return (
    <>
      <div
        ref={paletteRef}
        className="fixed z-50"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ColorPicker
          key={pickerKeyRef.current}
          defaultValue={color}
          onChange={handleColorChange}
          className="max-w-sm rounded-md border bg-background p-2.5 shadow-sm h-75 w-75"
        >
          <ColorPickerSelection />
          <div className="flex items-center gap-4">
            <ColorPickerEyeDropper />
            <div className="grid w-full gap-1">
              <ColorPickerHue />
              <ColorPickerAlpha />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ColorPickerOutput />
            <ColorPickerFormat />
          </div>
        </ColorPicker>
      </div>
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </>
  );
};

export default ColorPalette;
