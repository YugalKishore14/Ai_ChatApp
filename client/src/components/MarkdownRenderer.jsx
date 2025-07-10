import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          const language = match ? match[1] : '';
          
          return !inline && language ? (
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              customStyle={{
                margin: '1rem 0',
                borderRadius: '8px',
                fontSize: '0.875rem',
                lineHeight: '1.4',
                background: '#282c34',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code 
              className={`inline-code ${className || ''}`}
              style={{
                backgroundColor: 'rgba(110, 118, 129, 0.2)',
                padding: '0.2rem 0.4rem',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: '"JetBrains Mono", "Fira Code", Consolas, "Courier New", monospace',
                color: 'inherit',
                border: '1px solid rgba(110, 118, 129, 0.3)',
              }}
              {...props}
            >
              {children}
            </code>
          );
        },
        blockquote({ children }) {
          return (
            <blockquote
              style={{
                borderLeft: '4px solid #6366f1',
                paddingLeft: '1rem',
                margin: '1rem 0',
                fontStyle: 'italic',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '0 8px 8px 0',
                padding: '0.75rem 1rem',
              }}
            >
              {children}
            </blockquote>
          );
        },
        h1({ children }) {
          return (
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: '600',
                margin: '1.5rem 0 0.75rem 0',
                color: 'inherit',
                borderBottom: '2px solid rgba(99, 102, 241, 0.3)',
                paddingBottom: '0.5rem',
              }}
            >
              {children}
            </h1>
          );
        },
        h2({ children }) {
          return (
            <h2
              style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                margin: '1.25rem 0 0.5rem 0',
                color: 'inherit',
              }}
            >
              {children}
            </h2>
          );
        },
        h3({ children }) {
          return (
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                margin: '1rem 0 0.5rem 0',
                color: 'inherit',
              }}
            >
              {children}
            </h3>
          );
        },
        ul({ children }) {
          return (
            <ul
              style={{
                listStyle: 'disc',
                paddingLeft: '1.5rem',
                margin: '0.75rem 0',
              }}
            >
              {children}
            </ul>
          );
        },
        ol({ children }) {
          return (
            <ol
              style={{
                listStyle: 'decimal',
                paddingLeft: '1.5rem',
                margin: '0.75rem 0',
              }}
            >
              {children}
            </ol>
          );
        },
        li({ children }) {
          return (
            <li
              style={{
                margin: '0.25rem 0',
                lineHeight: '1.6',
              }}
            >
              {children}
            </li>
          );
        },
        p({ children }) {
          return (
            <p
              style={{
                margin: '0.75rem 0',
                lineHeight: '1.6',
                color: 'inherit',
              }}
            >
              {children}
            </p>
          );
        },
        strong({ children }) {
          return (
            <strong
              style={{
                fontWeight: '600',
                color: 'inherit',
              }}
            >
              {children}
            </strong>
          );
        },
        em({ children }) {
          return (
            <em
              style={{
                fontStyle: 'italic',
                color: 'inherit',
              }}
            >
              {children}
            </em>
          );
        },
        table({ children }) {
          return (
            <div style={{ overflowX: 'auto', margin: '1rem 0' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {children}
              </table>
            </div>
          );
        },
        th({ children }) {
          return (
            <th
              style={{
                padding: '0.75rem',
                textAlign: 'left',
                borderBottom: '2px solid #6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fontWeight: '600',
                color: 'inherit',
              }}
            >
              {children}
            </th>
          );
        },
        td({ children }) {
          return (
            <td
              style={{
                padding: '0.75rem',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                color: 'inherit',
              }}
            >
              {children}
            </td>
          );
        },
        a({ children, href }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#6366f1',
                textDecoration: 'underline',
                cursor: 'pointer',
              }}
            >
              {children}
            </a>
          );
        },
        hr({ children }) {
          return (
            <hr
              style={{
                border: 'none',
                height: '2px',
                background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                margin: '1.5rem 0',
                borderRadius: '1px',
              }}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
