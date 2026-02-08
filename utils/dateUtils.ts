
export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const getMonthIndex = (monthName: string): number => {
  return MONTHS.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
};

export const getDaysUntilBirthday = (birthdayString: string): number | null => {
  if (!birthdayString) return null;

  const parts = birthdayString.toLowerCase().replace(/,/g, '').split(' de ');
  if (parts.length !== 2) return null;

  const day = parseInt(parts[0]);
  const monthName = parts[1].trim();
  const month = getMonthIndex(monthName);

  if (isNaN(day) || month === -1) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  
  let birthdayThisYear = new Date(currentYear, month, day);
  birthdayThisYear.setHours(0, 0, 0, 0);

  if (birthdayThisYear < today) {
    birthdayThisYear.setFullYear(currentYear + 1);
  }

  const diffTime = birthdayThisYear.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getAgeAtNextBirthday = (birthdayString: string, birthYear?: number): number | null => {
  if (!birthYear) return null;
  
  const parts = birthdayString.toLowerCase().replace(/,/g, '').split(' de ');
  if (parts.length !== 2) return null;
  
  const month = getMonthIndex(parts[1].trim());
  const day = parseInt(parts[0]);
  
  const today = new Date();
  const currentYear = today.getFullYear();
  let nextBirthdayYear = currentYear;
  
  const birthdayThisYear = new Date(currentYear, month, day);
  if (birthdayThisYear < today) {
    nextBirthdayYear = currentYear + 1;
  }
  
  return nextBirthdayYear - birthYear;
};

export const parseBirthdayString = (dateStr: string) => {
  try {
    const parts = dateStr.split(' de ');
    if (parts.length === 2) {
      const day = parseInt(parts[0]);
      const month = parts[1].charAt(0).toUpperCase() + parts[1].slice(1).toLowerCase();
      if (!isNaN(day) && MONTHS.includes(month)) {
        return { day, month };
      }
    }
  } catch (e) {}
  return { day: 1, month: 'Enero' };
};
