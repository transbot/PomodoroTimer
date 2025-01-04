interface ZodiacSign {
  name: {
    en: string;
    zh: string;
  };
  startDate: string; // MM-DD format
  endDate: string;
  constellation: string; // URL to constellation image
}

export const zodiacSigns: ZodiacSign[] = [
  {
    name: { en: 'Virgo', zh: '处女座' },
    startDate: '08-23',
    endDate: '09-22',
    constellation: 'https://img95.699pic.com/photo/40010/8800.jpg_wh300.jpg'
  },
  {
    name: { en: 'Leo', zh: '狮子座' },
    startDate: '07-23',
    endDate: '08-22',
    constellation: 'https://images.unsplash.com/photo-1464802686167-b939a6910659?auto=format&fit=crop&q=80&w=2000'
  },
  {
    name: { en: 'Libra', zh: '天秤座' },
    startDate: '09-23',
    endDate: '10-22',
    constellation: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&q=80&w=2000'
  },
  {
    name: { en: 'Scorpio', zh: '天蝎座' },
    startDate: '10-23',
    endDate: '11-21',
    constellation: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?auto=format&fit=crop&q=80&w=2000'
  },
  {
    name: { en: 'Cancer', zh: '巨蟹座' },
    startDate: '06-21',
    endDate: '07-22',
    constellation: 'https://images.unsplash.com/photo-1532721344391-eaf75d3c1d6c?auto=format&fit=crop&q=80&w=2000'
  }
];

export function getZodiacForWeekday(weekday: number): ZodiacSign {
  // Map Monday (1) to Friday (5) to zodiac signs
  // Sort signs by proximity to September
  const septemberMidpoint = new Date(new Date().getFullYear(), 8, 15); // September 15th
  
  const sortedSigns = [...zodiacSigns].sort((a, b) => {
    const getDateMidpoint = (sign: ZodiacSign) => {
      const year = new Date().getFullYear();
      const [startMonth, startDay] = sign.startDate.split('-').map(Number);
      const [endMonth, endDay] = sign.endDate.split('-').map(Number);
      const start = new Date(year, startMonth - 1, startDay);
      const end = new Date(year, endMonth - 1, endDay);
      return new Date((start.getTime() + end.getTime()) / 2);
    };
    
    const aMidpoint = getDateMidpoint(a);
    const bMidpoint = getDateMidpoint(b);
    
    const aDiff = Math.abs(aMidpoint.getTime() - septemberMidpoint.getTime());
    const bDiff = Math.abs(bMidpoint.getTime() - septemberMidpoint.getTime());
    
    return aDiff - bDiff;
  });
  
  // Map weekday to sorted signs (Monday = 1 to Sunday = 7)
  // Use modulo to cycle through the 5 signs for weekends
  const index = ((weekday - 1) % sortedSigns.length + sortedSigns.length) % sortedSigns.length;
  return sortedSigns[index];
}