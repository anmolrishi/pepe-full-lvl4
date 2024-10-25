// Handles Firebase timestamp format: "October 24, 2024 at 4:37:57 PM UTC+5:30"
export const parseFirebaseDate = (dateString) => {
  try {
    if (!dateString) return null;
    
    // Handle Firebase Timestamp objects
    if (dateString?.toDate) {
      return dateString.toDate().getTime();
    }
    
    // Handle string format: "October 25, 2024 at 6:05:48 AM UTC+5:30"
    if (typeof dateString === 'string') {
      // Remove "at" and "UTC" from the string for better parsing
      const cleanDateString = dateString
        .replace(' at ', ' ')
        .replace(' UTC', '');
      
      return new Date(cleanDateString).getTime();
    }
    
    // Handle if it's already a Date object or timestamp
    if (dateString instanceof Date) {
      return dateString.getTime();
    }
    
    return null;
  } catch (error) {
    console.error("Error parsing date:", error, "for value:", dateString);
    return null;
  }
};

export const formatDate = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const timestamp = parseFirebaseDate(dateString);
    if (!timestamp) return 'N/A';
    
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'N/A';
  }
};

export const formatDateTime = (dateString) => {
  try {
    if (!dateString) return 'N/A';
    const timestamp = parseFirebaseDate(dateString);
    if (!timestamp) return 'N/A';
    
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error("Error formatting datetime:", error);
    return 'N/A';
  }
};

export const sortByDate = (a, b) => {
  const dateA = parseFirebaseDate(a.timestamp || a.start_time);
  const dateB = parseFirebaseDate(b.timestamp || b.start_time);
  
  if (!dateA || !dateB) return 0;
  return dateA - dateB;
};