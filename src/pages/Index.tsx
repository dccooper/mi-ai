
import React from "react";
import Layout from "../components/Layout";
import ChatInterface from "../components/ChatInterface";
import { MIProvider } from "../context/MIContext";

const Index = () => {
  return (
    <MIProvider>
      <Layout>
        <ChatInterface />
      </Layout>
    </MIProvider>
  );
};

export default Index;
