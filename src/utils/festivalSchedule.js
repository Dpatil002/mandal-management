export const FESTIVAL_DAYS_CONFIG = [
  {
    day: 1,
    date: '14 Sep',
    marathiDate: '१४ सप्टें',
    fullDate: '14 Sept 2026',
    tithi: 'गणेश चतुर्थी (स्थापना)',
    marathiLabel: '१४ सप्टें • गणेश चतुर्थी',
    defaultTitle: 'Ganesh Stapan & Atharvashirsha Pathan',
    defaultMarathiTitle: 'गणेश स्थापना व सामूहिक अथर्वशीर्ष पठण'
  },
  {
    day: 2,
    date: '15 Sep',
    marathiDate: '१५ सप्टें',
    fullDate: '15 Sept 2026',
    tithi: 'ऋषीपंचमी',
    marathiLabel: '१५ सप्टें • ऋषीपंचमी',
    defaultTitle: 'Drawing & Modak Making Competition',
    defaultMarathiTitle: 'बाल चित्रकला व पर्यावरणपूरक मोदक स्पर्धा'
  },
  {
    day: 3,
    date: '16 Sep',
    marathiDate: '१६ सप्टें',
    fullDate: '16 Sept 2026',
    tithi: 'तृतीया',
    marathiLabel: '१६ सप्टें • तृतीया',
    defaultTitle: 'Mahila Bhajan Mandal & Traditional Songs',
    defaultMarathiTitle: 'महिला भजन मंडळ व पारंपरिक भक्तीगीते'
  },
  {
    day: 4,
    date: '17 Sep',
    marathiDate: '१७ सप्टें',
    fullDate: '17 Sept 2026',
    tithi: 'चतुर्थी',
    marathiLabel: '१७ सप्टें • चतुर्थी',
    defaultTitle: 'Children Dance, Drama & Skits',
    defaultMarathiTitle: 'बाल गोपाळ नृत्य, नाटिका व कलाविष्कार'
  },
  {
    day: 5,
    date: '18 Sep',
    marathiDate: '१८ सप्टें',
    fullDate: '18 Sept 2026',
    tithi: 'पंचमी',
    marathiLabel: '१८ सप्टें • पंचमी',
    defaultTitle: 'Musical Night & Classical Sugam Sangeet',
    defaultMarathiTitle: 'सुगम संगीत संध्या व वाद्यवृंद'
  },
  {
    day: 6,
    date: '19 Sep',
    marathiDate: '१९ सप्टें',
    fullDate: '19 Sept 2026',
    tithi: 'षष्ठी • गौरी आगमन',
    marathiLabel: '१९ सप्टें • गौरी आगमन',
    defaultTitle: 'Fancy Dress Competition (Historical & Saints)',
    defaultMarathiTitle: 'भव्य वेशभूषा स्पर्धा (संत व क्रांतिकारक)'
  },
  {
    day: 7,
    date: '20 Sep',
    marathiDate: '२० सप्टें',
    fullDate: '20 Sept 2026',
    tithi: 'सप्तमी • गौरी पूजन',
    marathiLabel: '२० सप्टें • गौरी पूजन',
    defaultTitle: 'Family Antakshari & Fun Cultural Games',
    defaultMarathiTitle: 'कौटुंबिक अंताक्षरी व सांस्कृतिक खेळ'
  },
  {
    day: 8,
    date: '21 Sep',
    marathiDate: '२१ सप्टें',
    fullDate: '21 Sept 2026',
    tithi: 'अष्टमी • गौरी विसर्जन',
    marathiLabel: '२१ सप्टें • गौरी विसर्जन',
    defaultTitle: 'Dhol-Tasha & Traditional Lezim Showcase',
    defaultMarathiTitle: 'ढोल-ताशा व पारंपरिक लेझीम प्रात्यक्षिक'
  },
  {
    day: 9,
    date: '22 Sep',
    marathiDate: '२२ सप्टें',
    fullDate: '22 Sept 2026',
    tithi: 'नवमी',
    marathiLabel: '२२ सप्टें • नवमी',
    defaultTitle: 'Shree Satyanarayan Pooja & Bhajan Sandhya',
    defaultMarathiTitle: 'श्री सत्यनारायण महापूजा व महाप्रसाद'
  },
  {
    day: 10,
    date: '23 Sep',
    marathiDate: '२३ सप्टें',
    fullDate: '23 Sept 2026',
    tithi: 'दशमी',
    marathiLabel: '२३ सप्टें • दशमी',
    defaultTitle: 'Mega Drama & Cultural Orchestra',
    defaultMarathiTitle: 'महा-नाट्य व संगीत रजनी'
  },
  {
    day: 11,
    date: '25 Sep',
    marathiDate: '२५ सप्टें',
    fullDate: '25 Sept 2026',
    tithi: 'अनंत चतुर्दशी (विसर्जन)',
    marathiLabel: '२५ सप्टें • अनंत चतुर्दशी (विसर्जन)',
    defaultTitle: 'Grand Farewell Miravnuk & Visarjan Aarti',
    defaultMarathiTitle: 'भव्य विसर्जन मिरवणूक व निरोप आरती'
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
