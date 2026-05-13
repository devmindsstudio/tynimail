import { BiCheck } from "react-icons/bi";

const Stepper = ({
  steps,
  activeStep,
  onStepClick,
}: {
  steps: any;
  activeStep: number;
  onStepClick?: (stepIndex: number) => void;
}) => {
  return (
    <ul className="flex items-center">
      {steps.map((step: any, index: number) => {
        const isActive = index === activeStep;
        const isCompleted = index < activeStep;
        const isLast = index === steps.length - 1;
        const isClickable = index <= activeStep; // Can click on current or previous steps

        return (
          <li key={index} className="relative flex items-center">
            <div
              onClick={() => isClickable && onStepClick?.(index)}
              className={` flex justify-start items-center gap-2 xl:gap-3  py-2 px-3 rounded-md ${
                isActive ? "bg-muted " : isCompleted ? "bg-foreground" : ""
              } ${
                isClickable
                  ? "cursor-pointer hover:opacity-80 transition-opacity"
                  : "cursor-not-allowed"
              }`}
            >
              <div
                className={` w-5 h-5 min-w-5 min-h-5 border-2  rounded-full flex justify-center items-center  ${
                  isActive
                    ? // ? "bg-card border-border-primary-50"
                      // : isCompleted
                      // ? "bg-card text-primary-foreground stroke-red-500 border-card"
                      // : "bg-transparent border-border text-muted-50"
                      "bg-card border-input"
                    : isCompleted
                    ? "bg-card border-input"
                    : ""
                }`}
              >
                {isCompleted ? (
                  <BiCheck className="text-2xl leading-none" />
                ) : (
                  <p className="text-[10px] leading-4">{index + 1}</p>
                )}
              </div>

              <h2
                className={`font-inter text-sm xl:text-base font-medium text-nowrap leading-6 ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                    ? "text-card"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </h2>
            </div>

            {!isLast && (
              <>
                <div className={"bg-[#D5D7DA] w-8 h-0.5 mx-2"}></div>
              </>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default Stepper;
