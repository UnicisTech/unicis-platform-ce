
const NumberFormatter = ({ number }) => {
  const formattedNumber = new Intl.NumberFormat().format(number);
  
  return (
    <span className='text-3xl font-bold'>{formattedNumber}</span>
  );
};


export default NumberFormatter;