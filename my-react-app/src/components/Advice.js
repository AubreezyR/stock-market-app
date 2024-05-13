import React, { useState } from 'react'; // Import React and useState hook
import '../App.css'; // Import custom CSS
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css'; // Import default Chat UI Kit styles
import { // Import components from Chat UI Kit React
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  TypingIndicator,
} from '@chatscope/chat-ui-kit-react';

// Define API key for OpenAI ChatGPT API
const API_KEY = "";

// Define Advice functional component
const Advice = () => {
  // Define state variables using useState hook
  const [messages, setMessages] = useState([
    {
      message: "Hello, I'm your Stock App Assistant! Ask me anything!", // Initial welcome message
      direction: 'incoming',
      sender: "Stock Assisitant", // Sender of the initial message
    },
  ]);
  const [isTyping, setIsTyping] = useState(false); // State variable to track typing indicator

  // Function to handle sending user request and processing response
  const handleSendRequest = async (message) => {
    const newMessage = {
      message,
      direction: 'outgoing',
      sender: "user", // Sender is the user
    };

    // Add user message to the message list
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setIsTyping(true); // Set typing indicator to true

    try {
      // Call function to process message using ChatGPT API
      const response = await processMessageToChatGPT([...messages, newMessage]);
      // Extract content from ChatGPT response
      const content = response.choices[0]?.message?.content;
      if (content) {
        // Add ChatGPT response to the message list
        const chatGPTResponse = {
          message: content,
          sender: "Stock Assisitant", // Sender is the stock assistant
          direction: 'incoming',
        };
        setMessages((prevMessages) => [...prevMessages, chatGPTResponse]);
      }
    } catch (error) {
      // Log error if processing message fails
      console.error("Error processing message:", error);
    } finally {
      // Set typing indicator to false after processing message
      setIsTyping(false);
    }
  };

  // Function to process message using ChatGPT API
  async function processMessageToChatGPT(chatMessages) {
    // Prepare messages for ChatGPT API request
    const apiMessages = chatMessages.map((messageObject) => {
      const role = messageObject.sender === "Stock Assisitant" ? "assistant" : "user";
      return { role, content: messageObject.message };
    });

    // Prepare request body for ChatGPT API
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        { role: "system", content: "I'm a Student using ChatGPT for learning" },
        ...apiMessages,
      ],
    };

    // Send request to ChatGPT API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(apiRequestBody),
    });

    return response.json(); // Return response from ChatGPT API
  }

  // Render JSX for Advice component
  return (
    <div className="App">
      <div style={{ position:"fixed", bottom:"auto", height: "65vh" , width: "75%" }}>
        <MainContainer>
          <ChatContainer>       
            <MessageList 
              scrollBehavior="smooth" 
              typingIndicator={isTyping ? <TypingIndicator content="Stock Assisitant is typing" /> : null} // Display typing indicator if Stock Assistant is typing
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder="Send a Message" onSend={handleSendRequest} /> {/* Message input component for sending messages*/}       
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  )
}

export default Advice; // Export Advice component as default
