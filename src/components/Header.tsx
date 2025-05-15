
import React from "react";
import { useMI } from "../context/MIContext";

const Header = () => {
  const { resetConversation } = useMI();

  return (
    <header className="flex justify-between items-center py-4 px-6 bg-white border-b border-mi-light">
      <div className="flex items-center">
        <div className="text-mi-primary text-2xl font-bold mr-2">MI</div>
        <h1 className="text-xl font-semibold text-mi-dark">
          Motivational <span className="text-mi-primary">Interviewing</span> Assistant
        </h1>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={resetConversation}
          className="px-4 py-2 text-sm text-mi-primary hover:bg-mi-light rounded-md transition-colors"
        >
          New Conversation
        </button>
      </div>
    </header>
  );
};

export default Header;
