export default function formatDateToMonthDayYear(timeString: string | number | Date) {
    const parsedDate = new Date(timeString);
  
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
  
    const month = monthNames[parsedDate.getMonth()];
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const year = parsedDate.getFullYear();

    const formattedDate = `${month} ${day}, ${year}`;
  
    return formattedDate;
};


export function ageCalculator(dateOfBirth: string | number | Date) {
  const birthDate = new Date(dateOfBirth);
  const currentDate = new Date();

  const age = currentDate.getFullYear() - birthDate.getFullYear();

  // Check if the birthday has occurred this year already
  if (
    currentDate.getMonth() < birthDate.getMonth() ||
    (currentDate.getMonth() === birthDate.getMonth() &&
      currentDate.getDate() < birthDate.getDate())
  ) {
    return age - 1; // Subtract 1 year if the birthday hasn't occurred yet
  }

  return age;
};
