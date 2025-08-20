import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

function About() {
  const [readmeContent, setReadmeContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReadme = async () => {
      try {
        // Assuming the backend is running on the same host as the frontend dev server,
        // or adjust this URL if the backend is on a different host/port.
        // For development, Vite proxies API requests, so /api/about should work.
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/about`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }S
        const text = await response.text();
        setReadmeContent(text);
      } catch (e) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadme();
  }, []);

  if (isLoading) {
    return <div className="loading-message">Loading About content...</div>;
  }

  if (error) {
    return <div className="error-message">Error loading About content: {error.message}</div>;
  }

  return (
    <div className="about-section">
      <ReactMarkdown>{readmeContent}</ReactMarkdown>
    </div>
  );
}

export default About;