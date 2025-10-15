// Simple banner component for notifications
const banner = {
  show: (message, type = 'info') => {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // You can implement DOM manipulation here if needed
    return { message, type };
  }
};

export default banner;