export const FESTIVAL_DAYS_CONFIG = [
  {
    day: 1,
    date: '14 Sep',
    marathiDate: '१४ सप्टें',
    fullDate: '14 Sept 2026',
    tithi: 'गणेश चतुर्थी (स्थापना)',
    marathiLabel: '१४ सप्टें • गणेश चतुर्थी',
    defaultTitle: 'Ganesh Stapan & Aarti',
    defaultMarathiTitle: 'गणेश स्थापना व महाआरती'
  },
  {
    day: 2,
    date: '15 Sep',
    marathiDate: '१५ सप्टें',
    fullDate: '15 Sept 2026',
    tithi: 'ऋषीपंचमी',
    marathiLabel: '१५ सप्टें • ऋषीपंचमी',
    defaultTitle: 'Cultural Program & Aarti',
    defaultMarathiTitle: 'सांस्कृतिक कार्यक्रम व आरती'
  },
  {
    day: 3,
    date: '16 Sep',
    marathiDate: '१६ सप्टें',
    fullDate: '16 Sept 2026',
    tithi: 'तृतीया',
    marathiLabel: '१६ सप्टें • तृतीया',
    defaultTitle: 'Bhajan Sandhya & Aarti',
    defaultMarathiTitle: 'भजन संध्या व महाआरती'
  },
  {
    day: 4,
    date: '17 Sep',
    marathiDate: '१७ सप्टें',
    fullDate: '17 Sept 2026',
    tithi: 'चतुर्थी',
    marathiLabel: '१७ सप्टें • गुरुवार',
    defaultTitle: 'Games',
    defaultMarathiTitle: '🎮 Games (खेळ)'
  },
  {
    day: 5,
    date: '18 Sep',
    marathiDate: '१८ सप्टें',
    fullDate: '18 Sept 2026',
    tithi: 'पंचमी',
    marathiLabel: '१८ सप्टें • शुक्रवार',
    defaultTitle: 'Devotional Movie',
    defaultMarathiTitle: '🎬 धार्मिक Movie'
  },
  {
    day: 6,
    date: '19 Sep',
    marathiDate: '१९ सप्टें',
    fullDate: '19 Sept 2026',
    tithi: 'षष्ठी • गौरी आगमन',
    marathiLabel: '१९ सप्टें • शनिवार',
    defaultTitle: 'Dance & Fancy Dress Competition',
    defaultMarathiTitle: '💃 Dance & Fancy Dress Competition'
  },
  {
    day: 7,
    date: '20 Sep',
    marathiDate: '२० सप्टें',
    fullDate: '20 Sept 2026',
    tithi: 'सप्तमी • गौरी पूजन',
    marathiLabel: '२० सप्टें • रविवार',
    defaultTitle: 'Home Minister',
    defaultMarathiTitle: '🎤 Home Minister'
  },
  {
    day: 8,
    date: '21 Sep',
    marathiDate: '२१ सप्टें',
    fullDate: '21 Sept 2026',
    tithi: 'अष्टमी • गौरी विसर्जन',
    marathiLabel: '२१ सप्टें • सोमवार',
    defaultTitle: 'Event will be announced soon',
    defaultMarathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल'
  },
  {
    day: 9,
    date: '22 Sep',
    marathiDate: '२२ सप्टें',
    fullDate: '22 Sept 2026',
    tithi: 'नवमी',
    marathiLabel: '२२ सप्टें • मंगळवार',
    defaultTitle: 'Event will be announced soon',
    defaultMarathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल'
  },
  {
    day: 10,
    date: '23 Sep',
    marathiDate: '२३ सप्टें',
    fullDate: '23 Sept 2026',
    tithi: 'दशमी',
    marathiLabel: '२३ सप्टें • बुधवार',
    defaultTitle: 'Event will be announced soon',
    defaultMarathiTitle: '🔸 कार्यक्रम लवकरच कळवण्यात येईल'
  },
  {
    day: 11,
    date: '24 Sep',
    marathiDate: '२४ सप्टें',
    fullDate: '24 Sept 2026',
    tithi: 'एकादशी',
    marathiLabel: '२४ सप्टें • गुरुवार',
    defaultTitle: 'Mangla Gauri',
    defaultMarathiTitle: '🌺 Mangla Gauri'
  },
  {
    day: 12,
    date: '25 Sep',
    marathiDate: '२५ सप्टें',
    fullDate: '25 Sept 2026',
    tithi: 'अनंत चतुर्दशी (विसर्जन)',
    marathiLabel: '२५ सप्टें • शुक्रवार',
    defaultTitle: 'Satyanarayan Pooja, Mahaprasad & Miravnuk / Visarjan',
    defaultMarathiTitle: '🙏 सत्यनारायण पूजा • 🍛 महाप्रसाद • 🪔 Miravnuk & Visarjan'
  }
];

export function getFestivalDayInfo(dayNumber) {
  const num = Number(dayNumber) || 1;
  return FESTIVAL_DAYS_CONFIG.find((d) => d.day === num) || {
    day: num,
    date: `${13 + num} Sep`,
    marathiDate: `${13 + num} सप्टें`,
    fullDate: `${13 + num} Sept 2026`,
    tithi: `दिवस ${num}`,
    marathiLabel: `उत्सव दिवस ${num}`,
    defaultTitle: 'Cultural Performance',
    defaultMarathiTitle: 'सांस्कृतिक कार्यक्रम'
  };
}
