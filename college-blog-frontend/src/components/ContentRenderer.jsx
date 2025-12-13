import React from 'react';
import { useNavigate } from 'react-router-dom';

const ContentRenderer = ({ content }) => {
  const navigate = useNavigate();

  if (!content) return null;

  // Regex to split by hashtags
  const parts = content.split(/(#\w+)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('#')) {
          const tag = part.slice(1); // remove #
          return (
            <span 
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/search?q=${tag}`); // Navigate to search
              }}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              {part}
            </span>
          );
        }
        return part;
      })}
    </span>
  );
};

export default ContentRenderer;