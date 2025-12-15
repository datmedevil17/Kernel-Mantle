import React, { useState } from 'react';
import styled from 'styled-components';

const NeuronContainer = styled.div`
  background: rgba(20, 20, 35, 0.95);
  border-radius: 20px;
  padding: 2rem;
  color: #fff;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
  border: 1px solid rgba(147, 51, 234, 0.2);
  backdrop-filter: blur(10px);
`;

const MessageInput = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(147, 51, 234, 0.3);
  border-radius: 12px;
  color: #fff;
  margin-top: 1rem;
`;

const ResponseArea = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(147, 51, 234, 0.1);
  border-radius: 12px;
  min-height: 100px;
`;

export const NeuronAssistant = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ question: input }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <NeuronContainer>
      <h2>Neuron AI Assistant</h2>
      <MessageInput
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask me anything..."
      />
      <button onClick={handleSubmit}>Send</button>
      <ResponseArea>{response}</ResponseArea>
    </NeuronContainer>
  );
};