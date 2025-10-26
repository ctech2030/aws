import MessageBubble from './MessageBubble';
import LoadingIndicator from './LoadingIndicator';

const MessageList = ({ messages, isLoading }) => {
  return (
    <div className="px-6 py-4 space-y-4">
      {messages.map((message, index) => (
        <MessageBubble key={index} message={message} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  );
};

export default MessageList;
