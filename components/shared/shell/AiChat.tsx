import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { XMarkIcon } from '@heroicons/react/20/solid';
import toast from 'react-hot-toast';
import { defaultHeaders } from '@/lib/common';
import type {
  ApiResponse,
  ChatbotResponse,
  ChatbotResponseReturned,
} from 'types';
import { useTranslation } from 'next-i18next';
import DaisyButton from '../daisyUI/DaisyButton';
import DaisyCard from '../daisyUI/DaisyCard';

const AiChat = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<ChatbotResponse[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const { t } = useTranslation('common');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const togglePopup = () => {
    setVisible(!visible);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newMessages = [
      ...messages,
      {
        content: e.target[0].value,
        role: 'user',
      },
    ];

    e.target.reset();

    setMessages(newMessages);
    setIsTyping(true);

    const response = await fetch(`/api/chatbot`, {
      method: 'POST',
      headers: defaultHeaders,
      body: JSON.stringify(newMessages),
    });

    const json =
      (await response.json()) as ApiResponse<ChatbotResponseReturned>;

    if (!response.ok) {
      toast.error(json.error.message);
      return;
    }

    const chatbotResponse = json.data.response;

    setMessages((prev) => [...prev, chatbotResponse]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <>
      {/* DaisyButton with transition */}
      <div
        className={clsx(
          'fixed right-4 bottom-4 z-50 transition-all duration-300 transform',
          visible
            ? 'opacity-0 translate-y-4 pointer-events-none'
            : 'opacity-100 translate-y-0'
        )}
      >
        <DaisyButton onClick={togglePopup}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>
          {t('ai-chatbot')}
        </DaisyButton>
      </div>

      {/* Popup with Chat */}
      <div
        className={clsx(
          'fixed right-4 bottom-16 z-50 transition-all duration-300 transform',
          visible
            ? 'opacity-100 translate-x-0'
            : 'opacity-0 translate-x-full pointer-events-none'
        )}
        style={{ height: '80vh' }}
      >
        <DaisyCard className="shadow-lg border border-gray-300 relative bg-white flex flex-col h-full w-[20rem] md:w-lg">
          <button
            onClick={togglePopup}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <DaisyCard.Title className="font-bold p-4">{t('ai-chatbot')}</DaisyCard.Title>

          {/* Chat Messages */}
          <div className="grow overflow-auto px-4 pb-4">
            {messages.length > 0 &&
              messages.map((msg, i) => (
                <div
                  className={`chat ${msg.role === 'assistant' ? 'chat-start' : 'chat-end'}`}
                  key={'chatKey' + i}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={
                          msg.role === 'assistant'
                            ? '/chatbot_assistant.png'
                            : '/chatbot_user.png'
                        }
                      />
                    </div>
                  </div>
                  <div className="chat-bubble">
                    <div className="text-white">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          ol: ({ children }) => (
                            <ol
                              style={{
                                padding: '0.5rem 0 0.5rem 1.5rem',
                                listStyleType: 'decimal',
                              }}
                            >
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li style={{ marginBottom: '0.5rem' }}>
                              {children}
                            </li>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Chat Input */}
          <form
            className="form-control items-center p-4 border-t"
            onSubmit={handleSubmit}
          >
            {isTyping && (
              <small className="animate-pulse mb-2">
                AI Chat Assistant is typing...
              </small>
            )}
            <div className="input-group w-full flex">
              <input
                type="text"
                placeholder="Type a question!"
                className="input input-bordered grow"
                required
              />
              <button className="btn btn-square ml-4" type="submit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z" />
                </svg>
              </button>
            </div>
          </form>
        </DaisyCard>
      </div>
    </>
  );
};

export default AiChat;
