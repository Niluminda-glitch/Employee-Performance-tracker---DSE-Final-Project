import React from 'react';

interface MessageFormatterProps {
  content: string;
  className?: string;
}

const MessageFormatter: React.FC<MessageFormatterProps> = ({ content, className = '' }) => {
  // Function to clean and format text
  const cleanText = (text: string) => {
    return text
      // Remove markdown headers (### **text**)
      .replace(/^#{1,6}\s*\*\*(.*?)\*\*$/gm, '$1')
      .replace(/^#{1,6}\s*(.*?)$/gm, '$1')
      // Remove bold markdown (**text**)
      .replace(/\*\*(.*?)\*\*/g, '$1')
      // Remove italic markdown (*text*)
      .replace(/\*(.*?)\*/g, '$1')
      // Remove horizontal rules (---)
      .replace(/^---+$/gm, '')
      // Remove extra asterisks and formatting
      .replace(/^\*+\s*/gm, '')
      // Clean up extra whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Function to detect if text contains code or technical content
  const containsCode = (text: string) => {
    return text.includes('```') || text.includes('`') || text.includes('npm') || text.includes('node');
  };

  // Function to format the message content
  const formatMessage = (text: string) => {
    const cleanedText = cleanText(text);

    // Split by double line breaks to create sections
    const sections = cleanedText.split('\n\n');

    return sections.map((section, sectionIndex) => {
      if (!section.trim()) return null;

      const lines = section.split('\n');

      // Check if this is a list section
      const listItems = lines.filter(line => {
        const trimmed = line.trim();
        return /^\d+\./.test(trimmed) || trimmed.startsWith('-') || trimmed.startsWith('•');
      });

      if (listItems.length > 0) {
        // This section contains list items
        const title = lines.find(line => {
          const trimmed = line.trim();
          return trimmed && !(/^\d+\./.test(trimmed) || trimmed.startsWith('-') || trimmed.startsWith('•'));
        });

        return (
          <div key={sectionIndex} className="mb-4">
            {title && (
              <div className="font-semibold text-sm mb-3 text-gray-800 border-l-3 border-purple-500 pl-3">
                {title.trim()}
              </div>
            )}
            <ul className="space-y-2 ml-2">
              {listItems.map((item, itemIndex) => {
                // Clean the list item and check for sub-items
                const cleanItem = item
                  .replace(/^\d+\.\s*/, '')
                  .replace(/^[-•]\s*/, '')
                  .trim();

                // Check if this is a sub-item (starts with extra spaces or dashes)
                const isSubItem = item.startsWith('  ') || item.startsWith('    ');

                if (cleanItem) {
                  return (
                    <li key={itemIndex} className={`flex items-start ${isSubItem ? 'ml-4' : ''}`}>
                      <span className={`inline-block w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0 ${
                        isSubItem ? 'bg-purple-300' : 'bg-purple-500'
                      }`}></span>
                      <span className="text-sm leading-relaxed text-gray-700">{cleanItem}</span>
                    </li>
                  );
                }
                return null;
              })}
            </ul>
          </div>
        );
      } else {
        // Regular text section
        return (
          <div key={sectionIndex} className="mb-3">
            {lines.map((line, lineIndex) => {
              const trimmedLine = line.trim();
              if (trimmedLine) {
                return (
                  <div key={lineIndex} className="text-sm leading-relaxed mb-1">
                    {trimmedLine}
                  </div>
                );
              }
              return null;
            })}
          </div>
        );
      }
    }).filter(Boolean);
  };

  return (
    <div className={`formatted-message ${className}`}>
      {formatMessage(content)}
    </div>
  );
};

export default MessageFormatter;
