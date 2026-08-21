import { useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ChatBox from '../../components/ChatBox';
import BackButton from '../../components/BackButton';

export default function ChatPage() {
  const { chatId } = useParams();
  const { state } = useLocation();
  const { currentUser } = useAuth();

  const booking = state?.booking || {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-left animate-fade-in">
      <BackButton 
        to={booking.bookingId ? `/customer/booking/${booking.bookingId}` : "/customer/bookings"} 
        label="Back to Booking" 
        className="mb-6" 
      />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#283845] dark:text-white font-heading">Conversation Details</h1>
        {booking.jobType && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Discussing job: <span className="font-bold text-[#283845] dark:text-[#FFA649]">{booking.jobType}</span> with worker <span className="font-bold text-[#283845] dark:text-[#FFA649]">{booking.workerName}</span>.
          </p>
        )}
      </div>

      <ChatBox 
        chatId={chatId}
        currentUser={currentUser}
        receiverId={booking.workerId}
        bookingId={booking.bookingId}
      />
    </div>
  );
}
