import Cookies from 'js-cookie';

const LAST_UPDATE_CHECK_KEY = 'last_data_update_check';

export const getLastUpdateCheck = (): Date | null => {
  const lastCheck = Cookies.get(LAST_UPDATE_CHECK_KEY);
  return lastCheck ? new Date(lastCheck) : null;
};

export const setLastUpdateCheck = (): void => {
  Cookies.set(LAST_UPDATE_CHECK_KEY, new Date().toISOString(), { expires: 7 }); // Cookie expires in 7 days
};

export const shouldCheckForUpdates = (): boolean => {
  const lastCheck = getLastUpdateCheck();
  if (!lastCheck) return true;

  const now = new Date();
  const lastCheckDate = new Date(lastCheck);

  // Check if the last update was on a different day
  return (
    lastCheckDate.getDate() !== now.getDate() ||
    lastCheckDate.getMonth() !== now.getMonth() ||
    lastCheckDate.getFullYear() !== now.getFullYear()
  );
}; 