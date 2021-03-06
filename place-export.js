USER_TOKEN = localStorage.getItem('access_token');
OPTIONS_FOR_GET = {
  method: 'GET',
  headers: { Authorization: 'Bearer ' + USER_TOKEN, 'content-type': 'application/json' }
};
DEPLOYMENT_URL = 'https://script.google.com/macros/s/AKfycbwIjlUrJNLXJ4xqPRPtzbghuRH4KnbFmCZ70KKO5hTiwlhgZ9y_v4FgdtscUXQQBnQRMw/exec';

/* lameify(); */

async function lameify() {
  let chosenPlaceId;
  while(true){
    chosenPlaceId = prompt('Input place ID to make spreadsheet.');
    if (!chosenPlaceId) { return }
    if (/^\d{1,6}$/.test(chosenPlaceId)) { break }
    if (/^\d+$/.test(chosenPlaceId)) {
      alert('Too long.');
    }
    else{
        alert('Numbers only, please.');
    }
  }

  let spinner = appendSpinner();

  /* Fetch general info */
  /* # */ spinner.querySelector('p').textContent = 'Fetching place details...';
  let placeDetails = await fetchPlaceDetails(chosenPlaceId);

  if (placeDetails == -1) {
    closeSpinner(spinner);
    alert(`Place ${chosenPlaceId} not found.`);
    return
  }

  let fullPlaceName = `${placeDetails.place_id}. ${placeDetails.place_info.title}`;



  /* Check if already exists */
  /* # */ spinner.querySelector('p').textContent = 'Checking existing files...';
  let preExistingSheetUrl = await fetchPreExistingSheet(chosenPlaceId);
  if (preExistingSheetUrl != -1) {
    console.log(preExistingSheetUrl);
    showResultPre(preExistingSheetUrl, spinner);
    return
  }


  /* Fetch pages */
  let promises = [];
  let i = 0;
  for (let item of placeDetails.item) {
    i++;
    /* # */ spinner.querySelector('p').textContent = `Working on image ${i} / ${placeDetails.item.length}`;
    let promise = await fetchItem(item.item_id);
    promises.push(promise);
  }


  let pages = await Promise.all(promises).then(results => { return results } ).catch(error => console.log(`Error in promises ${error}`));
  if (!pages.length) {
    closeSpinner(spinner);
    alert(`No images found for ${chosenPlaceId}`);
    return
  }

  let activePages = pages.filter( p => p.status == 'Y');
  if (!activePages.length) {
    closeSpinner(spinner);
    alert(`Place ${chosenPlaceId} has no active images`);
    return
  }

  let simplifiedData = simplifyData(placeDetails, activePages);
  console.log(simplifiedData);
  
  requestSheet(simplifiedData);
  /* # */ spinner.querySelector('p').innerHTML = 'Making spreadsheet...<br>(May take a while)';


  function requestSheet(data) {
    let sData = JSON.stringify(data);
  
    let options = {
      method: 'POST',
      body: sData,
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }
    };
  
    fetch(DEPLOYMENT_URL, options)
    .then(response => {
      if (!response.ok) { throw new Error(`Request failed with status ${response.status}`) }
      return response.text();
    })
    .then(responseAsText => {

      showResultNew(responseAsText, spinner);

    })
    .catch(error => {
      console.log(error);
      closeSpinner(spinner);
      alert(error);
    });
  }


  async function fetchPreExistingSheet(placeId) {
    let url = DEPLOYMENT_URL + '?' + placeId;

    try {
      let response = await fetch(url, {method: 'GET'});
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
      }
      return await response.text();
    } 
    
    catch(err) {
      console.log(err);
      return -1
    }


  }
  
  async function fetchPlaceDetails(id) {
    let url = `https://a3-prod.flit.to:1443/v2/qr-place/places/${id}?place_id=${id}&_method=GET`;
    
    try {
      let response = await fetch(url, OPTIONS_FOR_GET);
      if (!response.ok) {
        const message = `An error has occured: ${response.status}`;
        throw new Error(message);
      }
      return await response.json();
    } 
    
    catch(err) {
      console.log(err);
      return -1
    }
  
  }

  async function fetchItem(itemId) {
    let itemUrl = `https://a3-prod.flit.to:1443/v2/qr-place/items/${itemId}?_method=GET`;
    let response = await fetch(itemUrl, OPTIONS_FOR_GET);
    let json = await response.json();
    return json
  }

  function showResultNew(sheetId, displayElement) {
    let newUrl = `https://docs.google.com/spreadsheets/d/${sheetId}`;

    displayElement.innerHTML = `
    <div style="width: 100%; display: flex; justify-content: end;">
      <button onclick="closeSpinner(this)" style="border:0;background-color:transparent;">x</button>
    </div>
    <div style="flex-grow: 1; display: grid; place-items: center; margin-bottom: 1rem;">
    <a href="${newUrl}" target="_blank" style="text-decoration:underline;">${fullPlaceName}</a>
    </div>
    `
  }

  function showResultPre(preExistingSheetUrl, displayElement) {
    displayElement.innerHTML = `
    <div style="width: 100%; display: flex; justify-content: end;">
      <button onclick="closeSpinner(this)" style="border:0;background-color:transparent;">x</button>
    </div>
    <div style="flex-grow: 1; display: grid; place-items: center; margin-bottom: 1rem;">
    <a href="${preExistingSheetUrl}" target="_blank" style="text-decoration:underline;">${fullPlaceName}</a>
    <s style="text-decoration:none;">(????????????)</s>
    </div>
    `
  }
}






function appendSpinner() {
  /* Make container for all spinners */
  if (!document.getElementById('spinners-wrap')) { 
    let wrap = Object.assign(document.createElement('div'), {
      id: 'spinners-wrap',
      style: 'z-index: 3001; min-width: 200px; display: flex; flex-direction: column; gap: 5px; position: fixed; top: 5px; right: 5px; background-color: white; border: 5px solid lightgray; padding: 5px;">',
    });
    document.body.append(wrap);
  }

  /* Make each spinner */
  let spinner = Object.assign(document.createElement('div'), {
    classList: 'spinner',
    style: 'position: relative; display: flex; flex-direction:column; align-items:center; justify-content:center; background-color: whitesmoke; padding: 5px;',
    innerHTML: `
      <!-- https://loading.io/css/ -->
      <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
      <p style="text-align:center">Getting ready...</p>
    `,
  });
  document.getElementById('spinners-wrap').append(spinner);

  /* Animate spinner */
  if (document.getElementById('spinner-styleSheet')) { return spinner }

  let styleSheet = Object.assign(document.createElement('style'), {
  id: 'spinner-styleSheet',
  textContent: `
    /* https://loading.io/css/ */
    .lds-ring {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
    .lds-ring div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      margin: 8px;
      border: 8px solid steelblue;
      border-radius: 50%;
      animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: steelblue transparent transparent transparent;
    }
    .lds-ring div:nth-child(1) {
      animation-delay: -0.45s;
    }
    .lds-ring div:nth-child(2) {
      animation-delay: -0.3s;
    }
    .lds-ring div:nth-child(3) {
      animation-delay: -0.15s;
    }
    @keyframes lds-ring {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,
  });
  document.head.appendChild(styleSheet);

  return spinner

}

function closeSpinner(element) {
    element.closest('.spinner').remove();
    const wrap = document.getElementById('spinners-wrap');
    if (wrap.childNodes.length == 0) {
        wrap.remove();
    }
}


function simplifyData(placeDetails, pages) {
    const flittoLangs = {
      "1": "Afrikaans(Afrikaans)",
      "2": "Albanian(gjuha shqipe)",
      "3": "Arabic(??????????????)",
      "4": "Armenian(??????????????)",
      "5": "Azerbaijani(az??rbaycan dili)",
      "6": "Belarusian(???????????????????? ????????)",
      "7": "Bengali(???????????????)",
      "8": "Bosnian(bosanski jezik)",
      "9": "Bulgarian(?????????????????? ????????)",
      "10": "Catalan(catal??, valenci??)",
      "11": "Chinese (Simplified)(??????(??????))",
      "12": "Chinese (Traditional)(??????(??????))",
      "13": "Croatian(hrvatski jezik)",
      "14": "Czech(??e??tina)",
      "15": "Danish(dansk)",
      "16": "Dutch(Nederlands)",
      "17": "English(English)",
      "18": "Estonian(eesti, eesti keel)",
      "19": "Finnish(suomi)",
      "20": "French(Fran??ais)",
      "21": "Georgian(?????????????????????)",
      "22": "German(Deutsch)",
      "23": "Greek(????????????????)",
      "24": "Hebrew(??????????)",
      "25": "Hindi(??????????????????, ???????????????)",
      "26": "Hungarian(magyar)",
      "27": "Indonesian(Bahasa Indonesia)",
      "28": "Icelandic(??slenska)",
      "29": "Italian(Italiano)",
      "30": "Japanese(?????????)",
      "31": "Kazakh(?????????? ????????)",
      "32": "Khmer(???????????????, ????????????????????????, ???????????????????????????)",
      "33": "Korean(?????????)",
      "34": "Lao(?????????????????????)",
      "35": "Lithuanian(lietuvi?? kalba)",
      "36": "Latvian(latvie??u valoda)",
      "37": "Macedonian(???????????????????? ??????????)",
      "38": "Malay(Bahasa Melayu)",
      "39": "Maltese(Malti)",
      "40": "Mongolian(????????????)",
      "41": "Norwegian Bokm??l(Norsk bokm??l)",
      "42": "Punjabi(??????????????????, ???????????????)",
      "43": "Persian(??????????)",
      "44": "Polish(Polski)",
      "45": "Portuguese(Portugu??s)",
      "46": "Romansh(rumantsch grischun)",
      "47": "Romanian(limba rom??n??, limba moldoveneasc??)",
      "48": "Russian(?????????????? ????????)",
      "49": "Serbian(???????????? ??????????)",
      "50": "Slovak(sloven??ina, slovensk?? jazyk)",
      "51": "Slovene(slovenski jezik, sloven????ina)",
      "52": "Spanish(Espa??ol)",
      "53": "Swedish(Svenska)",
      "54": "Tamil(???????????????)",
      "55": "Tajik(????????????, to??ik??, ???????????????)",
      "56": "Thai(?????????)",
      "57": "Turkish(T??rk??e)",
      "58": "Ukrainian(???????????????????? ????????)",
      "59": "Urdu(????????)",
      "60": "Uzbek(O'zbek, ??????????, ???????????????)",
      "61": "Vietnamese(Ti???ng Vi???t)",
      "62": "Tagalog(Tagalog)",
      "63": "Swahili(Kiswahili)",
      "64": "English(British)(English(British))",
      "65": "Spanish(Latin America)(Espa??ol(Latinoam??rica))",
      "66": "Portuguese(Brazil)(Portugu??s(Brasil))",
      "67": "French(Canada)(fran??ais(canadien))",
      "68": "Burmese(Burmese)",
      "69": "Chinese (Cantonese)(??????(?????????))",
      "Afrikaans(Afrikaans)": 1,
      "Albanian(gjuha shqipe)": 2,
      "Arabic(??????????????)": 3,
      "Armenian(??????????????)": 4,
      "Azerbaijani(az??rbaycan dili)": 5,
      "Belarusian(???????????????????? ????????)": 6,
      "Bengali(???????????????)": 7,
      "Bosnian(bosanski jezik)": 8,
      "Bulgarian(?????????????????? ????????)": 9,
      "Catalan(catal??, valenci??)": 10,
      "Chinese (Simplified)(??????(??????))": 11,
      "Chinese (Traditional)(??????(??????))": 12,
      "Croatian(hrvatski jezik)": 13,
      "Czech(??e??tina)": 14,
      "Danish(dansk)": 15,
      "Dutch(Nederlands)": 16,
      "English(English)": 17,
      "Estonian(eesti, eesti keel)": 18,
      "Finnish(suomi)": 19,
      "French(Fran??ais)": 20,
      "Georgian(?????????????????????)": 21,
      "German(Deutsch)": 22,
      "Greek(????????????????)": 23,
      "Hebrew(??????????)": 24,
      "Hindi(??????????????????, ???????????????)": 25,
      "Hungarian(magyar)": 26,
      "Indonesian(Bahasa Indonesia)": 27,
      "Icelandic(??slenska)": 28,
      "Italian(Italiano)": 29,
      "Japanese(?????????)": 30,
      "Kazakh(?????????? ????????)": 31,
      "Khmer(???????????????, ????????????????????????, ???????????????????????????)": 32,
      "Korean(?????????)": 33,
      "Lao(?????????????????????)": 34,
      "Lithuanian(lietuvi?? kalba)": 35,
      "Latvian(latvie??u valoda)": 36,
      "Macedonian(???????????????????? ??????????)": 37,
      "Malay(Bahasa Melayu)": 38,
      "Maltese(Malti)": 39,
      "Mongolian(????????????)": 40,
      "Norwegian Bokm??l(Norsk bokm??l)": 41,
      "Punjabi(??????????????????, ???????????????)": 42,
      "Persian(??????????)": 43,
      "Polish(Polski)": 44,
      "Portuguese(Portugu??s)": 45,
      "Romansh(rumantsch grischun)": 46,
      "Romanian(limba rom??n??, limba moldoveneasc??)": 47,
      "Russian(?????????????? ????????)": 48,
      "Serbian(???????????? ??????????)": 49,
      "Slovak(sloven??ina, slovensk?? jazyk)": 50,
      "Slovene(slovenski jezik, sloven????ina)": 51,
      "Spanish(Espa??ol)": 52,
      "Swedish(Svenska)": 53,
      "Tamil(???????????????)": 54,
      "Tajik(????????????, to??ik??, ???????????????)": 55,
      "Thai(?????????)": 56,
      "Turkish(T??rk??e)": 57,
      "Ukrainian(???????????????????? ????????)": 58,
      "Urdu(????????)": 59,
      "Uzbek(O'zbek, ??????????, ???????????????)": 60,
      "Vietnamese(Ti???ng Vi???t)": 61,
      "Tagalog(Tagalog)": 62,
      "Swahili(Kiswahili)": 63,
      "English(British)(English(British))": 64,
      "Spanish(Latin America)(Espa??ol(Latinoam??rica))": 65,
      "Portuguese(Brazil)(Portugu??s(Brasil))": 66,
      "French(Canada)(fran??ais(canadien))": 67,
      "Burmese(Burmese)": 68,
      "Chinese (Cantonese)(??????(?????????))": 69
    };
  
    let targetLangs = placeDetails.place_lang_pair.reduce((prev, curr) => { 
      return [...prev, flittoLangs[curr.dst_lang_id]]
    }, []);
    targetLangs.sort();
    
    let sortedLangIds = targetLangs.map( lang => flittoLangs[lang] );
  
    let simple = {
      placeName: placeDetails.place_info.title,
      placeId: placeDetails.place_info.place_id,
      mainImageUrl: placeDetails.place_image[0].image_url,
      langs: targetLangs,
    };
  
    let simplePages = pages.map(p => {
      return {
        pageId: p.item_id,
        imageUrl: p.image_url,
        segments:
          /* 1. If segment is empty, wrap in 2d array, as required by Google Sheets */
          (!p.item_org.length) ? [['']]
  
          : p.item_org.reduce((prev, seg) => {
  
              /* 2. Filter out ????????? items (status = 'D'), leaving only ?????? ?????? (status = 'Y') */
              if (seg.status != 'Y') { return prev }
  
              /* 3. Get "id", "source language", and "content" columns */
              let sourceInfo = [seg.item_org_id, flittoLangs[seg.lang_id], seg.content];
  
              /* 4. Get translations sorted alphabetically by target language, by looping through lang ids */
              let sortableTranslations = seg.item_tr;
              let sortedTranslations = sortedLangIds.reduce((prev, currLangId) => {
                let matchingIndex = sortableTranslations.findIndex( tr => tr.lang_id == currLangId );
                let content = (matchingIndex == -1) ? '': sortableTranslations[matchingIndex].content;
                return [...prev, content]
              }, new Array);
  
              let rowInfo = [...sourceInfo, ...sortedTranslations];
  
              return [...prev, rowInfo];
  
          }, new Array)
  
          /* 5. Sort in ascending order by id */
          .sort((a, b) => {
              return a[0] - b[0]
          }),
  
      }
    });
  
    simple.menuPages = simplePages;
  
    return simple
  
  }



