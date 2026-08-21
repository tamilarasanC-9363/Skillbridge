import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/ChatBox';
import BackButton from '../../components/BackButton';

export default function WorkerChat() {
  const { chatId } = useParams();
  const { state } = useLocation();
  const { currentUser } = useAuth();

  const booking = state?.booking || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left animate-fade-in">
      <BackButton to="/worker" label="Back to Dashboard" className="mb-6" />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Client Message Board</h1>
        {booking.jobType && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Discussing job: <span className="font-bold text-[#283845] dark:text-[#FFA649]">{booking.jobType}</span> with client <span className="font-bold text-[#283845] dark:text-[#FFA649]">{booking.customerName}</span>.
          </p>
        )}
      </div>

      <ChatBox 
        chatId={chatId}
        currentUser={currentUser}
        receiverId={booking.customerId}
        bookingId={booking.bookingId}
      />
    </div>
  );
}
