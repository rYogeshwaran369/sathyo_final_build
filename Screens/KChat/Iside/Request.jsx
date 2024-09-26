import React, { useEffect, useState } from 'react';
import {fetchPendingRequests,acceptChatRequest,rejectChatRequest} from "./instructorServices" 
const InstructorRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const result = await fetchPendingRequests();
      setRequests(result);
    };
    fetchRequests();
  }, []);

  const handleAccept = async (requestId) => {
    await acceptChatRequest(requestId);
    // Remove the accepted request from the list
    setRequests(requests.filter(request => request.id !== requestId));
  };

  const handleReject = async (requestId) => {
    await rejectChatRequest(requestId);
    // Remove the rejected request from the list
    setRequests(requests.filter(request => request.id !== requestId));
  };

  return (
    <div>
      <h2>Pending Chat Requests</h2>
      <ul>
        {requests.map(request => (
          <li key={request.id}>
            Meditator: {request.meditatorId}
            <button onClick={() => handleAccept(request.id)}>Accept</button>
            <button onClick={() => handleReject(request.id)}>Reject</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InstructorRequests;
