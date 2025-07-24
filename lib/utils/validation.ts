export const validateClientProfile = (client: any) => {
  const requiredFields = ['firstName', 'lastName', 'phone', 'address', 'city'];
  const missingFields = requiredFields.filter(field => !client[field] || client[field].trim() === '');
  
  return {
    isComplete: missingFields.length === 0,
    missingFields,
    canPurchase: missingFields.length === 0
  };
};

export const getProfileCompletionPercentage = (client: any) => {
  const allFields = ['firstName', 'lastName', 'phone', 'address', 'city', 'postalCode'];
  const completedFields = allFields.filter(field => client[field] && client[field].trim() !== '');
  return Math.round((completedFields.length / allFields.length) * 100);
};