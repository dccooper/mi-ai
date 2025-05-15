
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import AssessmentSlider from "./AssessmentSlider";
import { useMI } from "../context/MIContext";
import { Assessment, Stage } from "../types/mi-types";

interface AssessmentModalProps {
  open: boolean;
  onClose: () => void;
  targetBehavior: string;
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  open,
  onClose,
  targetBehavior,
}) => {
  const [importance, setImportance] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const { setAssessment, setStage, addMessage } = useMI();

  const handleSubmit = () => {
    // Create assessment object
    const assessment: Assessment = {
      importance,
      confidence,
    };

    // Determine stage based on average score
    const averageScore = (importance + confidence) / 2;
    let newStage: Stage = 'precontemplation';

    if (averageScore >= 8) {
      newStage = 'preparation';
    } else if (averageScore >= 5) {
      newStage = 'contemplation';
    }

    // Update context
    setAssessment(assessment);
    setStage(newStage);

    // Add AI message explaining the assessment
    addMessage({
      content: `Thank you for completing the assessment. Based on your ratings:\n\n- Importance of change: ${importance}/10\n- Confidence in ability to change: ${confidence}/10\n\nLet's continue our conversation about ${targetBehavior}.`,
      sender: 'ai',
    });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-mi-primary">Assess Your Readiness</DialogTitle>
          <DialogDescription>
            Please rate the following statements about {targetBehavior}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <AssessmentSlider
            value={importance}
            onChange={setImportance}
            label="How important is making this change to you?"
            description="Consider how much you want this change in your life right now."
          />
          <AssessmentSlider
            value={confidence}
            onChange={setConfidence}
            label="How confident are you in your ability to make this change?"
            description="Consider your belief in your capability to achieve this change."
          />
          <Button 
            className="w-full bg-mi-primary hover:bg-mi-primary/80 text-white" 
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssessmentModal;
