
export const hasAgreedToDataPrivacy = () => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    return localStorage.getItem('isDataPrivacyNoticeAgreed') === 'true';
  } catch (error) {
    console.error('Error checking data privacy agreement:', error);
    return false;
  }
};


export const getDataPrivacyAgreementDate = () => {
  return localStorage.getItem('dataPrivacyAgreementDate');
};

export const setDataPrivacyAgreement = (agreed = true, date = null) => {
  if (agreed) {
    localStorage.setItem('isDataPrivacyNoticeAgreed', 'true');
    localStorage.setItem('dataPrivacyAgreementDate', date || new Date().toISOString());
  } else {
    localStorage.removeItem('isDataPrivacyNoticeAgreed');
    localStorage.removeItem('dataPrivacyAgreementDate');
  }
};

/**
 * Clear data privacy agreement (useful for logout)
 */
export const clearDataPrivacyAgreement = () => {
  localStorage.removeItem('isDataPrivacyNoticeAgreed');
  localStorage.removeItem('dataPrivacyAgreementDate');
};


export const isDataPrivacyAgreementOlderThan = (days = 365) => {
  const agreementDate = getDataPrivacyAgreementDate();
  if (!agreementDate) return true;
  
  const agreementTime = new Date(agreementDate).getTime();
  const cutoffTime = new Date().getTime() - (days * 24 * 60 * 60 * 1000);
  
  return agreementTime < cutoffTime;
};