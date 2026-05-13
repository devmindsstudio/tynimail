import { useState } from "react";

export const useStepper = (totalSteps: number) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [skipped, setSkipped] = useState<Set<number>>(new Set());

  const isStepSkipped = (step: number): boolean => {
    return skipped.has(step);
  };
  const handleNext = () => {
    let newSkipped = skipped;
    if (isStepSkipped(activeStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(activeStep);
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped(newSkipped);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const getStepState = (index: number) => {
    const isCompleted = activeStep > index;
    const isActive = activeStep === index;
    const isDisabled = activeStep < index;
    const lastElement = index === totalSteps - 1;

    const mainItem = `group ${isCompleted ? "is-completed" : ""} ${
      isActive ? "is-active" : ""
    } ${isDisabled ? "is-disable " : ""} ${lastElement ? "" : ""}`;

    return { isCompleted, isActive, isDisabled, lastElement, mainItem };
  };

  return { handleNext, handleBack, handleReset, activeStep, getStepState };
};
