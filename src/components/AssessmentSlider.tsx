
import React from "react";
import { Slider } from "@/components/ui/slider";

interface AssessmentSliderProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description: string;
}

const AssessmentSlider: React.FC<AssessmentSliderProps> = ({
  value,
  onChange,
  label,
  description,
}) => {
  return (
    <div className="mb-8">
      <div className="mb-2">
        <label className="text-mi-dark font-semibold">{label}</label>
        <p className="text-sm text-mi-dark/70">{description}</p>
      </div>
      <div className="flex flex-col gap-4">
        <Slider
          value={[value]}
          min={0}
          max={10}
          step={1}
          className="mt-2"
          onValueChange={([newValue]) => onChange(newValue)}
        />
        <div className="flex justify-between text-xs text-mi-dark/70">
          <span>0 = Not at all</span>
          <span>10 = Extremely</span>
        </div>
        <div className="text-center font-medium text-mi-primary">
          Current value: {value}
        </div>
      </div>
    </div>
  );
};

export default AssessmentSlider;
